export function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number | string;
  accent?: "blue" | "red" | "amber" | "emerald";
}) {
  const accentClass =
    accent === "red"
      ? "text-red-600"
      : accent === "amber"
        ? "text-amber-600"
        : accent === "emerald"
          ? "text-emerald-600"
          : "text-[#0F172A]";

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
      <div className={`text-2xl font-semibold ${accentClass}`}>{value}</div>
      <div className="mt-1 text-[11px] text-slate-500">{label}</div>
    </div>
  );
}
