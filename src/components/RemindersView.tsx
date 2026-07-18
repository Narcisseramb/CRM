"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRealtimeRows } from "@/lib/useRealtimeRows";
import { REMINDER_TYPE } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import type { Prospect, Reminder, Profile } from "@/lib/types";

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function bucketFor(reminder: Reminder): "retard" | "aujourdhui" | "semaine" | "avenir" {
  const today = startOfToday();
  const date = new Date(reminder.reminder_date + "T00:00:00");
  const diffDays = Math.round((date.getTime() - today.getTime()) / 86400000);
  if (diffDays < 0) return "retard";
  if (diffDays === 0) return "aujourdhui";
  if (diffDays <= 7) return "semaine";
  return "avenir";
}

const BUCKET_META: Record<string, { title: string; dot: string }> = {
  retard: { title: "En retard", dot: "bg-red-500" },
  aujourdhui: { title: "Aujourd'hui", dot: "bg-amber-500" },
  semaine: { title: "Cette semaine", dot: "bg-blue-500" },
  avenir: { title: "À venir", dot: "bg-slate-400" },
};

export function RemindersView({
  initialReminders,
  initialProspects,
  profiles,
  currentUserId,
}: {
  initialReminders: Reminder[];
  initialProspects: Prospect[];
  profiles: Profile[];
  currentUserId: string;
}) {
  const [reminders] = useRealtimeRows<Reminder>("reminders", initialReminders);
  const [prospects] = useRealtimeRows<Prospect>("prospects", initialProspects);
  const [scope, setScope] = useState<"mine" | "all">("mine");
  const [showDone, setShowDone] = useState(false);

  const prospectMap = useMemo(
    () => new Map(prospects.map((p) => [p.id, p])),
    [prospects],
  );

  const filtered = useMemo(() => {
    return reminders
      .filter((r) => (scope === "mine" ? r.assigned_to === currentUserId : true))
      .filter((r) => (showDone ? true : !r.is_done))
      .sort((a, b) => new Date(a.reminder_date).getTime() - new Date(b.reminder_date).getTime());
  }, [reminders, scope, showDone, currentUserId]);

  const buckets: Record<string, Reminder[]> = { retard: [], aujourdhui: [], semaine: [], avenir: [] };
  filtered.forEach((r) => buckets[bucketFor(r)].push(r));

  async function toggleDone(reminder: Reminder) {
    const supabase = createClient();
    await supabase
      .from("reminders")
      .update({
        is_done: !reminder.is_done,
        done_at: !reminder.is_done ? new Date().toISOString() : null,
      })
      .eq("id", reminder.id);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5">
          <button
            onClick={() => setScope("mine")}
            className={`rounded-md px-3 py-1.5 text-xs font-medium ${
              scope === "mine" ? "bg-[#3B82F6] text-white" : "text-slate-500"
            }`}
          >
            Mes rappels
          </button>
          <button
            onClick={() => setScope("all")}
            className={`rounded-md px-3 py-1.5 text-xs font-medium ${
              scope === "all" ? "bg-[#3B82F6] text-white" : "text-slate-500"
            }`}
          >
            Tous
          </button>
        </div>
        <label className="flex items-center gap-2 text-xs text-slate-500">
          <input
            type="checkbox"
            checked={showDone}
            onChange={(e) => setShowDone(e.target.checked)}
            className="h-4 w-4 accent-[#3B82F6]"
          />
          Afficher les rappels terminés
        </label>
      </div>

      <div className="mt-6 space-y-6">
        {(["retard", "aujourdhui", "semaine", "avenir"] as const).map((key) => {
          const items = buckets[key];
          if (items.length === 0) return null;
          const meta = BUCKET_META[key];
          return (
            <div key={key}>
              <div className="mb-2 flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
                <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {meta.title}
                </h2>
                <span className="text-xs text-slate-400">({items.length})</span>
              </div>
              <div className="space-y-2">
                {items.map((r) => {
                  const prospect = r.prospect_id ? prospectMap.get(r.prospect_id) : undefined;
                  const assignee = profiles.find((p) => p.id === r.assigned_to);
                  return (
                    <div
                      key={r.id}
                      className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3"
                    >
                      <input
                        type="checkbox"
                        checked={r.is_done}
                        onChange={() => toggleDone(r)}
                        className="mt-0.5 h-4 w-4 accent-[#3B82F6]"
                      />
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`text-sm font-medium ${
                              r.is_done ? "text-slate-400 line-through" : "text-[#0F172A]"
                            }`}
                          >
                            {r.title}
                          </span>
                          {r.reminder_type !== "unique" && (
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                              {REMINDER_TYPE[r.reminder_type]}
                            </span>
                          )}
                        </div>
                        <div className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-slate-500">
                          <span>{formatDate(r.reminder_date)}</span>
                          {assignee && <span>{assignee.full_name}</span>}
                          {prospect && (
                            <Link
                              href={`/prospects/${prospect.id}`}
                              className="font-medium text-[#3B82F6]"
                            >
                              {prospect.company_name}
                            </Link>
                          )}
                        </div>
                        {r.description && (
                          <p className="mt-1 text-xs text-slate-500">{r.description}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-slate-400">Aucun rappel à afficher.</p>
        )}
      </div>
    </div>
  );
}
