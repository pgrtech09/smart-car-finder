"use client";

import { useState, useEffect, useCallback } from "react";
import type { BluetoothStatus } from "@/types";

interface UseBluetoothOptions {
  deviceName?: string;
  onDisconnect?: () => void;
  onConnect?: () => void;
}

export function useBluetooth({
  deviceName,
  onDisconnect,
  onConnect,
}: UseBluetoothOptions = {}) {
  const [status, setStatus] = useState<BluetoothStatus>("idle");
  const [isSupported, setIsSupported] = useState(false);
  // eslint-disable-next-line
  const [connectedDevice, setConnectedDevice] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsSupported(typeof navigator !== "undefined" && "bluetooth" in navigator);
  }, []);

  const handleDisconnect = useCallback(() => {
    setStatus("disconnected");
    setConnectedDevice(null);
    onDisconnect?.();
  }, [onDisconnect]);

  const connect = useCallback(async () => {
    if (!isSupported) {
      setError("Web Bluetooth is not supported in this browser");
      return;
    }
    setStatus("scanning");
    setError(null);
    try {
      // eslint-disable-next-line
      const nav = navigator as any;
      const device = await nav.bluetooth.requestDevice({
        acceptAllDevices: !deviceName,
        filters: deviceName ? [{ name: deviceName }] : undefined,
        optionalServices: ["generic_access"],
      });
      setConnectedDevice(device);
      setStatus("connected");
      onConnect?.();
      device.addEventListener("gattserverdisconnected", handleDisconnect);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "NotFoundError") {
        setStatus("idle");
      } else if (err instanceof Error && err.name === "SecurityError") {
        setError("Bluetooth permission denied");
        setStatus("idle");
      } else {
        setError(err instanceof Error ? err.message : "Bluetooth error");
        setStatus("idle");
      }
    }
  }, [isSupported, deviceName, handleDisconnect, onConnect]);

  const disconnect = useCallback(() => {
    if (connectedDevice?.gatt?.connected) {
      connectedDevice.gatt.disconnect();
    }
    setStatus("idle");
    setConnectedDevice(null);
  }, [connectedDevice]);

  useEffect(() => {
    return () => {
      if (connectedDevice) {
        connectedDevice.removeEventListener("gattserverdisconnected", handleDisconnect);
      }
    };
  }, [connectedDevice, handleDisconnect]);

  return { status, isSupported, connectedDevice, error, connect, disconnect };
}
