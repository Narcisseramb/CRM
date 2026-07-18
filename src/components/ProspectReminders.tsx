"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRealtimeRows } from "@/lib/useRealtimeRows";
import { formatDate } from "@/lib/utils";
import type { Profile, Reminder } from "@/lib/types";

export function ProspectReminders({
  prospectId,
  initialReminders,
  profiles,
  currentUserId,
}: {
  prospectId: string;
  initialReminders: Reminder[];
  profiles: Profile[];
  currentUserId: string;
}) {
  const [reminders] = useRealtimeRows<Reminder>(
    "reminders",
    initialReminders,
    `prospect_id=eq.${prospectId}`,
  );
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [assignedTo, setAssignedTo] = useState(currentUserId);
  const [saving, setSaving] = useState(false);

  const sorted = [...reminders].sort(
    (a, b) => new Date(a.reminder_date).getTime() - new Date(b.reminder_date).getTime(),
  );

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !date) return;
    setSaving(true);
    const supabase = createClient();
    await supabase.from("reminders").insert({
      prospect_id: prospectId,
      title: title.trim(),
      reminder_date: date,
      assigned_to: assignedTo || null,
    });
    setSaving(false);
    setTitle("");
    setDate("");
    setOpen(false);
  }

  return (
    <div>
      <div className="space-y-2">
        {sorted.length === 0 && (
          <p className="text-sm text-slate-400">Aucun rappel pour ce prospect.</p>
        )}
        {sorted.map((r) => (
          <label
            key={r.id}
            className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-sm ${
              r.is_done ? "border-slate-100 bg-slate-50 text-slate-400" : "border-slate-200"
            }`}
          >
            <input
              type="checkbox"
              checked={r.is_done}
              onChange={() => toggleDone(r)}
              className="mt-0.5 h-4 w-4 accent-[#3B82F6]"
            />
            <span className="flex-1">
              <span className={r.is_done ? "line-through" : "font-medium text-[#0F172A]"}>
                {r.title}
              </span>
              <span className="block text-xs text-slate-400">
                {formatDate(r.reminder_date)}
                {r.assigned_to &&
                  ` · ${profiles.find((p) => p.id === r.assigned_to)?.full_name ?? ""}`}
              </span>
            </span>
          </label>
        ))}
      </div>

      {open ? (
        <form
          onSubmit={handleSubmit}
          className="mt-3 space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3"
        >
          <input
            autoFocus
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titre du rappel"
            className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm"
          />
          <div className="flex gap-2">
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="flex-1 rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs"
            />
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="flex-1 rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs"
            >
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.full_name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md px-2 py-1 text-xs text-slate-500 hover:bg-slate-100"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-[#3B82F6] px-3 py-1 text-xs font-semibold text-white hover:bg-[#2563EB] disabled:opacity-60"
            >
              {saving ? "..." : "Ajouter"}
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="mt-3 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
        >
          + Ajouter un rappel
        </button>
      )}
    </div>
  );
}
