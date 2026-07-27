import type { GardenStats, VisualState } from "./types";

export interface HabitatPresentation {
  code: string;
  label: string;
  title: string;
  note: string;
  spriteIndex: number;
}

export const HABITAT_PRESENTATION = {
  dormant: {
    code: "REST / 00",
    label: "quiet glass",
    title: "The habitat is conserving light.",
    note: "Resume playback and the moss will wake from the floor up.",
    spriteIndex: 9,
  },
  playing: {
    code: "LIVE / 01",
    label: "signal rooted",
    title: "A small signal is taking root.",
    note: "Playback keeps the lamp warm and the fireflies in motion.",
    spriteIndex: 5,
  },
  transition: {
    code: "DRIFT / 02",
    label: "track crossing",
    title: "New weather crossed the glass.",
    note: "The pale moth records an unfinished change in the canopy.",
    spriteIndex: 6,
  },
  bloom: {
    code: "BLOOM / 03",
    label: "specimen formed",
    title: "One listening cycle reached bloom.",
    note: "The completed track left a permanent specimen on the shelf.",
    spriteIndex: 1,
  },
} satisfies Record<VisualState, HabitatPresentation>;

export const SPECIMEN_NAMES = [
  "flower bud",
  "violet bloom",
  "fern sprig",
  "velvet moss",
  "field mushroom",
  "amber firefly",
  "pale moth",
  "seed archive",
  "rain sample",
  "night crescent",
  "tape relic",
  "listening shell",
  "signal trace",
  "watering vessel",
  "lamp fragment",
  "pressed leaf",
] as const;

export function formatPlaybackTime(milliseconds: number): string {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1_000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export function gardenVitality(stats: GardenStats): number {
  const listeningMinutes = Math.floor(stats.listeningSeconds / 60);
  return Math.min(
    100,
    12 +
      stats.blooms * 9 +
      stats.discoveredSpecies.length * 5 +
      Math.floor(listeningMinutes / 4),
  );
}

export function gardenLevel(stats: GardenStats): string {
  const vitality = gardenVitality(stats);
  if (vitality >= 85) return "midnight bloom";
  if (vitality >= 60) return "glass canopy";
  if (vitality >= 35) return "understory";
  return "new growth";
}
