import { Leaf, Moon, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ConnectPanel } from "./components/ConnectPanel";
import { GardenShelf } from "./components/GardenShelf";
import { PlayerDeck } from "./components/PlayerDeck";
import { Terrarium } from "./components/Terrarium";
import { TitleBar } from "./components/TitleBar";
import { usePlayback } from "./hooks/use-playback";
import {
  EMPTY_GARDEN,
  addCompletedTrack,
  addListeningSecond,
  progressRatio,
  visualState,
} from "./lib/garden";
import type { GardenStats, Playback, VisualState } from "./lib/types";

const GARDEN_KEY = "echomoss:garden:v1";
const MOTION_KEY = "echomoss:reduce-motion:v1";

export default function App() {
  const controller = usePlayback();
  const playback = controller.playback;
  const [garden, setGarden] = useState<GardenStats>(loadGarden);
  const [reducedMotion, setReducedMotion] = useState(loadMotion);
  const [state, setState] = useState<VisualState>(
    playback?.isPlaying ? "playing" : "dormant",
  );
  const previousPlayback = useRef<Playback | null>(playback);

  useEffect(() => {
    const previous = previousPlayback.current;
    const next = playback;
    const nextState = visualState(previous, next);
    setState(nextState);

    if (
      previous &&
      next &&
      previous.id !== next.id &&
      progressRatio(previous) >= 0.88
    ) {
      setGarden((current) => addCompletedTrack(current, previous.id));
    }
    previousPlayback.current = next;

    if (nextState === "transition" || nextState === "bloom") {
      const returnToListening = window.setTimeout(
        () => setState(next?.isPlaying ? "playing" : "dormant"),
        reducedMotion ? 500 : 2_200,
      );
      return () => window.clearTimeout(returnToListening);
    }
  }, [playback, reducedMotion]);

  useEffect(() => {
    if (!playback?.isPlaying) return;
    const listeningTick = window.setInterval(
      () => setGarden((current) => addListeningSecond(current)),
      1_000,
    );
    return () => window.clearInterval(listeningTick);
  }, [playback?.isPlaying]);

  useEffect(() => {
    localStorage.setItem(GARDEN_KEY, JSON.stringify(garden));
  }, [garden]);

  useEffect(() => {
    localStorage.setItem(MOTION_KEY, String(reducedMotion));
    document.documentElement.dataset.motion = reducedMotion
      ? "reduced"
      : "full";
  }, [reducedMotion]);

  return (
    <div className="app-shell">
      <TitleBar mode={controller.mode} />

      <main>
        <section className="masthead">
          <div>
            <span className="masthead__index">
              FIELD UNIT 07 · LOCAL LISTENING HABITAT
            </span>
            <h1>
              Grow something
              <br />
              <em>quietly alive.</em>
            </h1>
            <p>
              A tiny desktop terrarium shaped by playback — no feed, no streaks,
              no noise. Just music leaving small botanical traces.
            </p>
          </div>
          <div className="masthead__seal" aria-hidden="true">
            <span>ECHOMOSS</span>
            <Leaf size={28} strokeWidth={1.2} />
            <small>LOCAL / 001</small>
          </div>
        </section>

        <div className="dashboard">
          <div className="dashboard__left">
            <Terrarium reducedMotion={reducedMotion} state={state} />
            <PlayerDeck
              mode={controller.mode}
              onControl={controller.control}
              playback={playback}
            />
          </div>
          <div className="dashboard__right">
            <GardenShelf stats={garden} />
            <aside className="field-note">
              <div className="field-note__pin" />
              <span>FIELD NOTE / 01</span>
              <p>
                The garden responds to track changes, progress and playback
                state — never to raw Spotify audio.
              </p>
              <small>
                metadata makes the weather; listening makes the memory.
              </small>
            </aside>
          </div>
        </div>

        <ConnectPanel
          error={controller.error}
          loading={controller.loading}
          onConnect={controller.connect}
          onDisconnect={controller.disconnect}
          onSetClientId={controller.setClientId}
          status={controller.status}
        />

        <footer>
          <span>
            <Sparkles size={13} /> your garden remains on this device
          </span>
          <button
            onClick={() => setReducedMotion((current) => !current)}
            type="button"
          >
            {reducedMotion ? <Moon size={13} /> : <Leaf size={13} />}
            {reducedMotion ? "motion resting" : "motion awake"}
          </button>
          <span>ECHOMOSS · NATIVE SPECIMEN 0.2</span>
        </footer>
      </main>
    </div>
  );
}

function loadGarden(): GardenStats {
  try {
    const stored = JSON.parse(
      localStorage.getItem(GARDEN_KEY) || "null",
    ) as GardenStats | null;
    if (
      stored &&
      typeof stored.blooms === "number" &&
      typeof stored.listeningSeconds === "number" &&
      Array.isArray(stored.discoveredSpecies)
    ) {
      return stored;
    }
  } catch {
    // Begin with a new local habitat.
  }
  return EMPTY_GARDEN;
}

function loadMotion(): boolean {
  return localStorage.getItem(MOTION_KEY) === "true";
}
