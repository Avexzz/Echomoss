import type { CSSProperties } from "react";

const MOTES = [
  ["8%", "18%", "17s", "-3s", "3px"],
  ["16%", "72%", "21s", "-12s", "2px"],
  ["28%", "34%", "14s", "-7s", "2px"],
  ["39%", "84%", "19s", "-1s", "3px"],
  ["52%", "14%", "23s", "-16s", "2px"],
  ["63%", "63%", "16s", "-9s", "2px"],
  ["72%", "27%", "20s", "-5s", "3px"],
  ["81%", "78%", "18s", "-13s", "2px"],
  ["91%", "42%", "22s", "-8s", "2px"],
] as const;

export function AmbientField() {
  return (
    <div className="ambient-field" aria-hidden="true">
      <span className="ambient-field__glow ambient-field__glow--cyan" />
      <span className="ambient-field__glow ambient-field__glow--amber" />
      {MOTES.map(([x, y, duration, delay, size], index) => (
        <span
          className="ambient-mote"
          key={`${x}-${y}`}
          style={
            {
              "--mote-x": x,
              "--mote-y": y,
              "--mote-duration": duration,
              "--mote-delay": delay,
              "--mote-size": size,
            } as CSSProperties
          }
          data-mote={index}
        />
      ))}
    </div>
  );
}
