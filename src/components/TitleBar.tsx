import { Activity, Leaf, Minus, Moon, Square, X } from "lucide-react";
import { invokeNative, isNativeRuntime } from "../lib/native";

interface TitleBarProps {
  mode: "demo" | "spotify";
  reducedMotion: boolean;
  onToggleMotion: () => void;
}

export function TitleBar({
  mode,
  reducedMotion,
  onToggleMotion,
}: TitleBarProps) {
  const native = isNativeRuntime();

  return (
    <header className="title-bar" data-tauri-drag-region>
      <div className="title-bar__identity" data-tauri-drag-region>
        <span className="title-bar__mark">
          <Leaf aria-hidden="true" size={13} />
        </span>
        <span className="title-bar__name">echomoss</span>
        <span className="title-bar__divider">/</span>
        <span className="title-bar__status">
          <i className={mode === "spotify" ? "is-live" : ""} />
          {mode === "spotify" ? "live habitat" : "field demo"}
        </span>
      </div>

      <div className="title-bar__utilities">
        <button
          aria-label={
            reducedMotion
              ? "Enable ambient animation"
              : "Reduce ambient animation"
          }
          className="motion-toggle"
          onClick={onToggleMotion}
          title={reducedMotion ? "Wake ambient motion" : "Let motion rest"}
          type="button"
        >
          {reducedMotion ? <Moon size={12} /> : <Activity size={12} />}
          <span>{reducedMotion ? "motion resting" : "motion awake"}</span>
        </button>

        {native ? (
          <div className="window-controls">
            <button
              aria-label="Minimize"
              onClick={() => void invokeNative("window_minimize")}
              type="button"
            >
              <Minus size={14} />
            </button>
            <button
              aria-label="Maximize or restore"
              onClick={() => void invokeNative("window_toggle_maximize")}
              type="button"
            >
              <Square size={11} />
            </button>
            <button
              aria-label="Close"
              className="window-controls__close"
              onClick={() => void invokeNative("window_close")}
              type="button"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <span className="title-bar__browser">visual preview</span>
        )}
      </div>
    </header>
  );
}
