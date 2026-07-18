"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LogoutButton } from "./LogoutButton";
import type { Profile } from "@/lib/types";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Tableau de bord", icon: "◧" },
  { href: "/prospects", label: "Prospects", icon: "☰" },
  { href: "/leads", label: "Leads chauds", icon: "★" },
  { href: "/reminders", label: "Rappels", icon: "◔" },
  { href: "/scripts", label: "Scripts & emails", icon: "✉" },
];

export function Sidebar({ profile }: { profile: Profile | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const nav = (
    <nav className="flex-1 space-y-1 px-3 py-4">
      {NAV_ITEMS.map((item) => {
        const active = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              active
                ? "bg-[#3B82F6] text-white"
                : "text-slate-300 hover:bg-white/5 hover:text-white"
            }`}
          >
            <span aria-hidden className="w-4 text-center text-base leading-none">
              {item.icon}
            </span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="flex items-center justify-between bg-[#0F172A] px-4 py-3 md:hidden">
        <button
          onClick={() => setOpen(true)}
          aria-label="Ouvrir le menu"
          className="rounded-md p-1.5 text-slate-300 hover:bg-white/5"
        >
          ☰
        </button>
        <div className="text-lg font-bold text-[#3B82F6]">
          MKB <span className="font-normal text-white">CRM</span>
        </div>
        <LogoutButton />
      </div>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-[#0F172A] transition-transform md:static md:z-auto md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="hidden px-5 py-6 md:block">
          <div className="text-2xl font-bold text-[#3B82F6]">MKB</div>
          <div className="text-[11px] uppercase tracking-widest text-slate-400">
            Logistics — CRM
          </div>
        </div>

        {nav}

        <div className="border-t border-white/10 px-4 py-4">
          <div className="text-sm font-medium text-white">
            {profile?.full_name ?? "…"}
          </div>
          <div className="mt-0.5 text-xs text-slate-400">
            {profile?.role === "president" ? "Président" : "Prospecteur"}
          </div>
          <div className="mt-3 hidden md:block">
            <LogoutButton />
          </div>
        </div>
      </aside>
    </>
  );
}
