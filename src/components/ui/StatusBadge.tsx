import { cn } from "@/lib/utils";

type Status = "connected" | "disconnected" | "scanning" | "idle" | "parked" | "active";

const statusConfig: Record<Status, { label: string; dot: string; bg: string; text: string }> = {
  connected: { label: "Connected", dot: "bg-green-400", bg: "bg-green-500/10", text: "text-green-400" },
  disconnected: { label: "Disconnected", dot: "bg-red-400", bg: "bg-red-500/10", text: "text-red-400" },
  scanning: { label: "Scanning…", dot: "bg-yellow-400 animate-ping-slow", bg: "bg-yellow-500/10", text: "text-yellow-400" },
  idle: { label: "Idle", dot: "bg-slate-400", bg: "bg-slate-500/10", text: "text-slate-400" },
  parked: { label: "Parked", dot: "bg-brand-400", bg: "bg-brand-500/10", text: "text-brand-400" },
  active: { label: "Active", dot: "bg-cyan-400", bg: "bg-cyan-500/10", text: "text-cyan-400" },
};

export function StatusBadge({ status, label }: { status: Status; label?: string }) {
  const cfg = statusConfig[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium", cfg.bg, cfg.text)}>
      <span className={cn("w-1.5 h-1.5 rounded-full", cfg.dot)} />
      {label ?? cfg.label}
    </span>
  );
}
