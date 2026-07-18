import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProspectDetail } from "@/components/ProspectDetail";
import { profileMapFrom } from "@/components/InteractionTimeline";
import type { Profile } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ProspectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [
    { data: prospect },
    { data: lead },
    { data: interactions },
    { data: reminders },
    { data: scripts },
    { data: profiles },
  ] = await Promise.all([
    supabase.from("prospects").select("*").eq("id", id).single(),
    supabase.from("leads").select("*").eq("prospect_id", id).maybeSingle(),
    supabase
      .from("interactions")
      .select("*")
      .eq("prospect_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("reminders")
      .select("*")
      .eq("prospect_id", id)
      .order("reminder_date", { ascending: true }),
    supabase
      .from("scripts_emails")
      .select("*")
      .eq("prospect_id", id)
      .order("created_at", { ascending: false }),
    supabase.from("profiles").select("*"),
  ]);

  if (!prospect) {
    notFound();
  }

  const currentProfile = (profiles ?? []).find((p: Profile) => p.id === user?.id) ?? null;

  return (
    <ProspectDetail
      prospect={prospect}
      lead={lead ?? null}
      interactions={interactions ?? []}
      reminders={reminders ?? []}
      scripts={scripts ?? []}
      profiles={profiles ?? []}
      profileMap={profileMapFrom(profiles)}
      currentProfile={currentProfile}
    />
  );
}
