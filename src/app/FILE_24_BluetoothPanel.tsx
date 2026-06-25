"use client";

import { Bluetooth, BluetoothConnected, BluetoothOff, MapPin, Wifi } from "lucide-react";
import { useBluetooth } from "@/hooks/useBluetooth";
import { useParking } from "@/hooks/useParking";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { cn } from "@/lib/utils";

interface BluetoothPanelProps {
  userId: string;
  carId: string;
  bluetoothDeviceName?: string;
  onParkingSaved?: (loc: { latitude: number; longitude: number; address?: string }) => void;
}

export function BluetoothPanel({
  userId,
  carId,
  bluetoothDeviceName,
  onParkingSaved,
}: BluetoothPanelProps) {
  const { saveParking, loading: savingParking } = useParking(userId);

  const handleDisconnect = async () => {
    const saved = await saveParking(carId);
    if (saved) {
      onParkingSaved?.({ latitude: saved.latitude, longitude: saved.longitude, address: saved.address });
    }
  };

  const { status, isSupported, connectedDevice, error, connect, disconnect } = useBluetooth({
    deviceName: bluetoothDeviceName,
    onDisconnect: handleDisconnect,
  });

  const handleManualPark = async () => {
    const saved = await saveParking(carId);
    if (saved) {
      onParkingSaved?.({ latitude: saved.latitude, longitude: saved.longitude, address: saved.address });
    }
  };

  const statusMap: Record<string, "connected" | "disconnected" | "scanning" | "idle"> = {
    connected: "connected",
    disconnected: "disconnected",
    scanning: "scanning",
    idle: "idle",
    unsupported: "idle",
  };

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "w-9 h-9 rounded-xl flex items-center justify-center",
              status === "connected" ? "bg-green-500/20" : "bg-brand-500/20"
            )}
          >
            {status === "connected" ? (
              <BluetoothConnected size={18} className="text-green-400" />
            ) : status === "disconnected" ? (
              <BluetoothOff size={18} className="text-red-400" />
            ) : (
              <Bluetooth size={18} className="text-brand-400" />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Bluetooth</p>
            {connectedDevice && (
              <p className="text-xs text-slate-400 truncate max-w-[140px]">{connectedDevice.name}</p>
            )}
          </div>
        </div>
        <StatusBadge status={statusMap[status] ?? "idle"} />
      </div>

      {!isSupported && (
        <div className="flex items-start gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3">
          <Wifi size={14} className="text-yellow-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-yellow-300">
            Web Bluetooth is not available in this browser. Use the manual button below.
          </p>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-xs">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        {isSupported && (
          <Button
            variant={status === "connected" ? "danger" : "primary"}
            size="sm"
            onClick={status === "connected" ? disconnect : connect}
            loading={status === "scanning"}
            icon={status === "connected" ? <BluetoothOff size={14} /> : <Bluetooth size={14} />}
            className="w-full"
          >
            {status === "connected" ? "Disconnect" : "Pair Device"}
          </Button>
        )}

        <Button
          variant="secondary"
          size="sm"
          onClick={handleManualPark}
          loading={savingParking}
          icon={<MapPin size={14} />}
          className={cn("w-full", !isSupported && "col-span-2")}
        >
          Park Here
        </Button>
      </div>

      <p className="text-xs text-slate-500 text-center">
        {isSupported
          ? "Connect your car's Bluetooth. Location auto-saves when it disconnects."
          : 'Tap "Park Here" whenever you park your car.'}
      </p>
    </Card>
  );
}
