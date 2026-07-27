import type { GardenStats, Playback, VisualState } from "./types";

export const EMPTY_GARDEN: GardenStats = {
  blooms: 0,
  listeningSeconds: 0,
  discoveredSpecies: [2, 3, 4],
};

export function progressRatio(playback: Playback | null): number {
  if (!playback || playback.durationMs <= 0) return 0;
  return Math.min(1, Math.max(0, playback.progressMs / playback.durationMs));
}

export function visualState(
  previous: Playback | null,
  next: Playback | null,
): VisualState {
  if (!next || !next.isPlaying) return "dormant";
  if (!previous) return "playing";
  if (previous.id !== next.id) {
    return progressRatio(previous) >= 0.88 ? "bloom" : "transition";
  }
  return "playing";
}

export function addCompletedTrack(
  stats: GardenStats,
  trackId: string,
): GardenStats {
  const species = 5 + (hashString(trackId) % 11);
  return {
    ...stats,
    blooms: stats.blooms + 1,
    discoveredSpecies: stats.discoveredSpecies.includes(species)
      ? stats.discoveredSpecies
      : [...stats.discoveredSpecies, species],
  };
}

export function addListeningSecond(stats: GardenStats): GardenStats {
  return { ...stats, listeningSeconds: stats.listeningSeconds + 1 };
}

function hashString(value: string): number {
  let hash = 0;
  for (const character of value) {
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  }
  return hash;
}
