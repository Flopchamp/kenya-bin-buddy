import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

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
  const [workloads, setWorkloads] = useState<DriverWorkload[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWorkloads = async () => {
    const { data, error } = await supabase
      .from("driver_workload_today")
      .select("*");

    if (error) {
      console.error("Error fetching driver workloads:", error);
      setLoading(false);
      return;
    }

    // Fetch driver names
    const workloadsWithNames = await Promise.all(
      (data || []).map(async (workload) => {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", workload.driver_id)
          .single();

        return {
          ...workload,
          full_name: profile?.full_name || "Unknown Driver",
        };
      })
    );

    setWorkloads(workloadsWithNames);
    setLoading(false);
  };

  useEffect(() => {
    fetchWorkloads();

    // Subscribe to real-time updates
    const channel = supabase
      .channel("driver_activity_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "driver_activity",
        },
        () => {
          fetchWorkloads();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { workloads, loading, refetch: fetchWorkloads };
};
