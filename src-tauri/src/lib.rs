mod spotify;

use spotify::{Playback, SpotifyState, SpotifyStatus};
use std::{fs, process::Command};
use tauri::{Manager, State, WebviewWindow};

#[tauri::command]
fn window_minimize(window: WebviewWindow) -> Result<(), String> {
    window
        .minimize()
        .map_err(|error| format!("Could not minimize the window: {error}"))
}

#[tauri::command]
fn window_close(window: WebviewWindow) -> Result<(), String> {
    window
        .close()
        .map_err(|error| format!("Could not close the window: {error}"))
}

#[tauri::command]
fn open_spotify_dashboard() -> Result<(), String> {
    open_url("https://developer.spotify.com/dashboard")
}

#[tauri::command]
fn spotify_status(state: State<'_, SpotifyState>) -> Result<SpotifyStatus, String> {
    state.status()
}

#[tauri::command]
fn spotify_set_client_id(
    state: State<'_, SpotifyState>,
    client_id: String,
) -> Result<SpotifyStatus, String> {
    state.set_client_id(client_id)
}

#[tauri::command]
async fn spotify_connect(
    state: State<'_, SpotifyState>,
) -> Result<SpotifyStatus, String> {
    state.connect().await
}

#[tauri::command]
fn spotify_disconnect(state: State<'_, SpotifyState>) -> Result<SpotifyStatus, String> {
    state.disconnect()
}

#[tauri::command]
async fn spotify_playback(
    state: State<'_, SpotifyState>,
) -> Result<Option<Playback>, String> {
    state.playback().await
}

pub(crate) fn open_url(url: &str) -> Result<(), String> {
    if !url.starts_with("https://") {
        return Err("Only secure web addresses can be opened.".into());
    }

    #[cfg(target_os = "windows")]
    let result = Command::new("rundll32")
        .arg("url.dll,FileProtocolHandler")
        .arg(url)
        .spawn();

    #[cfg(target_os = "macos")]
    let result = Command::new("open").arg(url).spawn();

    #[cfg(all(unix, not(target_os = "macos")))]
    let result = Command::new("xdg-open").arg(url).spawn();

    result
        .map(|_| ())
        .map_err(|error| format!("Could not open the secure web page: {error}"))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let config_dir = app.path().app_config_dir()?;
            fs::create_dir_all(&config_dir)?;
            app.manage(SpotifyState::new(config_dir));
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            window_minimize,
            window_close,
            open_spotify_dashboard,
            spotify_status,
            spotify_set_client_id,
            spotify_connect,
            spotify_disconnect,
            spotify_playback
        ])
        .run(tauri::generate_context!())
        .expect("error while running echomoss");
}
