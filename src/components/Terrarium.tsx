import type { CSSProperties } from "react";
import { progressRatio } from "../lib/garden";
import { HABITAT_PRESENTATION } from "../lib/presentation";
import type { Playback, VisualState } from "../lib/types";
import { BotanicalSprite } from "./BotanicalSprite";

interface TerrariumProps {
  state: VisualState;
  reducedMotion: boolean;
  playback: Playback | null;
}

const SCENE_STATES: VisualState[] = [
  "dormant",
  "playing",
  "transition",
  "bloom",
];

const FIREFLIES = [
  ["29%", "62%", "0s", "11px", "-15px"],
  ["39%", "39%", "-1.8s", "-8px", "-11px"],
  ["61%", "48%", "-3.1s", "13px", "-8px"],
  ["72%", "68%", "-0.7s", "-10px", "-17px"],
  ["53%", "29%", "-4.2s", "8px", "-12px"],
] as const;

export function Terrarium({ state, reducedMotion, playback }: TerrariumProps) {
  const copy = HABITAT_PRESENTATION[state];
  const growth = Math.round(progressRatio(playback) * 100);

  return (
    <section className="terrarium-panel" data-state={state}>
      <div className="panel-label">
        <span>BOTANICAL CHAMBER · {copy.code}</span>
        <span className="panel-label__reading">
          <i className={`signal-dot signal-dot--${state}`} />
          {reducedMotion ? "still" : "reactive"}
        </span>
      </div>

      <div className="terrarium-stage">
        <div className="terrarium-stage__aura" aria-hidden="true" />
        <div
          className={`terrarium terrarium--${state}`}
          role="img"
          aria-label={copy.title}
        >
          <div className="terrarium__scenes" aria-hidden="true">
            {SCENE_STATES.map((sceneState) => (
              <span
                className={`terrarium__scene terrarium__scene--${sceneState}`}
                data-active={sceneState === state}
                key={sceneState}
              />
            ))}
          </div>
          <div className="terrarium__glass-noise" aria-hidden="true" />
          <div className="terrarium__rain" aria-hidden="true" />
          <div className="terrarium__scan" aria-hidden="true" />

          {!reducedMotion ? (
            <div className="firefly-field" aria-hidden="true">
              {FIREFLIES.map(([x, y, delay, driftX, driftY]) => (
                <span
                  className="firefly"
                  key={`${x}-${y}`}
                  style={
                    {
                      "--firefly-x": x,
                      "--firefly-y": y,
                      "--firefly-delay": delay,
                      "--firefly-drift-x": driftX,
                      "--firefly-drift-y": driftY,
                    } as CSSProperties
                  }
                />
              ))}
            </div>
          ) : null}

          {state === "transition" ? (
            <span className="moth-drift" aria-hidden="true">
              <BotanicalSprite index={6} size="small" />
            </span>
          ) : null}

          {state === "bloom" && !reducedMotion ? (
            <div className="bloom-burst" aria-hidden="true">
              {Array.from({ length: 8 }, (_, index) => (
                <i
                  key={index}
                  style={
                    {
                      "--petal-angle": `${index * 45}deg`,
                      "--petal-delay": `${index * 55}ms`,
                    } as CSSProperties
                  }
                />
              ))}
            </div>
          ) : null}

          <div className="terrarium__telemetry" aria-hidden="true">
            <span>FLORA SIGNAL</span>
            <strong>{String(growth).padStart(2, "0")}</strong>
            <small>%</small>
          </div>
        </div>
      </div>

      <div className="terrarium-caption">
        <BotanicalSprite index={copy.spriteIndex} size="small" />
        <div>
          <h2>{copy.title}</h2>
          <p>{copy.note}</p>
        </div>
      </div>
    </section>
  );
}
