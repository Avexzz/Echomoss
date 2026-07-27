import type { CSSProperties } from "react";
import {
  SPECIMEN_NAMES,
  gardenLevel,
  gardenVitality,
} from "../lib/presentation";
import type { GardenStats } from "../lib/types";
import { BotanicalSprite } from "./BotanicalSprite";

interface GardenShelfProps {
  stats: GardenStats;
}

export function GardenShelf({ stats }: GardenShelfProps) {
  const minutes = Math.floor(stats.listeningSeconds / 60);
  const vitality = gardenVitality(stats);
  const visibleSpecimens = stats.discoveredSpecies.slice(-6);
  const emptySlots = Math.max(0, 6 - visibleSpecimens.length);

  return (
    <section className="garden-shelf">
      <div className="panel-label">
        <span>SPECIMEN SHELF</span>
        <span>
          {String(stats.discoveredSpecies.length).padStart(2, "0")} found
        </span>
      </div>

      <div className="vitality">
        <div
          className="vitality__ring"
          style={{ "--vitality": `${vitality * 3.6}deg` } as CSSProperties}
        >
          <div>
            <strong>{vitality}</strong>
            <span>%</span>
          </div>
        </div>
        <div className="vitality__copy">
          <span>HABITAT VITALITY</span>
          <strong>{gardenLevel(stats)}</strong>
          <small>local growth index</small>
        </div>
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
        {visibleSpecimens.map((index, position) => (
          <div
            className="specimen"
            key={index}
            style={
              { "--specimen-delay": `${position * 45}ms` } as CSSProperties
            }
          >
            <BotanicalSprite index={index} size="medium" />
            <span>{SPECIMEN_NAMES[index] || "unknown specimen"}</span>
            <small>{String(index + 1).padStart(2, "0")}</small>
          </div>
        ))}
        {Array.from({ length: emptySlots }, (_, index) => (
          <div className="specimen specimen--empty" key={`empty-${index}`}>
            <span>?</span>
            <small>undiscovered</small>
          </div>
        ))}
      </div>
    </section>
  );
}
