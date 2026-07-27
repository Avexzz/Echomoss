import { Activity, Leaf, Sparkles } from "lucide-react";
import type { CSSProperties } from "react";
import { AmbientField } from "./components/AmbientField";
import { ConnectPanel } from "./components/ConnectPanel";
import { GardenShelf } from "./components/GardenShelf";
import { PlayerDeck } from "./components/PlayerDeck";
import { Terrarium } from "./components/Terrarium";
import { TitleBar } from "./components/TitleBar";
import { useHabitat } from "./hooks/use-habitat";
import { usePlayback } from "./hooks/use-playback";
import { progressRatio } from "./lib/garden";
import { HABITAT_PRESENTATION } from "./lib/presentation";

export default function App() {
  const controller = usePlayback();
  const playback = controller.playback;
  const habitat = useHabitat(playback);
  const presentation = HABITAT_PRESENTATION[habitat.state];
  const trackProgress = Math.round(progressRatio(playback) * 100);
  const progressStyle = {
    "--track-angle": `${trackProgress * 3.6}deg`,
  } as CSSProperties;

  return (
    <div className="app-shell" data-habitat-state={habitat.state}>
      <AmbientField />
      <TitleBar
        mode={controller.mode}
        onToggleMotion={habitat.toggleMotion}
        reducedMotion={habitat.reducedMotion}
      />

      <main className="station">
        <header className="station-heading">
          <div className="station-heading__copy">
            <span className="station-heading__index">
              <i className={`signal-dot signal-dot--${habitat.state}`} />
              FIELD UNIT 07 · {presentation.label}
            </span>
            <h1>
              Where listening <em>takes root.</em>
            </h1>
            <p>
              A native listening habitat where each finished track leaves a
              small, permanent trace.
            </p>
          </div>

          <div className="session-dial" style={progressStyle}>
            <div className="session-dial__ring">
              <div>
                <strong>{String(trackProgress).padStart(2, "0")}</strong>
                <span>%</span>
              </div>
            </div>
            <div className="session-dial__copy">
              <span>current cycle</span>
              <strong>{presentation.code}</strong>
            </div>
          </div>
        </header>

        <div className="habitat-grid">
          <div className="habitat-primary">
            <Terrarium
              playback={playback}
              reducedMotion={habitat.reducedMotion}
              state={habitat.state}
            />
            <PlayerDeck
              loading={controller.loading}
              mode={controller.mode}
              onControl={controller.control}
              playback={playback}
            />
          </div>

          <aside className="habitat-rail">
            <GardenShelf stats={habitat.garden} />
            <aside className="field-note">
              <div className="field-note__pin" />
              <span>FIELD NOTE / 01</span>
              <p>Metadata makes the weather. Listening makes the memory.</p>
              <small>
                no raw audio leaves the player · every specimen stays local
              </small>
            </aside>
            <ConnectPanel
              error={controller.error}
              loading={controller.loading}
              onConnect={controller.connect}
              onDisconnect={controller.disconnect}
              onSetClientId={controller.setClientId}
              status={controller.status}
            />
          </aside>
        </div>

        <footer>
          <span>
            <Sparkles size={13} /> your garden remains on this device
          </span>
          <span>
            <Activity size={13} /> metadata reactive · audio untouched
          </span>
          <span>
            <Leaf size={13} /> ECHOMOSS · NATIVE SPECIMEN 0.2
          </span>
        </footer>
      </main>
    </div>
  );
}
