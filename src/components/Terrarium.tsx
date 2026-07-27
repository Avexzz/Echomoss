import type { VisualState } from "../lib/types";
import { BotanicalSprite } from "./BotanicalSprite";

interface TerrariumProps {
  state: VisualState;
  reducedMotion: boolean;
}

const STATE_COPY: Record<
  VisualState,
  { code: string; title: string; note: string }
> = {
  dormant: {
    code: "HABITAT / REST",
    title: "The glass is quiet.",
    note: "Resume playback and the moss will wake.",
  },
  playing: {
    code: "HABITAT / LISTENING",
    title: "A small signal is growing.",
    note: "Light follows playback state and progress.",
  },
  transition: {
    code: "HABITAT / DRIFT",
    title: "A new track crossed the glass.",
    note: "The moth marks unfinished transitions.",
  },
  bloom: {
    code: "HABITAT / BLOOM",
    title: "One track reached full bloom.",
    note: "A specimen has been added to the shelf.",
  },
};

export function Terrarium({ state, reducedMotion }: TerrariumProps) {
  const copy = STATE_COPY[state];

  return (
    <section className="terrarium-panel">
      <div className="panel-label">
        <span>{copy.code}</span>
        <span className="panel-label__reading">
          <i className={`signal-dot signal-dot--${state}`} />
          {reducedMotion ? "still" : "reactive"}
        </span>
      </div>

      <div
        className={`terrarium terrarium--${state}`}
        role="img"
        aria-label={copy.title}
      >
        <div className="terrarium__sprite" />
        <div className="terrarium__glass-noise" />
        {!reducedMotion && state === "playing" ? (
          <>
            <span className="firefly firefly--one" />
            <span className="firefly firefly--two" />
          </>
        ) : null}
      </div>

      <div className="terrarium-caption">
        <BotanicalSprite
          index={state === "bloom" ? 1 : state === "transition" ? 6 : 2}
          size="small"
        />
        <div>
          <h2>{copy.title}</h2>
          <p>{copy.note}</p>
        </div>
      </div>
    </section>
  );
}
