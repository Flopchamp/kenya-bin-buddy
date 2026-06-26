import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useDriverProfiles } from "./useDriverProfiles";

export interface RouteAssignment {
  id: string;
  truck_id: string;
  driver_id: string;
  route_name: string;
  bin_ids: string[];
  total_bins: number;
  estimated_distance_km: number;
  estimated_duration_minutes: number;
  status: string;
  assigned_at: string;
  assigned_by: string | null;
  assignment_type: "automatic" | "manual" | null;
  started_at: string | null;
  completed_at: string | null;
  notes: string | null;
  trucks?: {
    truck_number: string;
  };
  profiles?: {
    full_name: string;
  };
}

export const useRouteAssignments = () => {
  const [rawAssignments, setRawAssignments] = useState<RouteAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const driverProfiles = useDriverProfiles();

  const fetchAssignments = async () => {
    const { data, error } = await supabase
      .from("route_assignments")
      .select(`
        *,
        trucks(truck_number)
      `)
      .order("assigned_at", { ascending: false });

    if (error) {
      console.error("Error fetching route assignments:", error);
      toast.error("Failed to load route assignments");
      setLoading(false);
      return;
    }

    setRawAssignments((data as unknown as RouteAssignment[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchAssignments();

    const channel = supabase
      .channel("route_assignments_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "route_assignments" },
        () => { fetchAssignments(); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // Merge driver names from the shared React Query cache — no extra requests
  const assignments: RouteAssignment[] = rawAssignments.map((a) => ({
    ...a,
    profiles: {
      full_name: driverProfiles[a.driver_id] ?? "Unknown Driver",
    },
  }));

  return { assignments, loading, refetch: fetchAssignments };
};
