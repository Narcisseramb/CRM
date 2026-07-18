import { createClient } from "@/lib/supabase/server";
import { ProspectsTable } from "@/components/ProspectsTable";

export const dynamic = "force-dynamic";

export default async function ProspectsPage() {
  const supabase = await createClient();
  const { data: prospects } = await supabase
    .from("prospects")
    .select("*")
    .order("updated_at", { ascending: false });

  return (
    <div className="mx-auto max-w-7xl">
      <h1 className="text-xl font-semibold text-[#0F172A]">Prospects</h1>
      <p className="mt-1 text-sm text-slate-500">
        Tous les prospects contactés par MKB Logistics
      </p>
      <div className="mt-6">
        <ProspectsTable initialProspects={prospects ?? []} />
      </div>
    </div>
  );
}
