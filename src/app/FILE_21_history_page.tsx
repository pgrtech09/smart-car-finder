"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Filter, Trash2, Navigation, Calendar, X } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { useAuth } from "@/hooks/useAuth";
import { useParking } from "@/hooks/useParking";
import { useGeolocation } from "@/hooks/useGeolocation";
import { ParkingCard } from "@/components/map/ParkingCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import type { ParkingLocation } from "@/types";

type FilterType = "all" | "today" | "week" | "month" | "retrieved";

export default function HistoryPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { fetchHistory, markRetrieved, deleteParking } = useParking(user?.id);
  const { coords: userCoords } = useGeolocation();

  const [history, setHistory] = useState<ParkingLocation[]>([]);
  const [filtered, setFiltered] = useState<ParkingLocation[]>([]);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const data = await fetchHistory(100);
    setHistory(data);
    setLoading(false);
  }, [user, fetchHistory]);

  useEffect(() => {
    load();
  }, [load]);

  // Apply search + filter
  useEffect(() => {
    let result = [...history];
    const now = new Date();

    if (activeFilter === "today") {
      result = result.filter((p) => {
        const d = new Date(p.parked_at);
        return d.toDateString() === now.toDateString();
      });
    } else if (activeFilter === "week") {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      result = result.filter((p) => new Date(p.parked_at) >= weekAgo);
    } else if (activeFilter === "month") {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      result = result.filter((p) => new Date(p.parked_at) >= monthAgo);
    } else if (activeFilter === "retrieved") {
      result = result.filter((p) => !!p.retrieved_at);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.address?.toLowerCase().includes(q) ||
          p.car?.car_name?.toLowerCase().includes(q) ||
          p.car?.car_model?.toLowerCase().includes(q) ||
          new Date(p.parked_at).toLocaleDateString().includes(q)
      );
    }

    setFiltered(result);
  }, [history, search, activeFilter]);

  const handleDelete = async (id: string) => {
    setDeleting(id);
    await deleteParking(id);
    setHistory((prev) => prev.filter((p) => p.id !== id));
    setDeleting(null);
  };

  const handleMarkRetrieved = async (id: string) => {
    await markRetrieved(id);
    setHistory((prev) =>
      prev.map((p) => (p.id === id ? { ...p, retrieved_at: new Date().toISOString() } : p))
    );
  };

  const handleDeleteAll = async () => {
    if (!confirm("Delete all parking history? This cannot be undone.")) return;
    for (const p of history) {
      await deleteParking(p.id);
    }
    setHistory([]);
  };

  const filters: { key: FilterType; label: string }[] = [
    { key: "all", label: "All" },
    { key: "today", label: "Today" },
    { key: "week", label: "This Week" },
    { key: "month", label: "This Month" },
    { key: "retrieved", label: "Retrieved" },
  ];

  return (
    <AppShell>
      <div className="p-4 pb-6 space-y-4 max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between pt-2">
          <div>
            <h1 className="text-xl font-bold text-white">Parking History</h1>
            <p className="text-xs text-slate-400 mt-0.5">{history.length} total records</p>
          </div>
          {history.length > 0 && (
            <button
              onClick={handleDeleteAll}
              className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Trash2 size={12} /> Clear All
            </button>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by address, car, date…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface-800 border border-white/10 rounded-xl pl-9 pr-9 py-2.5 text-sm text-white placeholder-slate-500 focus:border-brand-500/50 transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filter Chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {filters.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveFilter(key)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                activeFilter === key
                  ? "bg-brand-600 text-white shadow-glow"
                  : "bg-surface-700 text-slate-400 border border-white/10 hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Results count */}
        {search || activeFilter !== "all" ? (
          <p className="text-xs text-slate-500 flex items-center gap-1">
            <Filter size={11} />
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          </p>
        ) : null}

        {/* List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 rounded-2xl shimmer" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Calendar size={28} className="text-slate-500" />}
            title={search || activeFilter !== "all" ? "No results found" : "No parking history"}
            description={
              search || activeFilter !== "all"
                ? "Try a different search or filter."
                : "Your parking locations will appear here after you park your car."
            }
            action={
              search || activeFilter !== "all" ? (
                <Button
                  variant="ghost"
                  onClick={() => { setSearch(""); setActiveFilter("all"); }}
                >
                  Clear Filters
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="space-y-3">
            {filtered.map((parking) => (
              <ParkingCard
                key={parking.id}
                parking={deleting === parking.id ? { ...parking, id: "deleting" } : parking}
                userCoords={userCoords}
                onNavigate={(p) =>
                  router.push(`/map?lat=${p.latitude}&lng=${p.longitude}`)
                }
                onMarkRetrieved={handleMarkRetrieved}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
