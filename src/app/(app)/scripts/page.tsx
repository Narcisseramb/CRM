import { createClient } from "@/lib/supabase/server";
import { ScriptsLibrary } from "@/components/ScriptsLibrary";

export const dynamic = "force-dynamic";

export default async function ScriptsPage() {
  const supabase = await createClient();
  const [{ data: scripts }, { data: prospects }] = await Promise.all([
    supabase.from("scripts_emails").select("*").order("created_at", { ascending: false }),
    supabase.from("prospects").select("*").order("company_name", { ascending: true }),
  ]);

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-xl font-semibold text-[#0F172A]">Scripts & courriels</h1>
      <p className="mt-1 text-sm text-slate-500">
        Bibliothèque de scripts d&apos;appel et courriels de prospection
      </p>
      <div className="mt-6">
        <ScriptsLibrary initialScripts={scripts ?? []} prospects={prospects ?? []} />
      </div>
    </div>
  );
}
