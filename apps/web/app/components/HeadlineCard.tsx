"use client";

import type { AnalyzedHeadline, ContextLayer, DeviationLevel } from "@strata/shared";
import { deviationColor } from "@strata/shared";

interface Props {
  headline: AnalyzedHeadline;
  isExpanded: boolean;
  onToggle: () => void;
}

export function HeadlineCard({ headline, isExpanded, onToggle }: Props) {
  const standardLayers = [
    { key: "recentHistory", label: "Recent History", data: headline.recentHistory },
    { key: "broadHistory",  label: "Broad History",  data: headline.broadHistory },
    { key: "humanNature",   label: "Human Nature",   data: headline.humanNature },
  ];

  const politicalLayers = headline.isPolitical && headline.campaignRhetoric && headline.partyValues
    ? [
        { key: "campaignRhetoric", label: "Campaign Rhetoric", data: headline.campaignRhetoric },
        { key: "partyValues",      label: "Party Values",      data: headline.partyValues },
      ]
    : [];

  const techLayers = headline.techPrecedent
    ? [{ key: "techPrecedent", label: "Tech Precedent", data: headline.techPrecedent }]
    : [];

  const allBadgeLayers = [...standardLayers, ...politicalLayers, ...techLayers];

  return (
    <article className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full text-left px-5 py-4 flex items-start gap-4 hover:bg-zinc-800/50 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm text-zinc-400">{headline.source}</p>
            <CategoryBadge category={headline.category} />
          </div>
          <h2 className="text-base font-medium leading-snug text-zinc-100">
            {headline.headline}
          </h2>
          <div className="flex gap-2 mt-3 flex-wrap">
            {allBadgeLayers.map((l) => (
              <DeviationBadge key={l.key} label={l.label} score={l.data.score} />
            ))}
          </div>
        </div>
        <span className="text-zinc-500 text-lg mt-0.5">{isExpanded ? "↑" : "↓"}</span>
      </button>

      {isExpanded && (
        <div className="border-t border-zinc-800 divide-y divide-zinc-800">
          {standardLayers.map((l) => (
            <ContextSection key={l.key} label={l.label} layer={l.data} />
          ))}

          {politicalLayers.length > 0 && (
            <>
              <div className="px-5 pt-4 pb-2">
                <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
                  Political Context
                  {headline.politicianName && (
                    <span className="ml-2 normal-case text-zinc-400 font-normal">
                      · {headline.politicianName}
                      {headline.partyName && ` (${headline.partyName})`}
                    </span>
                  )}
                </p>
              </div>
              {politicalLayers.map((l) => (
                <ContextSection key={l.key} label={l.label} layer={l.data} />
              ))}
            </>
          )}

          {techLayers.length > 0 && (
            <>
              <div className="px-5 pt-4 pb-2">
                <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400">
                  Technology Context
                </p>
              </div>
              {techLayers.map((l) => (
                <ContextSection key={l.key} label={l.label} layer={l.data} />
              ))}
            </>
          )}

          <div className="px-5 py-3">
            <a
              href={headline.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Read original article →
            </a>
          </div>
        </div>
      )}
    </article>
  );
}

const CATEGORY_COLORS: Record<string, string> = {
  Politics:   "#818cf8",
  Technology: "#22d3ee",
  Science:    "#34d399",
  Economy:    "#fbbf24",
  World:      "#60a5fa",
  Climate:    "#4ade80",
  Health:     "#f472b6",
  General:    "#94a3b8",
};

function CategoryBadge({ category }: { category: string }) {
  const color = CATEGORY_COLORS[category] ?? CATEGORY_COLORS.General;
  return (
    <span
      className="text-xs px-2 py-0.5 rounded-full font-medium"
      style={{ color, backgroundColor: color + "20" }}
    >
      {category}
    </span>
  );
}

function DeviationBadge({ label, score }: { label: string; score: DeviationLevel }) {
  const color = deviationColor(score);
  return (
    <span
      className="text-xs px-2 py-0.5 rounded-full border font-medium"
      style={{ color, borderColor: color + "40", backgroundColor: color + "18" }}
    >
      {label}: {score}
    </span>
  );
}

function ContextSection({ label, layer }: { label: string; layer: ContextLayer }) {
  const color = deviationColor(layer.score);
  return (
    <div className="px-5 py-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
          {label}
        </span>
        <span
          className="text-xs px-1.5 py-0.5 rounded font-medium"
          style={{ color, backgroundColor: color + "20" }}
        >
          {layer.score}
        </span>
      </div>
      <p className="text-sm text-zinc-200 font-medium mb-1">{layer.summary}</p>
      <p className="text-sm text-zinc-400 leading-relaxed">{layer.detail}</p>
    </div>
  );
}
