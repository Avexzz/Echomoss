import { Pause, Play, SkipBack, SkipForward } from "lucide-react";
import type { Playback, PlaybackAction } from "../lib/types";
import { BotanicalSprite } from "./BotanicalSprite";

interface PlayerDeckProps {
  playback: Playback | null;
  mode: "demo" | "spotify";
  onControl: (action: PlaybackAction) => Promise<void>;
}

export function PlayerDeck({ playback, mode, onControl }: PlayerDeckProps) {
  const progress = playback?.durationMs
    ? Math.min(100, (playback.progressMs / playback.durationMs) * 100)
    : 0;

  return (
    <section className="player-deck">
      <div className="panel-label">
        <span>NOW GROWING</span>
        <span>
          {mode === "spotify" ? "spotify metadata" : "local specimen"}
        </span>
      </div>

      <div className="track">
        <div className="track__cover">
          {playback?.coverUrl ? (
            <img alt="" src={playback.coverUrl} />
          ) : (
            <BotanicalSprite index={10} size="large" />
          )}
          <span className="track__cover-corner" />
        </div>
        <div className="track__copy">
          <span className="track__eyebrow">
            {playback?.album || "No active playback"}
          </span>
          <h1>{playback?.title || "Waiting for a signal"}</h1>
          <p>{playback?.artist || "Open Spotify on any device"}</p>
        </div>
      </div>

      <div className="progress">
        <div className="progress__track" aria-label="Track progress">
          <span style={{ width: `${progress}%` }} />
        </div>
        <div className="progress__time">
          <span>{formatTime(playback?.progressMs || 0)}</span>
          <span>{formatTime(playback?.durationMs || 0)}</span>
        </div>
      </div>

      <div className="transport">
        <button
          aria-label="Previous track"
          onClick={() => void onControl("previous")}
          type="button"
        >
          <SkipBack size={17} />
        </button>
        <button
          aria-label={playback?.isPlaying ? "Pause" : "Play"}
          className="transport__primary"
          onClick={() => void onControl(playback?.isPlaying ? "pause" : "play")}
          type="button"
        >
          {playback?.isPlaying ? (
            <Pause size={18} fill="currentColor" />
          ) : (
            <Play size={18} fill="currentColor" />
          )}
        </button>
        <button
          aria-label="Next track"
          onClick={() => void onControl("next")}
          type="button"
        >
          <SkipForward size={17} />
        </button>
        <span className="transport__device">
          {playback?.deviceName || "no device"}
        </span>
      </div>
    </section>
  );
}

function formatTime(milliseconds: number): string {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1_000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}
