import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  assignment_type: string;
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
  const [assignments, setAssignments] = useState<RouteAssignment[]>([]);
  const [loading, setLoading] = useState(true);

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

    // Fetch driver names separately
    const assignmentsWithDrivers = await Promise.all(
      (data || []).map(async (assignment) => {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", assignment.driver_id)
          .single();

        return {
          ...assignment,
          profiles: profile ? { full_name: profile.full_name } : undefined,
        };
      })
    );

    setAssignments(assignmentsWithDrivers);
    setLoading(false);
  };

  useEffect(() => {
    fetchAssignments();

    // Subscribe to real-time updates
    const channel = supabase
      .channel("route_assignments_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "route_assignments",
        },
        () => {
          fetchAssignments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { assignments, loading, refetch: fetchAssignments };
};
