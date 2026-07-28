import { useCallback, useEffect, useRef, useState } from "preact/hooks";
import {
  EMPTY_GARDEN,
  addCompletedTrack,
  addListeningSecond,
  progressRatio,
} from "../lib/garden";
import type { GardenStats, Playback, VisualState } from "../lib/types";

const GARDEN_KEY = "echomoss:garden:v1";
const MOTION_KEY = "echomoss:reduce-motion:v1";
const TRANSIENT_DURATION = {
  bloom: 2_800,
  transition: 2_100,
} as const;

export interface HabitatController {
  state: VisualState;
  reducedMotion: boolean;
  toggleMotion: () => void;
}

export function useHabitat(playback: Playback | null): HabitatController {
  const [reducedMotion, setReducedMotion] = useState(initialMotionPreference);
  const [state, setState] = useState<VisualState>(
    playback?.isPlaying ? "playing" : "dormant",
  );
  const previousPlaybackRef = useRef<Playback | null>(playback);
  const transientTimerRef = useRef<number | null>(null);
  const playbackIsActiveRef = useRef(Boolean(playback?.isPlaying));
  const gardenSnapshotRef = useRef<GardenStats>(loadGarden());
  const manualMotionPreferenceRef = useRef(
    localStorage.getItem(MOTION_KEY) !== null,
  );

  const clearTransient = useCallback(() => {
    if (transientTimerRef.current !== null) {
      window.clearTimeout(transientTimerRef.current);
      transientTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    playbackIsActiveRef.current = Boolean(playback?.isPlaying);
    const synchronize = window.setTimeout(() => {
      const previous = previousPlaybackRef.current;
      const trackChanged = Boolean(
        previous && playback && previous.id !== playback.id,
      );

      if (!playback?.isPlaying) {
        clearTransient();
        setState("dormant");
      } else if (trackChanged && previous) {
        const completed = progressRatio(previous) >= 0.88;
        const transientState: "bloom" | "transition" = completed
          ? "bloom"
          : "transition";
        setState(transientState);

        if (completed) {
          gardenSnapshotRef.current = addCompletedTrack(
            gardenSnapshotRef.current,
            previous.id,
          );
        }

        clearTransient();
        transientTimerRef.current = window.setTimeout(
          () => {
            transientTimerRef.current = null;
            setState(playbackIsActiveRef.current ? "playing" : "dormant");
          },
          reducedMotion ? 320 : TRANSIENT_DURATION[transientState],
        );
      } else if (transientTimerRef.current === null) {
        setState("playing");
      }

      previousPlaybackRef.current = playback;
    }, 0);

    return () => window.clearTimeout(synchronize);
  }, [clearTransient, playback, reducedMotion]);

  useEffect(() => () => clearTransient(), [clearTransient]);

  useEffect(() => {
    if (!playback?.isPlaying) return;
    const listeningTick = window.setInterval(() => {
      gardenSnapshotRef.current = addListeningSecond(gardenSnapshotRef.current);
    }, 1_000);
    return () => window.clearInterval(listeningTick);
  }, [playback?.isPlaying]);

  useEffect(() => {
    const persist = () => {
      localStorage.setItem(
        GARDEN_KEY,
        JSON.stringify(gardenSnapshotRef.current),
      );
    };
    const persistenceTick = window.setInterval(persist, 5_000);
    window.addEventListener("pagehide", persist);
    return () => {
      window.clearInterval(persistenceTick);
      window.removeEventListener("pagehide", persist);
      persist();
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(MOTION_KEY, String(reducedMotion));
    document.documentElement.dataset.motion = reducedMotion
      ? "reduced"
      : "full";
  }, [reducedMotion]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncSystemPreference = (event: MediaQueryListEvent) => {
      if (!manualMotionPreferenceRef.current) setReducedMotion(event.matches);
    };
    media.addEventListener("change", syncSystemPreference);
    return () => media.removeEventListener("change", syncSystemPreference);
  }, []);

  const toggleMotion = useCallback(() => {
    manualMotionPreferenceRef.current = true;
    setReducedMotion((current) => !current);
  }, []);

  return { state, reducedMotion, toggleMotion };
}

function loadGarden(): GardenStats {
  try {
    const stored = JSON.parse(
      localStorage.getItem(GARDEN_KEY) || "null",
    ) as GardenStats | null;
    if (
      stored &&
      Number.isFinite(stored.blooms) &&
      Number.isFinite(stored.listeningSeconds) &&
      Array.isArray(stored.discoveredSpecies)
    ) {
      return {
        blooms: Math.max(0, Math.floor(stored.blooms)),
        listeningSeconds: Math.max(0, Math.floor(stored.listeningSeconds)),
        discoveredSpecies: Array.from(
          new Set(
            stored.discoveredSpecies.filter(
              (index) => Number.isInteger(index) && index >= 0 && index <= 15,
            ),
          ),
        ),
      };
    }
  } catch {
    // A malformed local snapshot should never prevent the habitat from opening.
  }
  return EMPTY_GARDEN;
}

function initialMotionPreference(): boolean {
  const stored = localStorage.getItem(MOTION_KEY);
  if (stored !== null) return stored === "true";
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
