import Link from "next/link";
import { SCRIPT_TYPE } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import type { ScriptEmail } from "@/lib/types";

export function ProspectScripts({ scripts }: { scripts: ScriptEmail[] }) {
  return (
    <div>
      <div className="space-y-2">
        {scripts.length === 0 && (
          <p className="text-sm text-slate-400">Aucun script ou courriel enregistré.</p>
        )}
        {scripts.map((s) => (
          <div key={s.id} className="rounded-lg border border-slate-200 px-3 py-2">
            <div className="flex items-center justify-between gap-2">
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                {SCRIPT_TYPE[s.type]}
              </span>
              <span className="text-[11px] text-slate-400">{formatDate(s.created_at)}</span>
            </div>
            {s.subject && (
              <p className="mt-1 text-sm font-medium text-[#0F172A]">{s.subject}</p>
            )}
            <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{s.content}</p>
          </div>
        ))}
      </div>
      <Link
        href="/scripts"
        className="mt-3 inline-block text-xs font-medium text-[#3B82F6]"
      >
        + Ajouter un script/courriel dans la bibliothèque →
      </Link>
    </div>
  );
}
