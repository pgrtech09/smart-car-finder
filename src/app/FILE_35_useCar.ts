"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase";
import type { Car } from "@/types";

export function useCar(userId: string | undefined) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchCars = useCallback(async (): Promise<Car[]> => {
    if (!userId) return [];
    const { data } = await supabase
      .from("cars")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    return (data as Car[]) || [];
  }, [userId, supabase]);

  const saveCar = useCallback(
    async (car: Omit<Car, "id" | "user_id" | "created_at" | "updated_at">): Promise<Car | null> => {
      if (!userId) return null;
      setLoading(true);
      setError(null);
      try {
        const { data, error: dbError } = await supabase
          .from("cars")
          .insert({ ...car, user_id: userId })
          .select()
          .single();
        if (dbError) throw dbError;
        return data as Car;
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to save car");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [userId, supabase]
  );

  const updateCar = useCallback(
    async (id: string, updates: Partial<Car>): Promise<Car | null> => {
      setLoading(true);
      try {
        const { data, error: dbError } = await supabase
          .from("cars")
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq("id", id)
          .select()
          .single();
        if (dbError) throw dbError;
        return data as Car;
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to update car");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [supabase]
  );

  const deleteCar = useCallback(
    async (id: string) => {
      await supabase.from("cars").delete().eq("id", id);
    },
    [supabase]
  );

  return { fetchCars, saveCar, updateCar, deleteCar, loading, error };
}
