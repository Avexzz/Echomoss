import { Leaf, Minus, Settings2, X } from "lucide-react";
import { invokeNative, isNativeRuntime } from "../lib/native";

interface TitleBarProps {
  mode: "demo" | "spotify";
  settingsOpen: boolean;
  onToggleSettings: () => void;
}

export function TitleBar({
  mode,
  settingsOpen,
  onToggleSettings,
}: TitleBarProps) {
  const native = isNativeRuntime();

  return (
    <header className="title-bar" data-tauri-drag-region>
      <div className="title-bar__identity" data-tauri-drag-region>
        <span className="title-bar__mark">
          <Leaf aria-hidden="true" size={12} />
        </span>
        <span className="title-bar__name">echomoss</span>
        <span className="title-bar__status">
          <i className={mode === "spotify" ? "is-live" : ""} />
          {mode === "spotify" ? "listening" : "demo"}
        </span>
      </div>

      <div className="title-bar__utilities">
        <button
          aria-label="Open settings"
          aria-pressed={settingsOpen}
          className="settings-toggle"
          onClick={onToggleSettings}
          type="button"
        >
          <Settings2 size={13} />
        </button>

        {native ? (
          <div className="window-controls">
            <button
              aria-label="Minimize"
              onClick={() => void invokeNative("window_minimize")}
              type="button"
            >
              <Minus size={13} />
            </button>
            <button
              aria-label="Close"
              className="window-controls__close"
              onClick={() => void invokeNative("window_close")}
              type="button"
            >
              <X size={13} />
            </button>
          </div>
        ) : (
          <span className="title-bar__browser">preview</span>
        )}
      </div>
    </header>
  );
}
