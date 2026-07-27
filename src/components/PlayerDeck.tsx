import { AudioLines, Pause, Play, SkipBack, SkipForward } from "lucide-react";
import { formatPlaybackTime } from "../lib/presentation";
import type { Playback, PlaybackAction } from "../lib/types";
import { BotanicalSprite } from "./BotanicalSprite";

interface PlayerDeckProps {
  playback: Playback | null;
  mode: "demo" | "spotify";
  loading: boolean;
  onControl: (action: PlaybackAction) => Promise<void>;
}

export function PlayerDeck({
  playback,
  mode,
  loading,
  onControl,
}: PlayerDeckProps) {
  const progress = playback?.durationMs
    ? Math.min(100, (playback.progressMs / playback.durationMs) * 100)
    : 0;

  return (
    <section className="player-deck">
      <div className="panel-label">
        <span>NOW GROWING</span>
        <span className="player-deck__source">
          <AudioLines size={11} />
          {mode === "spotify" ? "spotify metadata" : "local specimen"}
        </span>
      </div>

      <div className="track" key={playback?.id || "waiting"}>
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
          <h2>{playback?.title || "Waiting for a signal"}</h2>
          <p>{playback?.artist || "Open Spotify on any device"}</p>
        </div>
        <div
          className="track__activity"
          data-playing={playback?.isPlaying || undefined}
          aria-hidden="true"
        >
          <i />
          <i />
          <i />
          <i />
        </div>
      </div>

      <div className="progress">
        <div
          aria-label="Track progress"
          aria-valuemax={100}
          aria-valuemin={0}
          aria-valuenow={Math.round(progress)}
          className="progress__track"
          role="progressbar"
        >
          <span style={{ width: `${progress}%` }} />
        </div>
        <div className="progress__time">
          <span>{formatPlaybackTime(playback?.progressMs || 0)}</span>
          <span>{formatPlaybackTime(playback?.durationMs || 0)}</span>
        </div>
      </div>

      <div className="transport">
        <button
          aria-label="Previous track"
          disabled={loading}
          onClick={() => void onControl("previous")}
          type="button"
        >
          <SkipBack size={17} />
        </button>
        <button
          aria-label={playback?.isPlaying ? "Pause" : "Play"}
          className="transport__primary"
          disabled={loading}
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
          disabled={loading}
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
