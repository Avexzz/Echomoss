import { Leaf, Minus, Square, X } from "lucide-react";
import { invokeNative, isNativeRuntime } from "../lib/native";

interface TitleBarProps {
  mode: "demo" | "spotify";
}

export function TitleBar({ mode }: TitleBarProps) {
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
          {mode === "spotify" ? "live habitat" : "field demo"}
        </span>
      </div>

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
    </header>
  );
}
