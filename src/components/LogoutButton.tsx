"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="rounded-md px-2 py-1 text-xs font-medium text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
    >
      Déconnexion
    </button>
  );
}
