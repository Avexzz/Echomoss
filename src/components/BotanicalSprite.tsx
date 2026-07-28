import type { JSX } from "preact";

interface BotanicalSpriteProps {
  index: number;
  size?: "small" | "medium" | "large";
  label?: string;
}

export function BotanicalSprite({
  index,
  size = "medium",
  label,
}: BotanicalSpriteProps) {
  const safeIndex = Math.max(0, Math.min(15, index));
  const column = safeIndex % 4;
  const row = Math.floor(safeIndex / 4);
  const style: JSX.CSSProperties = {
    backgroundPosition: `${column * 33.333}% ${row * 33.333}%`,
  };

  return (
    <span
      aria-label={label}
      className={`botanical-sprite botanical-sprite--${size}`}
      role={label ? "img" : undefined}
      style={style}
    />
  );
}
