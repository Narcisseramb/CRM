import { createClient } from "@/lib/supabase/server";
import { RemindersView } from "@/components/RemindersView";

export const dynamic = "force-dynamic";

export default async function RemindersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: reminders }, { data: prospects }, { data: profiles }] = await Promise.all([
    supabase.from("reminders").select("*"),
    supabase.from("prospects").select("*"),
    supabase.from("profiles").select("*"),
  ]);

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-xl font-semibold text-[#0F172A]">Rappels</h1>
      <p className="mt-1 text-sm text-slate-500">Suivis à venir pour Narcisse et Marek</p>
      <div className="mt-6">
        <RemindersView
          initialReminders={reminders ?? []}
          initialProspects={prospects ?? []}
          profiles={profiles ?? []}
          currentUserId={user?.id ?? ""}
        />
      </div>
    </div>
  );
}
