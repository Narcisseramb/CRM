import { createClient } from "@/lib/supabase/server";
import { LeadsGrid } from "@/components/LeadsGrid";

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  const supabase = await createClient();
  const [{ data: leads }, { data: prospects }] = await Promise.all([
    supabase.from("leads").select("*").order("created_at", { ascending: false }),
    supabase.from("prospects").select("*"),
  ]);

  return (
    <div className="mx-auto max-w-7xl">
      <h1 className="text-xl font-semibold text-[#0F172A]">Leads chauds</h1>
      <p className="mt-1 text-sm text-slate-500">
        Prospects avec intérêt confirmé, triés par priorité
      </p>
      <div className="mt-6">
        <LeadsGrid initialLeads={leads ?? []} initialProspects={prospects ?? []} />
      </div>
    </div>
  );
}
