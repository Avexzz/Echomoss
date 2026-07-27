import { invoke, isTauri } from "@tauri-apps/api/core";

export function isNativeRuntime(): boolean {
  return isTauri();
}

export async function invokeNative<T>(
  command: string,
  args?: Record<string, unknown>,
): Promise<T> {
  if (!isNativeRuntime()) {
    throw new Error("This action is available in the native echomoss app.");
  }
  return invoke<T>(command, args);
}

export async function openSpotifyDashboard(): Promise<void> {
  if (isNativeRuntime()) {
    await invokeNative<void>("open_spotify_dashboard");
    return;
  }
  window.open(
    "https://developer.spotify.com/dashboard",
    "_blank",
    "noopener,noreferrer",
  );
}
