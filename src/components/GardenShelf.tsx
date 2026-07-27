import type { GardenStats } from "../lib/types";
import { BotanicalSprite } from "./BotanicalSprite";

interface GardenShelfProps {
  stats: GardenStats;
}

const SPECIMEN_NAMES = [
  "violet bloom",
  "fern clipping",
  "velvet moss",
  "field mushroom",
  "amber firefly",
  "pale moth",
  "rain sample",
  "night crescent",
  "tape relic",
  "listening shell",
  "signal trace",
  "watering vessel",
  "lamp fragment",
  "pressed leaf",
];

export function GardenShelf({ stats }: GardenShelfProps) {
  const minutes = Math.floor(stats.listeningSeconds / 60);

  return (
    <section className="garden-shelf">
      <div className="panel-label">
        <span>SPECIMEN SHELF</span>
        <span>
          {String(stats.discoveredSpecies.length).padStart(2, "0")} found
        </span>
      </div>

      <div className="garden-stats">
        <div>
          <strong>{String(stats.blooms).padStart(2, "0")}</strong>
          <span>blooms</span>
        </div>
        <div>
          <strong>{String(minutes).padStart(2, "0")}</strong>
          <span>minutes</span>
        </div>
        <div>
          <strong>
            {String(stats.discoveredSpecies.length).padStart(2, "0")}
          </strong>
          <span>species</span>
        </div>
      </div>

      <div className="specimen-grid">
        {stats.discoveredSpecies.slice(-8).map((index) => (
          <div className="specimen" key={index}>
            <BotanicalSprite index={index} size="medium" />
            <span>{SPECIMEN_NAMES[index - 1] || "unknown specimen"}</span>
          </div>
        ))}
        {Array.from(
          { length: Math.max(0, 4 - stats.discoveredSpecies.length) },
          (_, index) => (
            <div className="specimen specimen--empty" key={`empty-${index}`}>
              <span>?</span>
              <small>undiscovered</small>
            </div>
          ),
        )}
      </div>
    </section>
  );
}
