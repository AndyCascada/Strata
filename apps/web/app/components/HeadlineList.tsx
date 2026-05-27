"use client";

import { useState } from "react";
import type { AnalyzedHeadline } from "@strata/shared";
import { HeadlineCard } from "./HeadlineCard";

interface Props {
  headlines: AnalyzedHeadline[];
}

export function HeadlineList({ headlines }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-4">
      {headlines.map((h) => (
        <HeadlineCard
          key={h.id}
          headline={h}
          isExpanded={expanded === h.id}
          onToggle={() => setExpanded(expanded === h.id ? null : h.id)}
        />
      ))}
    </div>
  );
}
