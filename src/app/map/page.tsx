"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Navigation, MapPin, RefreshCw, LocateFixed, Car } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { useAuth } from "@/hooks/useAuth";
import { useParking } from "@/hooks/useParking";
import { useGeolocation } from "@/hooks/useGeolocation";
import { Button } from "@/components/ui/Button";
import { calculateDistance, formatDistance, formatDateTime } from "@/lib/utils";
import type { ParkingLocation } from "@/types";

function MapDisplay({ carLocation, userLocation }: {
  carLocation?: { latitude: number; longitude: number };
  userLocation?: { latitude: number; longitude: number } | null;
}) {
  const [loaded, setLoaded] = useState(false);
  const [Comp, setComp] = useState<React.ComponentType<{
    carLocation?: { latitude: number; longitude: number };
    userLocation?: { latitude: number; longitude: number } | null;
    height?: string;
    zoom?: number;
  }> | null>(null);

  useEffect(() => {
    let cancelled = false;
    import("../../../components/map/ParkingMap").then((m) => {
      if (!cancelled) {
        setComp(() => m.ParkingMap);
        setLoaded(true);
      }
    }).catch(() => setLoaded(false));
    return () => { cancelled = true; };
  }, []);

  if (!loaded || !Comp) {
    return (
      <div className="h-80 rounded-xl bg-surface-800 border border-white/5 flex items-center justify-center">
        <p className="text-slate-500 text-sm animate-pulse">Loading map...</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden border border-white/5 shadow-card">
      <Comp carLocation={carLocation} userLocation={userLocation} height="320px" zoom={16} />
    </div>
  );
}

function MapContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const { fetchLatest } = useParking(user?.id);
  const { coords: userCoords, refresh: refreshLocation, loading: geoLoading } = useGeolocation();

  const [parking, setParking] = useState<ParkingLocation | null>(null);
  const [loading, setLoading] = useState(true);

  const paramLat = searchParams.get("lat");
  const paramLng = searchParams.get("lng");

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      const latest = await fetchLatest();
      setParking(latest);
      setLoading(false);
    };
    load();
  }, [user, fetchLatest]);

  const carLocation =
    paramLat && paramLng
      ? { latitude: parseFloat(paramLat), longitude: parseFloat(paramLng) }
      : parking
      ? { latitude: parking.latitude, longitude: parking.longitude }
      : undefined;

  const distance =
    carLocation && userCoords
      ? calculateDistance(
          userCoords.latitude,
          userCoords.longitude,
          carLocation.latitude,
          carLocation.longitude
        )
      : null;

  const openNativeNav = () => {
    if (!carLocation) return;
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${carLocation.latitude},${carLocation.longitude}`,
      "_blank"
    );
  };

  return (
    <div className="p-4 pb-6 space-y-4 max-w-lg mx-auto">
      <div className="flex items-center justify-between pt-2">
        <h1 className="text-xl font-bold text-white">Find My Car</h1>
        <button
          onClick={refreshLocation}
          className="w-9 h-9 rounded-xl bg-surface-700 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
        >
          <RefreshCw size={15} className={geoLoading ? "animate-spin" : ""} />
        </button>
      </div>

      {distance !== null && (
        <div className="glass rounded-2xl p-4 border border-brand-500/20 shadow-glow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 mb-1">Distance to your car</p>
              <p className="text-3xl font-bold text-white">{formatDistance(distance)}</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-brand flex items-center justify-center shadow-glow">
              <Navigation size={26} className="text-white" />
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="h-80 rounded-xl shimmer" />
      ) : carLocation ? (
        <MapDisplay carLocation={carLocation} userLocation={userCoords} />
      ) : (
        <div className="glass rounded-2xl p-8 text-center border border-white/5">
          <Car size={32} className="text-slate-500 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">No parking location saved yet.</p>
          <p className="text-slate-500 text-xs mt-1">Park your car first.</p>
        </div>
      )}

      {parking && (
        <div className="glass rounded-2xl p-4 space-y-2 border border-white/5">
          <div className="flex items-center gap-2">
            <MapPin size={15} className="text-brand-400" />
            <p className="text-sm font-semibold text-white">Last Parked Location</p>
          </div>
          <p className="text-sm text-slate-300 pl-5">
            {parking.address ||
              `${parking.latitude.toFixed(5)}, ${parking.longitude.toFixed(5)}`}
          </p>
          <p className="text-xs text-slate-500 pl-5">{formatDateTime(parking.parked_at)}</p>
        </div>
      )}

      <div className="flex gap-4 px-1">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <div className="w-3 h-3 rounded-full bg-brand-500" />
          Your Car
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <div className="w-3 h-3 rounded-full bg-green-400" />
          You
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="primary"
          icon={<Navigation size={15} />}
          onClick={openNativeNav}
          disabled={!carLocation}
          className="w-full justify-center"
        >
          Navigate
        </Button>
        <Button
          variant="secondary"
          icon={<LocateFixed size={15} />}
          onClick={refreshLocation}
          loading={geoLoading}
          className="w-full justify-center"
        >
          My Location
        </Button>
      </div>

      <Button
        variant="ghost"
        onClick={() => router.push("/history")}
        className="w-full justify-center text-slate-400"
      >
        View All Parking History
      </Button>
    </div>
  );
}

export default function MapPage() {
  return (
    <AppShell>
      <Suspense
        fallback={
          <div className="p-4 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 shimmer rounded-2xl" />
            ))}
          </div>
        }
      >
        <MapContent />
      </Suspense>
    </AppShell>
  );
}
