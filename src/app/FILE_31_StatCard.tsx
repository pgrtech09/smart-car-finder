import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface StatCardProps {
  icon: ReactNode;
  iconBg?: string;
  label: string;
  value: string;
  sub?: string;
  className?: string;
}

export function StatCard({ icon, iconBg = "bg-brand-500/20", label, value, sub, className }: StatCardProps) {
  return (
    <div className={cn("glass rounded-2xl p-4 shadow-card", className)}>
      <div className="flex items-start gap-3">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", iconBg)}>
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-xs text-slate-500 mb-0.5">{label}</p>
          <p className="text-lg font-bold text-white leading-tight truncate">{value}</p>
          {sub && <p className="text-xs text-slate-400 mt-0.5 truncate">{sub}</p>}
        </div>
      </div>
    </div>
  );
}
