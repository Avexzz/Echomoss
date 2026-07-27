import { describe, expect, it } from "vitest";
import {
  formatPlaybackTime,
  gardenLevel,
  gardenVitality,
} from "./presentation";
import type { GardenStats } from "./types";

function garden(overrides: Partial<GardenStats> = {}): GardenStats {
  return {
    blooms: 0,
    listeningSeconds: 0,
    discoveredSpecies: [],
    ...overrides,
  };
}

describe("habitat presentation", () => {
  it("formats playback time without leaking negative values", () => {
    expect(formatPlaybackTime(-4_000)).toBe("0:00");
    expect(formatPlaybackTime(65_900)).toBe("1:05");
    expect(formatPlaybackTime(3_605_000)).toBe("60:05");
  });

  it("builds a bounded vitality score from local garden activity", () => {
    expect(gardenVitality(garden())).toBe(12);
    expect(
      gardenVitality(
        garden({
          blooms: 20,
          listeningSeconds: 40_000,
          discoveredSpecies: [1, 2, 3, 4],
        }),
      ),
    ).toBe(100);
  });

  it("names each growth tier at its vitality threshold", () => {
    expect(gardenLevel(garden())).toBe("new growth");
    expect(gardenLevel(garden({ blooms: 3 }))).toBe("understory");
    expect(gardenLevel(garden({ blooms: 6 }))).toBe("glass canopy");
    expect(gardenLevel(garden({ blooms: 9 }))).toBe("midnight bloom");
  });
});
