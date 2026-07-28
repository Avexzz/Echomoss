import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
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

const MOOD = {
  dormant: "z z",
  playing: "♪",
  transition: "?",
  bloom: "♥",
} satisfies Record<VisualState, string>;

const FIREFLIES = [
  ["26%", "59%", "0s", "10px", "-14px"],
  ["38%", "37%", "-1.8s", "-7px", "-10px"],
  ["59%", "47%", "-3.1s", "12px", "-8px"],
  ["72%", "65%", "-0.7s", "-9px", "-16px"],
  ["53%", "27%", "-4.2s", "8px", "-11px"],
  ["81%", "42%", "-2.4s", "-7px", "-8px"],
] as const;

const GLASS_PIXELS = [
  ["18%", "23%", "-1.2s"],
  ["77%", "18%", "-3.8s"],
  ["68%", "48%", "-2.1s"],
  ["31%", "72%", "-4.7s"],
] as const;

export function Terrarium({ state, reducedMotion, playback }: TerrariumProps) {
  const copy = HABITAT_PRESENTATION[state];
  const progress = Math.round(progressRatio(playback) * 100);
  const [poked, setPoked] = useState(false);
  const pokeTimer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (pokeTimer.current !== null) window.clearTimeout(pokeTimer.current);
    },
    [],
  );

  const reactToPoke = () => {
    if (pokeTimer.current !== null) window.clearTimeout(pokeTimer.current);
    setPoked(false);
    window.requestAnimationFrame(() => setPoked(true));
    pokeTimer.current = window.setTimeout(
      () => {
        pokeTimer.current = null;
        setPoked(false);
      },
      reducedMotion ? 280 : 900,
    );
  };

  return (
    <section
      className="terrarium-shell"
      data-poked={poked || undefined}
      data-state={state}
    >
      <button
        aria-label={`${copy.title} ${
          playback
            ? `Now playing ${playback.title} by ${playback.artist}.`
            : "Waiting for Spotify."
        } Tap the terrarium to say hello.`}
        className="terrarium"
        onClick={reactToPoke}
        type="button"
      >
        <span className="terrarium__scenes" aria-hidden="true">
          {SCENE_STATES.map((sceneState) => (
            <span
              className={`terrarium__scene terrarium__scene--${sceneState}`}
              data-active={sceneState === state}
              key={sceneState}
            />
          ))}
        </span>

        <span className="terrarium__glass" aria-hidden="true" />
        <span className="terrarium__rain" aria-hidden="true" />
        <span className="terrarium__glow" aria-hidden="true" />

        {!reducedMotion ? (
          <>
            <span className="firefly-field" aria-hidden="true">
              {FIREFLIES.map(([x, y, delay, driftX, driftY]) => (
                <i
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
            </span>
            <span className="glass-pixels" aria-hidden="true">
              {GLASS_PIXELS.map(([x, y, delay]) => (
                <i
                  key={`${x}-${y}`}
                  style={
                    {
                      "--pixel-x": x,
                      "--pixel-y": y,
                      "--pixel-delay": delay,
                    } as CSSProperties
                  }
                />
              ))}
            </span>
          </>
        ) : null}

        {state === "transition" ? (
          <span className="moth-drift" aria-hidden="true">
            <BotanicalSprite index={6} size="small" />
          </span>
        ) : null}

        {state === "bloom" && !reducedMotion ? (
          <span className="bloom-burst" aria-hidden="true">
            {Array.from({ length: 8 }, (_, index) => (
              <i
                key={index}
                style={
                  {
                    "--petal-angle": `${index * 45}deg`,
                    "--petal-delay": `${index * 45}ms`,
                  } as CSSProperties
                }
              />
            ))}
          </span>
        ) : null}

        {poked ? (
          <span className="poke-burst" aria-hidden="true">
            <strong>♡</strong>
            {Array.from({ length: 6 }, (_, index) => (
              <i
                key={index}
                style={
                  {
                    "--poke-x": `${(index % 3) * 24 - 24}px`,
                    "--poke-y": `${Math.floor(index / 3) * 18 - 30}px`,
                    "--poke-delay": `${index * 35}ms`,
                  } as CSSProperties
                }
              />
            ))}
          </span>
        ) : null}

        <span className="mood-bubble" aria-hidden="true">
          {poked ? "♡!" : MOOD[state]}
        </span>

        <span className="track-plaque" key={playback?.id || "waiting"}>
          <span className="track-plaque__art">
            {playback?.coverUrl ? (
              <img alt="" src={playback.coverUrl} />
            ) : (
              <BotanicalSprite index={10} size="small" />
            )}
          </span>
          <span className="track-plaque__copy">
            <strong>{playback?.title || "waiting for a song"}</strong>
            <small>{playback?.artist || "open spotify to wake me"}</small>
          </span>
          <span
            className="track-plaque__equalizer"
            data-playing={playback?.isPlaying || undefined}
            aria-hidden="true"
          >
            <i />
            <i />
            <i />
          </span>
          <span className="track-plaque__progress" aria-hidden="true">
            <i style={{ width: `${progress}%` }} />
          </span>
        </span>
      </button>
    </section>
  );
}
