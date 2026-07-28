import { Activity, Moon, X } from "lucide-react";
import { useEffect, useState } from "react";
import { AmbientField } from "./components/AmbientField";
import { BotanicalSprite } from "./components/BotanicalSprite";
import { ConnectPanel } from "./components/ConnectPanel";
import { Terrarium } from "./components/Terrarium";
import { TitleBar } from "./components/TitleBar";
import { useHabitat } from "./hooks/use-habitat";
import { usePlayback } from "./hooks/use-playback";

export default function App() {
  const controller = usePlayback();
  const habitat = useHabitat(controller.playback);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    if (!settingsOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSettingsOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [settingsOpen]);

  return (
    <div
      className="app-shell"
      data-habitat-state={habitat.state}
      data-settings-open={settingsOpen || undefined}
    >
      <AmbientField />

      <div className="pixel-window">
        <TitleBar
          mode={controller.mode}
          onToggleSettings={() => setSettingsOpen((current) => !current)}
          settingsOpen={settingsOpen}
        />

        <main className="pocket">
          <Terrarium
            playback={controller.playback}
            reducedMotion={habitat.reducedMotion}
            state={habitat.state}
          />
        </main>

        {settingsOpen ? (
          <div className="settings-layer">
            <button
              aria-label="Close settings"
              className="settings-layer__backdrop"
              onClick={() => setSettingsOpen(false)}
              type="button"
            />
            <section
              aria-label="Echomoss settings"
              aria-modal="true"
              className="settings-card"
              role="dialog"
            >
              <header className="settings-card__header">
                <div>
                  <BotanicalSprite index={10} size="small" />
                  <div>
                    <span>little drawer</span>
                    <h2>settings & spotify</h2>
                  </div>
                </div>
                <button
                  aria-label="Close settings"
                  onClick={() => setSettingsOpen(false)}
                  type="button"
                >
                  <X size={15} />
                </button>
              </header>

              <button
                aria-pressed={!habitat.reducedMotion}
                className="motion-setting"
                onClick={habitat.toggleMotion}
                type="button"
              >
                <span>
                  {habitat.reducedMotion ? (
                    <Moon size={15} />
                  ) : (
                    <Activity size={15} />
                  )}
                </span>
                <div>
                  <strong>tiny animations</strong>
                  <small>
                    {habitat.reducedMotion
                      ? "resting quietly"
                      : "awake and wiggling"}
                  </small>
                </div>
                <i data-on={!habitat.reducedMotion || undefined} />
              </button>

              <ConnectPanel
                error={controller.error}
                loading={controller.loading}
                onConnect={controller.connect}
                onDisconnect={controller.disconnect}
                onSetClientId={controller.setClientId}
                status={controller.status}
              />
            </section>
          </div>
        ) : null}
      </div>
    </div>
  );
}
