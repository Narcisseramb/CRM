import { LEAD_PRIORITY, PRIORITY } from "@/lib/constants";
import type { LeadPriority, Priority } from "@/lib/types";

export function PriorityBadge({ priority }: { priority: Priority }) {
  const style = PRIORITY[priority];
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-medium ${style.className}`}
    >
      {style.label}
    </span>
  );
}

export function LeadPriorityBadge({ priority }: { priority: LeadPriority }) {
  const style = LEAD_PRIORITY[priority];
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-medium ${style.className}`}
    >
      {style.label}
    </span>
  );
}
