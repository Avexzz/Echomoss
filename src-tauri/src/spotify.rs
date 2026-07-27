use base64::{engine::general_purpose::URL_SAFE_NO_PAD, Engine as _};
use keyring::Entry;
use rand::{rngs::OsRng, RngCore};
use reqwest::{Client, Method, StatusCode};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use sha2::{Digest, Sha256};
use std::{
    fs,
    path::{Path, PathBuf},
    sync::Mutex,
    time::{Duration, SystemTime, UNIX_EPOCH},
};
use tiny_http::{Header, Request, Response, Server, StatusCode as TinyStatusCode};
use url::Url;

const AUTHORIZE_URL: &str = "https://accounts.spotify.com/authorize";
const TOKEN_URL: &str = "https://accounts.spotify.com/api/token";
const API_URL: &str = "https://api.spotify.com/v1";
const CALLBACK_PORT: u16 = 43_821;
const CALLBACK_URL: &str = "http://127.0.0.1:43821/callback";
const KEYRING_SERVICE: &str = "dev.echomoss.app";
const KEYRING_ACCOUNT: &str = "spotify-session";
const SCOPES: &str =
    "user-read-playback-state user-read-currently-playing user-modify-playback-state";

#[derive(Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TokenData {
    access_token: String,
    refresh_token: String,
    expires_at: u64,
}

#[derive(Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct SpotifyConfig {
    client_id: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SpotifyStatus {
    configured: bool,
    connected: bool,
    persistent: bool,
    redirect_uri: &'static str,
    client_id_hint: Option<String>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Playback {
    id: String,
    r#type: String,
    title: String,
    artist: String,
    album: String,
    cover_url: Option<String>,
    duration_ms: u64,
    progress_ms: u64,
    is_playing: bool,
    device_name: String,
    fetched_at: u64,
}

#[derive(Deserialize)]
struct TokenResponse {
    access_token: String,
    refresh_token: Option<String>,
    expires_in: u64,
}

struct AuthorizationCode {
    code: String,
}

pub struct SpotifyState {
    client: Client,
    tokens: Mutex<Option<TokenData>>,
    config_dir: PathBuf,
}

impl SpotifyState {
    pub fn new(config_dir: PathBuf) -> Self {
        Self {
            client: Client::builder()
                .user_agent("echomoss/0.2")
                .build()
                .expect("HTTP client could not be created"),
            tokens: Mutex::new(load_tokens()),
            config_dir,
        }
    }

    fn config_path(&self) -> PathBuf {
        self.config_dir.join("spotify.json")
    }

    fn config(&self) -> SpotifyConfig {
        read_config(&self.config_path())
    }

    fn token_snapshot(&self) -> Result<Option<TokenData>, String> {
        self.tokens
            .lock()
            .map(|guard| guard.clone())
            .map_err(|_| "The local Spotify session lock was poisoned.".to_string())
    }

    fn replace_tokens(&self, tokens: Option<TokenData>) -> Result<(), String> {
        let mut guard = self
            .tokens
            .lock()
            .map_err(|_| "The local Spotify session lock was poisoned.".to_string())?;
        *guard = tokens;
        Ok(())
    }

    fn persist_tokens(&self, tokens: &TokenData) -> Result<(), String> {
        let serialized = serde_json::to_string(tokens)
            .map_err(|error| format!("Could not serialize the Spotify session: {error}"))?;
        credential_entry()?
            .set_password(&serialized)
            .map_err(|error| format!("Could not save the session in the OS credential vault: {error}"))
    }

    fn clear_tokens(&self) -> Result<(), String> {
        if let Ok(entry) = credential_entry() {
            let _ = entry.delete_credential();
        }
        self.replace_tokens(None)
    }

    pub fn status(&self) -> Result<SpotifyStatus, String> {
        let config = self.config();
        let connected = self.token_snapshot()?.is_some();
        let client_id_hint = match config.client_id.len() {
            8.. => Some(format!(
                "{}…{}",
                &config.client_id[..4],
                &config.client_id[config.client_id.len() - 4..]
            )),
            1.. => Some("configured".to_string()),
            _ => None,
        };

        Ok(SpotifyStatus {
            configured: !config.client_id.is_empty(),
            connected,
            persistent: credential_entry().is_ok(),
            redirect_uri: CALLBACK_URL,
            client_id_hint,
        })
    }

    pub fn set_client_id(&self, client_id: String) -> Result<SpotifyStatus, String> {
        let clean = client_id.trim();
        if !(16..=64).contains(&clean.len())
            || !clean.chars().all(|character| character.is_ascii_alphanumeric())
        {
            return Err("Enter the Client ID from your Spotify developer dashboard.".into());
        }

        let previous = self.config();
        if !previous.client_id.is_empty() && previous.client_id != clean {
            self.clear_tokens()?;
        }
        write_config(
            &self.config_path(),
            &SpotifyConfig {
                client_id: clean.to_string(),
            },
        )?;
        self.status()
    }

    pub async fn connect(&self) -> Result<SpotifyStatus, String> {
        let config = self.config();
        if config.client_id.is_empty() {
            return Err("Add a Spotify Client ID before connecting.".into());
        }

        let verifier = random_url_token(64);
        let challenge = URL_SAFE_NO_PAD.encode(Sha256::digest(verifier.as_bytes()));
        let expected_state = random_url_token(32);
        let mut authorize =
            Url::parse(AUTHORIZE_URL).map_err(|error| format!("Invalid authorization URL: {error}"))?;
        authorize
            .query_pairs_mut()
            .append_pair("response_type", "code")
            .append_pair("client_id", &config.client_id)
            .append_pair("scope", SCOPES)
            .append_pair("redirect_uri", CALLBACK_URL)
            .append_pair("code_challenge_method", "S256")
            .append_pair("code_challenge", &challenge)
            .append_pair("state", &expected_state)
            .append_pair("show_dialog", "false");

        let server = Server::http(("127.0.0.1", CALLBACK_PORT))
            .map_err(|error| format!("Could not start the local Spotify callback: {error}"))?;
        webbrowser::open(authorize.as_str())
            .map_err(|error| format!("Could not open Spotify's secure sign-in page: {error}"))?;

        let authorization = tauri::async_runtime::spawn_blocking(move || {
            wait_for_authorization(server, &expected_state)
        })
        .await
        .map_err(|error| format!("Spotify authorization task failed: {error}"))??;

        let payload = self
            .client
            .post(TOKEN_URL)
            .form(&[
                ("client_id", config.client_id.as_str()),
                ("grant_type", "authorization_code"),
                ("code", authorization.code.as_str()),
                ("redirect_uri", CALLBACK_URL),
                ("code_verifier", verifier.as_str()),
            ])
            .send()
            .await
            .map_err(|error| format!("Spotify token exchange failed: {error}"))?;

        let status = payload.status();
        let body = payload
            .text()
            .await
            .map_err(|error| format!("Spotify returned an unreadable response: {error}"))?;
        if !status.is_success() {
            return Err(spotify_error_message(status, &body));
        }

        let token: TokenResponse = serde_json::from_str(&body)
            .map_err(|error| format!("Spotify returned an invalid token response: {error}"))?;
        let tokens = TokenData {
            access_token: token.access_token,
            refresh_token: token
                .refresh_token
                .ok_or_else(|| "Spotify did not provide a reusable refresh token.".to_string())?,
            expires_at: now_ms() + token.expires_in.saturating_mul(1_000),
        };
        self.persist_tokens(&tokens)?;
        self.replace_tokens(Some(tokens))?;
        self.status()
    }

    pub fn disconnect(&self) -> Result<SpotifyStatus, String> {
        self.clear_tokens()?;
        self.status()
    }

    async fn refresh_access_token(&self) -> Result<String, String> {
        let current = self
            .token_snapshot()?
            .ok_or_else(|| "Spotify is not connected.".to_string())?;
        let config = self.config();
        if config.client_id.is_empty() {
            return Err("The Spotify Client ID is missing.".into());
        }

        let response = self
            .client
            .post(TOKEN_URL)
            .form(&[
                ("client_id", config.client_id.as_str()),
                ("grant_type", "refresh_token"),
                ("refresh_token", current.refresh_token.as_str()),
            ])
            .send()
            .await
            .map_err(|error| format!("Could not refresh the Spotify session: {error}"))?;
        let status = response.status();
        let body = response
            .text()
            .await
            .map_err(|error| format!("Spotify returned an unreadable response: {error}"))?;
        if !status.is_success() {
            return Err(spotify_error_message(status, &body));
        }

        let token: TokenResponse = serde_json::from_str(&body)
            .map_err(|error| format!("Spotify returned an invalid refresh response: {error}"))?;
        let updated = TokenData {
            access_token: token.access_token,
            refresh_token: token.refresh_token.unwrap_or(current.refresh_token),
            expires_at: now_ms() + token.expires_in.saturating_mul(1_000),
        };
        self.persist_tokens(&updated)?;
        let access_token = updated.access_token.clone();
        self.replace_tokens(Some(updated))?;
        Ok(access_token)
    }

    async fn access_token(&self) -> Result<String, String> {
        let tokens = self
            .token_snapshot()?
            .ok_or_else(|| "Spotify is not connected.".to_string())?;
        if now_ms() >= tokens.expires_at.saturating_sub(60_000) {
            self.refresh_access_token().await
        } else {
            Ok(tokens.access_token)
        }
    }

    async fn api(
        &self,
        method: Method,
        path: &str,
    ) -> Result<Option<serde_json::Value>, String> {
        for attempt in 0..2 {
            let access_token = if attempt == 0 {
                self.access_token().await?
            } else {
                self.refresh_access_token().await?
            };
            let response = self
                .client
                .request(method.clone(), format!("{API_URL}{path}"))
                .bearer_auth(access_token)
                .send()
                .await
                .map_err(|error| format!("Spotify request failed: {error}"))?;

            if response.status() == StatusCode::UNAUTHORIZED && attempt == 0 {
                continue;
            }
            if response.status() == StatusCode::NO_CONTENT {
                return Ok(None);
            }

            let status = response.status();
            let body = response
                .text()
                .await
                .map_err(|error| format!("Spotify returned an unreadable response: {error}"))?;
            if !status.is_success() {
                return Err(spotify_error_message(status, &body));
            }
            return serde_json::from_str(&body)
                .map(Some)
                .map_err(|error| format!("Spotify returned invalid JSON: {error}"));
        }
        Err("Spotify rejected the refreshed session.".into())
    }

    pub async fn playback(&self) -> Result<Option<Playback>, String> {
        let Some(payload) = self.api(Method::GET, "/me/player").await? else {
            return Ok(None);
        };
        let Some(item) = payload.get("item").filter(|value| !value.is_null()) else {
            return Ok(None);
        };

        let images = item
            .pointer("/album/images")
            .or_else(|| item.get("images"))
            .and_then(Value::as_array);
        let cover_url = images
            .and_then(|entries| entries.first())
            .and_then(|entry| entry.get("url"))
            .and_then(Value::as_str)
            .map(ToString::to_string);
        let artist = item
            .get("artists")
            .and_then(Value::as_array)
            .map(|artists| {
                artists
                    .iter()
                    .filter_map(|artist| artist.get("name").and_then(Value::as_str))
                    .collect::<Vec<_>>()
                    .join(", ")
            })
            .filter(|value| !value.is_empty())
            .or_else(|| {
                item.pointer("/show/publisher")
                    .and_then(Value::as_str)
                    .map(ToString::to_string)
            })
            .unwrap_or_else(|| "Unknown artist".to_string());

        Ok(Some(Playback {
            id: string_at(item, "id")
                .or_else(|| string_at(item, "uri"))
                .unwrap_or_else(|| "unknown-item".to_string()),
            r#type: string_at(item, "type").unwrap_or_else(|| "track".to_string()),
            title: string_at(item, "name").unwrap_or_else(|| "Untitled".to_string()),
            artist,
            album: item
                .pointer("/album/name")
                .or_else(|| item.pointer("/show/name"))
                .and_then(Value::as_str)
                .unwrap_or_default()
                .to_string(),
            cover_url,
            duration_ms: item
                .get("duration_ms")
                .and_then(Value::as_u64)
                .unwrap_or_default(),
            progress_ms: payload
                .get("progress_ms")
                .and_then(Value::as_u64)
                .unwrap_or_default(),
            is_playing: payload
                .get("is_playing")
                .and_then(Value::as_bool)
                .unwrap_or(false),
            device_name: payload
                .pointer("/device/name")
                .and_then(Value::as_str)
                .unwrap_or("Spotify")
                .to_string(),
            fetched_at: now_ms(),
        }))
    }

    pub async fn control(&self, action: &str) -> Result<(), String> {
        let (method, path) = match action {
            "play" => (Method::PUT, "/me/player/play"),
            "pause" => (Method::PUT, "/me/player/pause"),
            "next" => (Method::POST, "/me/player/next"),
            "previous" => (Method::POST, "/me/player/previous"),
            _ => return Err("Unknown playback command.".into()),
        };
        self.api(method, path).await?;
        Ok(())
    }
}

fn wait_for_authorization(
    server: Server,
    expected_state: &str,
) -> Result<AuthorizationCode, String> {
    let request = server
        .recv_timeout(Duration::from_secs(180))
        .map_err(|error| format!("Spotify callback failed: {error}"))?
        .ok_or_else(|| "Spotify connection timed out. Try again.".to_string())?;
    parse_authorization_request(request, expected_state)
}

fn parse_authorization_request(
    request: Request,
    expected_state: &str,
) -> Result<AuthorizationCode, String> {
    let callback = Url::parse(&format!("http://127.0.0.1{}", request.url()))
        .map_err(|error| format!("Spotify returned an invalid callback URL: {error}"))?;
    let code = callback
        .query_pairs()
        .find(|(key, _)| key == "code")
        .map(|(_, value)| value.into_owned());
    let returned_state = callback
        .query_pairs()
        .find(|(key, _)| key == "state")
        .map(|(_, value)| value.into_owned());
    let oauth_error = callback
        .query_pairs()
        .find(|(key, _)| key == "error")
        .map(|(_, value)| value.into_owned());

    let valid = request.url().starts_with("/callback")
        && oauth_error.is_none()
        && code.is_some()
        && returned_state.as_deref() == Some(expected_state);
    let (status, title, message) = if valid {
        (
            TinyStatusCode(200),
            "Terrarium connected",
            "Spotify is linked. You can close this page; echomoss will stay inside its app window.",
        )
    } else {
        (
            TinyStatusCode(400),
            "Connection failed",
            "The authorization response was invalid. Return to echomoss and try again.",
        )
    };
    let content_type = Header::from_bytes("content-type", "text/html; charset=utf-8")
        .map_err(|_| "Could not create the callback response.".to_string())?;
    let response = Response::from_string(callback_html(title, message))
        .with_status_code(status)
        .with_header(content_type);
    request
        .respond(response)
        .map_err(|error| format!("Could not finish the callback response: {error}"))?;

    if let Some(error) = oauth_error {
        return Err(format!("Spotify authorization was cancelled: {error}"));
    }
    if !valid {
        return Err("Spotify authorization failed validation.".into());
    }
    Ok(AuthorizationCode {
        code: code.expect("validated authorization code"),
    })
}

fn callback_html(title: &str, message: &str) -> String {
    format!(
        r#"<!doctype html>
<html lang="en">
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width" />
  <title>{title}</title>
  <body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#050b10;color:#d7d0bd;font-family:monospace">
    <main style="max-width:440px;padding:32px;border:1px solid #294044;background:#0a151a">
      <div style="color:#c39358;font-size:12px;letter-spacing:.2em">ECHOMOSS / SPOTIFY</div>
      <h1 style="font:22px Georgia,serif">{title}</h1>
      <p style="line-height:1.6;color:#80918c">{message}</p>
    </main>
  </body>
</html>"#
    )
}

fn credential_entry() -> Result<Entry, String> {
    Entry::new(KEYRING_SERVICE, KEYRING_ACCOUNT)
        .map_err(|error| format!("The OS credential vault is unavailable: {error}"))
}

fn load_tokens() -> Option<TokenData> {
    let serialized = credential_entry().ok()?.get_password().ok()?;
    serde_json::from_str(&serialized).ok()
}

fn read_config(path: &Path) -> SpotifyConfig {
    fs::read_to_string(path)
        .ok()
        .and_then(|contents| serde_json::from_str(&contents).ok())
        .unwrap_or_default()
}

fn write_config(path: &Path, config: &SpotifyConfig) -> Result<(), String> {
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)
            .map_err(|error| format!("Could not create the local config directory: {error}"))?;
    }
    let serialized = serde_json::to_string_pretty(config)
        .map_err(|error| format!("Could not serialize the Spotify config: {error}"))?;
    fs::write(path, serialized)
        .map_err(|error| format!("Could not save the local Spotify config: {error}"))
}

fn random_url_token(bytes: usize) -> String {
    let mut buffer = vec![0_u8; bytes];
    OsRng.fill_bytes(&mut buffer);
    URL_SAFE_NO_PAD.encode(buffer)
}

fn string_at(value: &Value, key: &str) -> Option<String> {
    value
        .get(key)
        .and_then(Value::as_str)
        .map(ToString::to_string)
}

fn spotify_error_message(status: StatusCode, body: &str) -> String {
    let payload: Value = serde_json::from_str(body).unwrap_or(Value::Null);
    let detail = payload
        .pointer("/error/message")
        .or_else(|| payload.get("error_description"))
        .and_then(Value::as_str)
        .unwrap_or("Spotify rejected the request.");
    let reason = payload
        .pointer("/error/reason")
        .and_then(Value::as_str)
        .unwrap_or_default();
    if status == StatusCode::TOO_MANY_REQUESTS && reason == "QUOTA_EXCEEDED" {
        "Spotify developer quota reached.".to_string()
    } else {
        format!("{detail} ({status})")
    }
}

fn now_ms() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis()
        .try_into()
        .unwrap_or(u64::MAX)
}
