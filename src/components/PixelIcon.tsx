const ICONS = {
  activity: "M1 7h3l2-5 3 10 2-5h4v2h-3l-3 6L6 7l-1 3H1V7Z",
  copy: "M5 2h8v9h-2V4H5V2ZM2 5h2v7h6v2H2V5Z",
  external: "M8 2h6v6h-2V5.5L7.5 10 6 8.5 10.5 4H8V2ZM2 4h5v2H4v6h6V9h2v5H2V4Z",
  leaf: "M13 2H9v1H7v1H5v2H4v2H3v4h3v2h2v-3h2v-1h1V8h1V6h1V2ZM6 10H5V8h1V6h2V5h3v1h-1v1H9v1H8v1H7v1H6Z",
  link: "M3 4h5v2H4v4h4v2H3l-1-1V5l1-1Zm5 1h5l1 1v6l-1 1H8v-2h4V7H8V5ZM5 7h6v2H5V7Z",
  minus: "M3 7h10v2H3V7Z",
  moon: "M10 2h3v2h1v4h-1v2h-2v2H9v1H5v-1H3v-2H2V6h1V4h2V3h3v2H6v1H5v4h1v1h3v-1h2V8h1V5h-2V2Z",
  settings:
    "M6 1h4v2h2v2h2v6h-2v2h-2v2H6v-2H4v-2H2V5h2V3h2V1Zm1 5v4h4V6H7Zm1 1h2v2H8V7Z",
  shield:
    "M8 1l6 2v5c0 4-2 6-6 7-4-1-6-3-6-7V3l6-2Zm0 3L4 5v3c0 2 1 4 4 5 3-1 4-3 4-5V5L8 4Zm-2 3h2v2h2V7h2v3h-1v1H7v-1H6V7Z",
  unplug: "M5 1h2v4h2V1h2v4h2v4h-2v2H9v4H7v-4H5V9H3V5h2V1Zm0 6v2h6V7H5Z",
  x: "M3 2h2v2h2v2h2V4h2V2h2v3h-2v2H9v2h2v2h2v3h-2v-2H9v-2H7v2H5v2H3v-3h2V9h2V7H5V5H3V2Z",
} as const;

export type PixelIconName = keyof typeof ICONS;

interface PixelIconProps {
  name: PixelIconName;
  size?: number;
  className?: string;
}

export function PixelIcon({ name, size = 14, className }: PixelIconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="currentColor"
      height={size}
      shapeRendering="crispEdges"
      viewBox="0 0 16 16"
      width={size}
    >
      <path clipRule="evenodd" d={ICONS[name]} fillRule="evenodd" />
    </svg>
  );
}
