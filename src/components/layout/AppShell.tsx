"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Map, History, Settings, Car } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Home" },
  { href: "/map", icon: Map, label: "Map" },
  { href: "/history", icon: History, label: "History" },
  { href: "/setup", icon: Settings, label: "Setup" },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-surface-900 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 safe-top">
        <div className="glass border-b border-white/5 px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow">
            <Car size={16} className="text-white" />
          </div>
          <span className="font-bold text-white tracking-tight">Smart Car Finder</span>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-auto pb-20">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 safe-bottom">
        <div className="glass border-t border-white/5 px-2 py-2">
          <div className="flex items-center justify-around">
            {navItems.map(({ href, icon: Icon, label }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-all min-w-[60px]",
                    active
                      ? "text-brand-400 bg-brand-500/10"
                      : "text-slate-500 hover:text-slate-300"
                  )}
                >
                  <Icon
                    size={20}
                    strokeWidth={active ? 2.5 : 1.8}
                    className={active ? "text-brand-400" : ""}
                  />
                  <span className={cn("text-xs font-medium", active ? "text-brand-400" : "")}>
                    {label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}
