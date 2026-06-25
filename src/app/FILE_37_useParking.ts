"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase";
import { getCurrentPosition, reverseGeocode } from "@/lib/utils";
import type { ParkingLocation } from "@/types";

export function useParking(userId: string | undefined) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const saveParking = useCallback(
    async (carId: string): Promise<ParkingLocation | null> => {
      if (!userId) return null;
      setLoading(true);
      setError(null);
      try {
        const position = await getCurrentPosition();
        const { latitude, longitude } = position.coords;
        const address = await reverseGeocode(latitude, longitude);

        const { data, error: dbError } = await supabase
          .from("parking_locations")
          .insert({
            user_id: userId,
            car_id: carId,
            latitude,
            longitude,
            address,
            parked_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (dbError) throw dbError;
        return data;
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to save parking");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [userId, supabase]
  );

  const fetchHistory = useCallback(
    async (limit = 50): Promise<ParkingLocation[]> => {
      if (!userId) return [];
      const { data, error: dbError } = await supabase
        .from("parking_locations")
        .select("*, car:cars(*)")
        .eq("user_id", userId)
        .order("parked_at", { ascending: false })
        .limit(limit);

      if (dbError) return [];
      return (data as ParkingLocation[]) || [];
    },
    [userId, supabase]
  );

  const fetchLatest = useCallback(
    async (carId?: string): Promise<ParkingLocation | null> => {
      if (!userId) return null;
      let query = supabase
        .from("parking_locations")
        .select("*, car:cars(*)")
        .eq("user_id", userId)
        .order("parked_at", { ascending: false })
        .limit(1);

      if (carId) query = query.eq("car_id", carId);

      const { data } = await query.single();
      return (data as ParkingLocation) || null;
    },
    [userId, supabase]
  );

  const markRetrieved = useCallback(
    async (parkingId: string) => {
      await supabase
        .from("parking_locations")
        .update({ retrieved_at: new Date().toISOString() })
        .eq("id", parkingId);
    },
    [supabase]
  );

  const deleteParking = useCallback(
    async (parkingId: string) => {
      await supabase
        .from("parking_locations")
        .delete()
        .eq("id", parkingId);
    },
    [supabase]
  );

  return { saveParking, fetchHistory, fetchLatest, markRetrieved, deleteParking, loading, error };
}
