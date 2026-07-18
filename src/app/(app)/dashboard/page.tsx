import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { StatCard } from "@/components/StatCard";
import { ProspectStatusBadge } from "@/components/StatusBadge";
import { INTERACTION_TYPE } from "@/lib/constants";
import { formatDate, timeAgo } from "@/lib/utils";
import type { Interaction, Profile, Reminder } from "@/lib/types";

type ReminderWithProspect = Reminder & {
  prospect: { id: string; company_name: string } | null;
};
type InteractionWithProspect = Interaction & {
  prospect: { id: string; company_name: string } | null;
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);
  const weekAgoDate = new Date();
  weekAgoDate.setDate(weekAgoDate.getDate() - 7);
  const weekAgo = weekAgoDate.toISOString().slice(0, 10);

  const [
    { data: profiles },
    { count: activeLeadsCount },
    { count: hotLeadsCount },
    { count: contactedThisWeek },
    { count: pendingFollowUps },
    { data: todayReminders },
    { data: recentInteractions },
  ] = await Promise.all([
    supabase.from("profiles").select("*"),
    supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .not("lead_status", "in", "(converti,perdu)"),
    supabase
      .from("prospects")
      .select("id", { count: "exact", head: true })
      .eq("status", "lead_chaud"),
    supabase
      .from("prospects")
      .select("id", { count: "exact", head: true })
      .gte("date_last_contact", weekAgo),
    supabase
      .from("reminders")
      .select("id", { count: "exact", head: true })
      .eq("is_done", false),
    supabase
      .from("reminders")
      .select("*, prospect:prospects(id, company_name)")
      .eq("reminder_date", today)
      .eq("is_done", false)
      .order("reminder_date", { ascending: true }),
    supabase
      .from("interactions")
      .select("*, prospect:prospects(id, company_name)")
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  const profileMap = new Map(
    (profiles ?? []).map((p: Profile) => [p.id, p.full_name]),
  );
  const todayRemindersTyped = (todayReminders ?? []) as unknown as ReminderWithProspect[];
  const recentInteractionsTyped = (recentInteractions ?? []) as unknown as InteractionWithProspect[];

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-xl font-semibold text-[#0F172A]">Tableau de bord</h1>
      <p className="mt-1 text-sm text-slate-500">
        Vue d&apos;ensemble de la prospection MKB Logistics
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Leads actifs" value={activeLeadsCount ?? 0} accent="blue" />
        <StatCard label="Leads chauds" value={hotLeadsCount ?? 0} accent="red" />
        <StatCard
          label="Contactés cette semaine"
          value={contactedThisWeek ?? 0}
          accent="emerald"
        />
        <StatCard
          label="Suivis en attente"
          value={pendingFollowUps ?? 0}
          accent="amber"
        />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#0F172A]">
              Rappels d&apos;aujourd&apos;hui
            </h2>
            <Link href="/reminders" className="text-xs font-medium text-[#3B82F6]">
              Voir tout →
            </Link>
          </div>
          <div className="mt-3 space-y-2">
            {todayRemindersTyped.length === 0 && (
              <p className="text-sm text-slate-400">Aucun rappel aujourd&apos;hui.</p>
            )}
            {todayRemindersTyped.map((r) => (
              <Link
                key={r.id}
                href={r.prospect ? `/prospects/${r.prospect.id}` : "/reminders"}
                className="block rounded-lg border border-slate-100 px-3 py-2 hover:border-[#3B82F6]/40 hover:bg-blue-50/40"
              >
                <div className="text-sm font-medium text-[#0F172A]">{r.title}</div>
                <div className="mt-0.5 text-xs text-slate-500">
                  {r.prospect?.company_name ?? "—"}
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-[#0F172A]">Interactions récentes</h2>
          <div className="mt-3 space-y-3">
            {recentInteractionsTyped.length === 0 && (
              <p className="text-sm text-slate-400">Aucune interaction récente.</p>
            )}
            {recentInteractionsTyped.map((i) => (
              <Link
                key={i.id}
                href={i.prospect ? `/prospects/${i.prospect.id}` : "#"}
                className="block rounded-lg border border-slate-100 px-3 py-2 hover:border-[#3B82F6]/40 hover:bg-blue-50/40"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-[#0F172A]">
                    {i.prospect?.company_name ?? "—"}
                  </span>
                  <span className="whitespace-nowrap text-[11px] text-slate-400">
                    {timeAgo(i.created_at)}
                  </span>
                </div>
                <div className="mt-0.5 text-xs text-slate-500">
                  {INTERACTION_TYPE[i.interaction_type]}
                  {i.done_by && profileMap.get(i.done_by)
                    ? ` · ${profileMap.get(i.done_by)}`
                    : ""}
                </div>
                <div className="mt-1 line-clamp-2 text-xs text-slate-600">{i.summary}</div>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <RecentProspects />
    </div>
  );
}

async function RecentProspects() {
  const supabase = await createClient();
  const { data: prospects } = await supabase
    .from("prospects")
    .select("id, company_name, contact_name, status, date_last_contact")
    .order("updated_at", { ascending: false })
    .limit(6);

  return (
    <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[#0F172A]">
          Prospects récemment mis à jour
        </h2>
        <Link href="/prospects" className="text-xs font-medium text-[#3B82F6]">
          Voir tout →
        </Link>
      </div>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[500px] text-left text-sm">
          <tbody>
            {(prospects ?? []).map((p) => (
              <tr key={p.id} className="border-t border-slate-100">
                <td className="py-2 pr-3">
                  <Link href={`/prospects/${p.id}`} className="font-medium text-[#0F172A] hover:text-[#3B82F6]">
                    {p.company_name}
                  </Link>
                </td>
                <td className="py-2 pr-3 text-slate-500">{p.contact_name ?? "—"}</td>
                <td className="py-2 pr-3">
                  <ProspectStatusBadge status={p.status} />
                </td>
                <td className="py-2 text-right text-xs text-slate-400">
                  {formatDate(p.date_last_contact)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
