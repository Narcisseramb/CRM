import Link from "next/link";
import { LeadStatusBadge } from "@/components/StatusBadge";
import { LeadPriorityBadge } from "@/components/PriorityBadge";
import { formatDate, formatDateTime } from "@/lib/utils";
import type { Lead, Prospect } from "@/lib/types";

export function LeadCard({ lead, prospect }: { lead: Lead; prospect: Prospect | undefined }) {
  return (
    <Link
      href={prospect ? `/prospects/${prospect.id}` : "#"}
      className="block rounded-xl border border-slate-200 bg-white p-4 transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-[#0F172A]">
          {prospect?.company_name ?? "Prospect supprimé"}
        </h3>
        <LeadPriorityBadge priority={lead.lead_priority} />
      </div>

      <div className="mt-2">
        <LeadStatusBadge status={lead.lead_status} />
      </div>

      {lead.decision_maker_name && (
        <p className="mt-2 text-xs text-slate-500">
          Décideur : <span className="text-slate-700">{lead.decision_maker_name}</span>
        </p>
      )}

      {lead.need_description && (
        <p className="mt-1 line-clamp-2 text-xs text-slate-600">{lead.need_description}</p>
      )}

      <div className="mt-3 space-y-1 border-t border-slate-100 pt-2 text-xs">
        {lead.action_narcisse && (
          <p className="text-slate-500">
            <span className="font-medium text-slate-700">Narcisse :</span> {lead.action_narcisse}
          </p>
        )}
        {lead.action_marek && (
          <p className="text-slate-500">
            <span className="font-medium text-slate-700">Marek :</span> {lead.action_marek}
          </p>
        )}
        {lead.action_deadline && (
          <p className="text-red-500">Échéance : {formatDate(lead.action_deadline)}</p>
        )}
        {lead.rdv_date && (
          <p className="text-[#3B82F6]">RDV : {formatDateTime(lead.rdv_date)}</p>
        )}
      </div>
    </Link>
  );
}
