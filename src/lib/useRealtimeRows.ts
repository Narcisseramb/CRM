"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Keeps a list of rows in sync with realtime INSERT/UPDATE/DELETE events on
 * a Supabase table, so Narcisse and Marek see each other's changes live.
 */
export function useRealtimeRows<T extends { id: string }>(
  table: string,
  initial: T[],
  filter?: string,
) {
  const [rows, setRows] = useState<T[]>(initial);
  const [prevInitial, setPrevInitial] = useState(initial);

  // Adjusting state from a prop change during render (React's recommended
  // pattern) instead of in an effect, so a new `initial` (e.g. navigating to
  // a different prospect) resets local state without an extra render pass.
  if (initial !== prevInitial) {
    setPrevInitial(initial);
    setRows(initial);
  }

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`realtime:${table}:${filter ?? "all"}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table, filter },
        (payload) => {
          setRows((current) => {
            if (payload.eventType === "INSERT") {
              const newRow = payload.new as T;
              if (current.some((r) => r.id === newRow.id)) return current;
              return [newRow, ...current];
            }
            if (payload.eventType === "UPDATE") {
              const newRow = payload.new as T;
              return current.map((r) => (r.id === newRow.id ? { ...r, ...newRow } : r));
            }
            if (payload.eventType === "DELETE") {
              const oldRow = payload.old as Partial<T>;
              return current.filter((r) => r.id !== oldRow.id);
            }
            return current;
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, filter]);

  return [rows, setRows] as const;
}
