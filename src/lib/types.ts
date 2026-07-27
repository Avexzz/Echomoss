export type VisualState = "dormant" | "playing" | "transition" | "bloom";
export type PlaybackAction = "play" | "pause" | "next" | "previous";

export interface Playback {
  id: string;
  type: string;
  title: string;
  artist: string;
  album: string;
  coverUrl: string | null;
  durationMs: number;
  progressMs: number;
  isPlaying: boolean;
  deviceName: string;
  fetchedAt: number;
}

export interface SpotifyStatus {
  configured: boolean;
  connected: boolean;
  persistent: boolean;
  redirectUri: string;
  clientIdHint: string | null;
}

export interface GardenStats {
  blooms: number;
  listeningSeconds: number;
  discoveredSpecies: number[];
}

export interface PlaybackController {
  mode: "demo" | "spotify";
  playback: Playback | null;
  status: SpotifyStatus | null;
  loading: boolean;
  error: string | null;
  setClientId: (clientId: string) => Promise<void>;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  control: (action: PlaybackAction) => Promise<void>;
}
