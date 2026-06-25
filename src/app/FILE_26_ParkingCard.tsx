"use client";

import { MapPin, Clock, Navigation, Trash2, CheckCircle } from "lucide-react";
import { formatDate, formatTime, formatDistance, calculateDistance } from "@/lib/utils";
import type { ParkingLocation, Coordinates } from "@/types";
import { Button } from "@/components/ui/Button";

interface ParkingCardProps {
  parking: ParkingLocation;
  userCoords?: Coordinates | null;
  onDelete?: (id: string) => void;
  onNavigate?: (parking: ParkingLocation) => void;
  onMarkRetrieved?: (id: string) => void;
}

export function ParkingCard({
  parking,
  userCoords,
  onDelete,
  onNavigate,
  onMarkRetrieved,
}: ParkingCardProps) {
  const distance =
    userCoords
      ? calculateDistance(
          userCoords.latitude,
          userCoords.longitude,
          parking.latitude,
          parking.longitude
        )
      : null;

  return (
    <div className="glass rounded-2xl p-4 shadow-card border border-white/5 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-brand-500/20 flex items-center justify-center flex-shrink-0">
            <MapPin size={14} className="text-brand-400" />
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-semibold truncate">
              {parking.address || `${parking.latitude.toFixed(4)}, ${parking.longitude.toFixed(4)}`}
            </p>
            {parking.car && (
              <p className="text-xs text-slate-500 truncate">{parking.car.car_name}</p>
            )}
          </div>
        </div>
        {parking.retrieved_at && (
          <span className="text-xs text-green-400 flex items-center gap-1 flex-shrink-0">
            <CheckCircle size={12} />
            Retrieved
          </span>
        )}
      </div>

      {/* Time + Distance */}
      <div className="flex items-center gap-4 text-xs text-slate-400">
        <span className="flex items-center gap-1">
          <Clock size={12} />
          {formatDate(parking.parked_at)} · {formatTime(parking.parked_at)}
        </span>
        {distance !== null && (
          <span className="flex items-center gap-1 text-brand-400">
            <Navigation size={12} />
            {formatDistance(distance)}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {onNavigate && (
          <Button
            variant="secondary"
            size="sm"
            icon={<Navigation size={13} />}
            onClick={() => onNavigate(parking)}
            className="flex-1"
          >
            Navigate
          </Button>
        )}
        {onMarkRetrieved && !parking.retrieved_at && (
          <Button
            variant="success"
            size="sm"
            icon={<CheckCircle size={13} />}
            onClick={() => onMarkRetrieved(parking.id)}
            className="flex-1"
          >
            Retrieved
          </Button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(parking.id)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors flex-shrink-0"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
