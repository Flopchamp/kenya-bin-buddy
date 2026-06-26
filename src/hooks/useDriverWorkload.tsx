import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useDriverProfiles } from "./useDriverProfiles";

export interface DriverWorkload {
  driver_id: string;
  shift_date: string;
  routes_today: number;
  hours_worked_today: number;
  distance_covered_today: number;
  bins_collected_today: number;
  avg_fatigue_score: number;
  current_status: string;
  full_name?: string;
}

export const useDriverWorkload = () => {
  const [rawWorkloads, setRawWorkloads] = useState<
    Array<{
      driver_id: string | null;
      shift_date: string | null;
      routes_today: number | null;
      hours_worked_today: number | null;
      distance_covered_today: number | null;
      bins_collected_today: number | null;
      avg_fatigue_score: number | null;
      current_status: string | null;
    }>
  >([]);
  const [loading, setLoading] = useState(true);
  const driverProfiles = useDriverProfiles();

  const fetchWorkloads = async () => {
    const { data, error } = await supabase
      .from("driver_workload_today")
      .select("*");

    if (error) {
      console.error("Error fetching driver workloads:", error);
      setLoading(false);
      return;
    }

    setRawWorkloads(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchWorkloads();

    const channel = supabase
      .channel("driver_activity_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "driver_activity" },
        () => { fetchWorkloads(); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const workloads: DriverWorkload[] = rawWorkloads.map((w) => ({
    driver_id: w.driver_id ?? "",
    shift_date: w.shift_date ?? "",
    routes_today: w.routes_today ?? 0,
    hours_worked_today: w.hours_worked_today ?? 0,
    distance_covered_today: w.distance_covered_today ?? 0,
    bins_collected_today: w.bins_collected_today ?? 0,
    avg_fatigue_score: w.avg_fatigue_score ?? 0,
    current_status: w.current_status ?? "offline",
    full_name: w.driver_id
      ? (driverProfiles[w.driver_id] ?? "Unknown Driver")
      : "Unknown Driver",
  }));

  return { workloads, loading, refetch: fetchWorkloads };
};
