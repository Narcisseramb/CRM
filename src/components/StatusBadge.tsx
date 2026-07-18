import { LEAD_STATUS, PROSPECT_STATUS } from "@/lib/constants";
import type { LeadStatus, ProspectStatus } from "@/lib/types";

export function ProspectStatusBadge({ status }: { status: ProspectStatus }) {
  const style = PROSPECT_STATUS[status];
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-medium ${style.className}`}
    >
      {style.label}
    </span>
  );
}

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  const style = LEAD_STATUS[status];
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-medium ${style.className}`}
    >
      {style.label}
    </span>
  );
}
