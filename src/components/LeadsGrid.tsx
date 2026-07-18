"use client";

import { useMemo, useState } from "react";
import { useRealtimeRows } from "@/lib/useRealtimeRows";
import { LeadCard } from "@/components/LeadCard";
import type { Lead, Prospect } from "@/lib/types";

const PRIORITY_WEIGHT: Record<string, number> = { urgente: 0, haute: 1, normale: 2 };
const CLOSED_STATUSES = ["converti", "perdu"];

export function LeadsGrid({
  initialLeads,
  initialProspects,
}: {
  initialLeads: Lead[];
  initialProspects: Prospect[];
}) {
  const [leads] = useRealtimeRows<Lead>("leads", initialLeads);
  const [prospects] = useRealtimeRows<Prospect>("prospects", initialProspects);
  const [showClosed, setShowClosed] = useState(false);

  const prospectMap = useMemo(
    () => new Map(prospects.map((p) => [p.id, p])),
    [prospects],
  );

  const sorted = useMemo(() => {
    return [...leads]
      .filter((l) => (showClosed ? true : !CLOSED_STATUSES.includes(l.lead_status)))
      .sort((a, b) => {
        const pw = (PRIORITY_WEIGHT[a.lead_priority] ?? 3) - (PRIORITY_WEIGHT[b.lead_priority] ?? 3);
        if (pw !== 0) return pw;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [leads, showClosed]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">
          {sorted.length} lead{sorted.length > 1 ? "s" : ""}
        </p>
        <label className="flex items-center gap-2 text-xs text-slate-500">
          <input
            type="checkbox"
            checked={showClosed}
            onChange={(e) => setShowClosed(e.target.checked)}
            className="h-4 w-4 accent-[#3B82F6]"
          />
          Inclure convertis / perdus
        </label>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {sorted.map((lead) => (
          <LeadCard key={lead.id} lead={lead} prospect={prospectMap.get(lead.prospect_id)} />
        ))}
        {sorted.length === 0 && (
          <p className="col-span-full py-8 text-center text-sm text-slate-400">
            Aucun lead à afficher.
          </p>
        )}
      </div>
    </div>
  );
}
