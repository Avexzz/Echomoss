import type { Playback } from "./types";

const DEMO_TRACKS = [
  {
    id: "night-glass",
    title: "Night Glass",
    artist: "Moss Archive",
    album: "Small Weather",
    durationMs: 196_000,
  },
  {
    id: "fern-static",
    title: "Fern Static",
    artist: "Moss Archive",
    album: "Small Weather",
    durationMs: 172_000,
  },
  {
    id: "amber-after-rain",
    title: "Amber After Rain",
    artist: "Window Flora",
    album: "Quiet Circuits",
    durationMs: 214_000,
  },
] as const;

export function createDemoPlayback(index = 0): Playback {
  const track = DEMO_TRACKS[index % DEMO_TRACKS.length];
  return {
    ...track,
    type: "track",
    coverUrl: "/assets/app-icon.png",
    progressMs: 42_000,
    isPlaying: true,
    deviceName: "echomoss demo",
    fetchedAt: Date.now(),
  };
}

export function demoTrackCount(): number {
  return DEMO_TRACKS.length;
}
