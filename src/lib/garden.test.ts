import { describe, expect, it } from "vitest";
import {
  EMPTY_GARDEN,
  addCompletedTrack,
  progressRatio,
  visualState,
} from "./garden";
import type { Playback } from "./types";

function playback(overrides: Partial<Playback> = {}): Playback {
  return {
    id: "track-a",
    type: "track",
    title: "Night Glass",
    artist: "Moss Archive",
    album: "Small Weather",
    coverUrl: null,
    durationMs: 100_000,
    progressMs: 50_000,
    isPlaying: true,
    deviceName: "test",
    fetchedAt: 0,
    ...overrides,
  };
}

describe("garden state", () => {
  it("uses playback progress safely", () => {
    expect(progressRatio(playback())).toBe(0.5);
    expect(progressRatio(playback({ progressMs: 200_000 }))).toBe(1);
    expect(progressRatio(playback({ durationMs: 0 }))).toBe(0);
  });

  it("marks a normal track change as a transition", () => {
    expect(visualState(playback(), playback({ id: "track-b" }))).toBe(
      "transition",
    );
  });

  it("marks a completed track change as a bloom", () => {
    const previous = playback({ progressMs: 92_000 });
    expect(visualState(previous, playback({ id: "track-b" }))).toBe("bloom");
  });

  it("returns to a dormant habitat when playback pauses", () => {
    expect(visualState(playback(), playback({ isPlaying: false }))).toBe(
      "dormant",
    );
  });

  it("adds one deterministic specimen for a completed track", () => {
    const first = addCompletedTrack(EMPTY_GARDEN, "track-a");
    const second = addCompletedTrack(first, "track-a");
    expect(first.blooms).toBe(1);
    expect(second.blooms).toBe(2);
    expect(second.discoveredSpecies).toEqual(first.discoveredSpecies);
  });
});
