"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Car, MapPin, Navigation, Clock, Bluetooth, Settings, LogOut, RefreshCw,
} from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { useAuth } from "@/hooks/useAuth";
import { useCar } from "@/hooks/useCar";
import { useParking } from "@/hooks/useParking";
import { useGeolocation } from "@/hooks/useGeolocation";
import { BluetoothPanel } from "@/components/bluetooth/BluetoothPanel";
import { StatCard } from "@/components/ui/StatCard";
import { ParkingCard } from "@/components/map/ParkingCard";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { calculateDistance, formatDistance, formatDateTime } from "@/lib/utils";
import type { Car as CarType, ParkingLocation } from "@/types";

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const { fetchCars } = useCar(user?.id);
  const { fetchLatest, fetchHistory, markRetrieved, deleteParking, saveParking } = useParking(user?.id);
  const { coords: userCoords, refresh: refreshLocation } = useGeolocation();

  const [cars, setCars] = useState<CarType[]>([]);
  const [activeCar, setActiveCar] = useState<CarType | null>(null);
  const [latestParking, setLatestParking] = useState<ParkingLocation | null>(null);
  const [recentHistory, setRecentHistory] = useState<ParkingLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingManual, setSavingManual] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const [carsData, parkingData, historyData] = await Promise.all([
      fetchCars(),
      fetchLatest(),
      fetchHistory(3),
    ]);
    setCars(carsData);
    setActiveCar(carsData[0] ?? null);
    setLatestParking(parkingData);
    setRecentHistory(historyData);
    setLoading(false);
  }, [user, fetchCars, fetchLatest, fetchHistory]);

  useEffect(() => {
    if (!authLoading && !user) router.push("/auth");
    else if (!authLoading && user) load();
  }, [authLoading, user, router, load]);

  const handleManualPark = async () => {
    if (!activeCar) return;
    setSavingManual(true);
    const saved = await saveParking(activeCar.id);
    if (saved) {
      setLatestParking(saved);
      showToast("📍 Parking location saved!");
      load();
    }
    setSavingManual(false);
  };

  const distance =
    latestParking && userCoords
      ? calculateDistance(
          userCoords.latitude, userCoords.longitude,
          latestParking.latitude, latestParking.longitude
        )
      : null;

  if (authLoading || loading) {
    return (
      <AppShell>
        <div className="p-4 space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-2xl shimmer" />
          ))}
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="p-4 pb-6 space-y-5 max-w-lg mx-auto">
        {/* Toast */}
        {toast && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white text-sm font-medium px-4 py-2 rounded-full shadow-lg animate-fade-in">
            {toast}
          </div>
        )}

        {/* Welcome */}
        <div className="flex items-center justify-between pt-2">
          <div>
            <p className="text-slate-400 text-sm">Welcome back,</p>
            <h1 className="text-xl font-bold text-white">
              {user?.user_metadata?.full_name?.split(" ")[0] ?? "Driver"} 👋
            </h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={load}
              className="w-9 h-9 rounded-xl bg-surface-700 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            >
              <RefreshCw size={15} />
            </button>
            <button
              onClick={() => router.push("/setup")}
              className="w-9 h-9 rounded-xl bg-surface-700 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            >
              <Settings size={15} />
            </button>
            <button
              onClick={signOut}
              className="w-9 h-9 rounded-xl bg-surface-700 border border-white/10 flex items-center justify-center text-slate-400 hover:text-red-400 transition-colors"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>

        {/* No car setup */}
        {cars.length === 0 ? (
          <EmptyState
            icon={<Car size={28} className="text-brand-400" />}
            title="Add your car"
            description="Set up your car to start tracking your parking location automatically."
            action={
              <Button onClick={() => router.push("/setup")} icon={<Settings size={15} />}>
                Set Up My Car
              </Button>
            }
          />
        ) : (
          <>
            {/* Active Car Card */}
            {activeCar && (
              <div className="glass rounded-2xl p-5 shadow-card border border-white/5 bg-card-glow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-brand flex items-center justify-center shadow-glow">
                    <Car size={22} className="text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-white">{activeCar.car_name}</h2>
                    <p className="text-sm text-slate-400">{activeCar.car_model}</p>
                  </div>
                  {cars.length > 1 && (
                    <button
                      onClick={() => {
                        const idx = cars.findIndex((c) => c.id === activeCar.id);
                        setActiveCar(cars[(idx + 1) % cars.length]);
                      }}
                      className="ml-auto text-xs text-brand-400 hover:text-brand-300"
                    >
                      Switch
                    </button>
                  )}
                </div>

                <BluetoothPanel
                  userId={user?.id ?? ""}
                  carId={activeCar.id}
                  bluetoothDeviceName={activeCar.bluetooth_device_name}
                  onParkingSaved={() => { showToast("📍 Location saved automatically!"); load(); }}
                />
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <StatCard
                icon={<MapPin size={18} className="text-brand-400" />}
                label="Last Parked"
                value={latestParking ? formatDateTime(latestParking.parked_at).split(" at ")[0] : "—"}
                sub={latestParking ? formatDateTime(latestParking.parked_at).split(" at ")[1] : "No records yet"}
              />
              <StatCard
                icon={<Navigation size={18} className="text-cyan-400" />}
                iconBg="bg-cyan-500/20"
                label="Distance to Car"
                value={distance !== null ? formatDistance(distance) : "—"}
                sub={userCoords ? "Live location" : "Enable location"}
                className="cursor-pointer"
              />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="primary"
                icon={<MapPin size={15} />}
                onClick={handleManualPark}
                loading={savingManual}
                className="w-full justify-center"
              >
                Park Here Now
              </Button>
              <Button
                variant="secondary"
                icon={<Navigation size={15} />}
                onClick={() => router.push("/map")}
                className="w-full justify-center"
              >
                Find My Car
              </Button>
            </div>

            {/* Recent Parking */}
            {recentHistory.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
                    <Clock size={14} className="text-slate-400" /> Recent
                  </h3>
                  <button
                    onClick={() => router.push("/history")}
                    className="text-xs text-brand-400 hover:text-brand-300"
                  >
                    View all
                  </button>
                </div>
                <div className="space-y-2">
                  {recentHistory.map((p) => (
                    <ParkingCard
                      key={p.id}
                      parking={p}
                      userCoords={userCoords}
                      onNavigate={() => router.push(`/map?lat=${p.latitude}&lng=${p.longitude}`)}
                      onMarkRetrieved={async (id) => {
                        await markRetrieved(id);
                        load();
                      }}
                      onDelete={async (id) => {
                        await deleteParking(id);
                        load();
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
