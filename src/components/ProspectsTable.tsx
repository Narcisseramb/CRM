"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRealtimeRows } from "@/lib/useRealtimeRows";
import { ProspectStatusBadge } from "@/components/StatusBadge";
import { PriorityBadge } from "@/components/PriorityBadge";
import { PROSPECT_STATUS, PRIORITY, PROVINCES, MKB_ANGLES } from "@/lib/constants";
import { formatDate, downloadCsv } from "@/lib/utils";
import type { Prospect } from "@/lib/types";
import { NewProspectModal } from "@/components/NewProspectModal";

export function ProspectsTable({ initialProspects }: { initialProspects: Prospect[] }) {
  const [prospects] = useRealtimeRows<Prospect>("prospects", initialProspects);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [province, setProvince] = useState("");
  const [angle, setAngle] = useState("");
  const [semaine, setSemaine] = useState("");
  const [showNew, setShowNew] = useState(false);

  const semaines = useMemo(() => {
    const set = new Set<string>();
    prospects.forEach((p) => p.semaine_contact && set.add(p.semaine_contact));
    return Array.from(set).sort();
  }, [prospects]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return prospects.filter((p) => {
      if (status && p.status !== status) return false;
      if (priority && p.priority !== priority) return false;
      if (province && p.province !== province) return false;
      if (semaine && p.semaine_contact !== semaine) return false;
      if (angle && !(p.mkb_angle ?? []).includes(angle)) return false;
      if (!q) return true;
      const haystack = [
        p.company_name,
        p.contact_name,
        p.contact2_name,
        p.sector,
        p.city,
        p.email_main,
        p.phone_main,
        p.notes,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [prospects, search, status, priority, province, semaine, angle]);

  function handleExport() {
    downloadCsv(
      `prospects_mkb_${new Date().toISOString().slice(0, 10)}.csv`,
      filtered.map((p) => ({
        entreprise: p.company_name,
        secteur: p.sector,
        ville: p.city,
        province: p.province,
        contact: p.contact_name,
        telephone: p.phone_main,
        courriel: p.email_main,
        statut: PROSPECT_STATUS[p.status]?.label ?? p.status,
        priorite: PRIORITY[p.priority]?.label ?? p.priority,
        angle_mkb: p.mkb_angle,
        semaine: p.semaine_contact,
        dernier_contact: p.date_last_contact,
        prochain_suivi: p.date_next_followup,
      })),
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher (entreprise, contact, ville, courriel...)"
          className="min-w-[220px] flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-[#3B82F6] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
        >
          <option value="">Tous les statuts</option>
          {Object.entries(PROSPECT_STATUS).map(([key, s]) => (
            <option key={key} value={key}>
              {s.label}
            </option>
          ))}
        </select>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
        >
          <option value="">Toutes priorités</option>
          {Object.entries(PRIORITY).map(([key, p]) => (
            <option key={key} value={key}>
              {p.label}
            </option>
          ))}
        </select>
        <select
          value={province}
          onChange={(e) => setProvince(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
        >
          <option value="">Toutes provinces</option>
          {PROVINCES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <select
          value={angle}
          onChange={(e) => setAngle(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
        >
          <option value="">Tous les angles MKB</option>
          {MKB_ANGLES.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
        {semaines.length > 0 && (
          <select
            value={semaine}
            onChange={(e) => setSemaine(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            <option value="">Toutes semaines</option>
            {semaines.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        )}
        <button
          onClick={handleExport}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Exporter CSV
        </button>
        <button
          onClick={() => setShowNew(true)}
          className="rounded-lg bg-[#3B82F6] px-3 py-2 text-sm font-semibold text-white hover:bg-[#2563EB]"
        >
          + Nouveau prospect
        </button>
      </div>

      <p className="mt-3 text-xs text-slate-500">
        {filtered.length} prospect{filtered.length > 1 ? "s" : ""}
      </p>

      <div className="mt-2 overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-2.5 font-semibold">Entreprise</th>
              <th className="px-4 py-2.5 font-semibold">Contact</th>
              <th className="px-4 py-2.5 font-semibold">Statut</th>
              <th className="px-4 py-2.5 font-semibold">Priorité</th>
              <th className="px-4 py-2.5 font-semibold">Dernier contact</th>
              <th className="px-4 py-2.5 font-semibold">Prochain suivi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-2.5">
                  <Link
                    href={`/prospects/${p.id}`}
                    className="font-medium text-[#0F172A] hover:text-[#3B82F6]"
                  >
                    {p.company_name}
                  </Link>
                  {p.city && (
                    <span className="ml-1.5 text-xs text-slate-400">
                      · {p.city}
                      {p.province ? `, ${p.province}` : ""}
                    </span>
                  )}
                </td>
                <td className="px-4 py-2.5 text-slate-600">{p.contact_name ?? "—"}</td>
                <td className="px-4 py-2.5">
                  <ProspectStatusBadge status={p.status} />
                </td>
                <td className="px-4 py-2.5">
                  <PriorityBadge priority={p.priority} />
                </td>
                <td className="px-4 py-2.5 text-xs text-slate-500">
                  {formatDate(p.date_last_contact)}
                </td>
                <td className="px-4 py-2.5 text-xs text-slate-500">
                  {formatDate(p.date_next_followup)}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-400">
                  Aucun prospect ne correspond aux filtres.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showNew && <NewProspectModal onClose={() => setShowNew(false)} />}
    </div>
  );
}
