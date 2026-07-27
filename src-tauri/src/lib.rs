mod spotify;

use spotify::{Playback, SpotifyState, SpotifyStatus};
use std::fs;
use tauri::{Manager, State, WebviewWindow};

#[tauri::command]
fn window_minimize(window: WebviewWindow) -> Result<(), String> {
    window
        .minimize()
        .map_err(|error| format!("Could not minimize the window: {error}"))
}

#[tauri::command]
fn window_toggle_maximize(window: WebviewWindow) -> Result<bool, String> {
    let maximized = window
        .is_maximized()
        .map_err(|error| format!("Could not read the window state: {error}"))?;
    if maximized {
        window
            .unmaximize()
            .map_err(|error| format!("Could not restore the window: {error}"))?;
    } else {
        window
            .maximize()
            .map_err(|error| format!("Could not maximize the window: {error}"))?;
    }
    Ok(!maximized)
}

#[tauri::command]
fn window_close(window: WebviewWindow) -> Result<(), String> {
    window
        .close()
        .map_err(|error| format!("Could not close the window: {error}"))
}

#[tauri::command]
fn open_spotify_dashboard() -> Result<(), String> {
    webbrowser::open("https://developer.spotify.com/dashboard")
        .map_err(|error| format!("Could not open the Spotify developer dashboard: {error}"))
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

#[tauri::command]
async fn spotify_control(
    state: State<'_, SpotifyState>,
    action: String,
) -> Result<(), String> {
    state.control(&action).await
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
            window_toggle_maximize,
            window_close,
            open_spotify_dashboard,
            spotify_status,
            spotify_set_client_id,
            spotify_connect,
            spotify_disconnect,
            spotify_playback,
            spotify_control
        ])
        .run(tauri::generate_context!())
        .expect("error while running echomoss");
}
