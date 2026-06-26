import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const fetchDriverProfiles = async (): Promise<Record<string, string>> => {
  const { data: driverRoles } = await supabase
    .from("user_roles")
    .select("user_id")
    .eq("role", "driver");

  if (!driverRoles?.length) return {};

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name")
    .in("id", driverRoles.map((r) => r.user_id));

  return Object.fromEntries(
    (profiles || []).map((p) => [p.id, p.full_name ?? "Unknown Driver"])
  );
};

// Returns a map of driverId → fullName.
// React Query deduplicates this across all consumers — one request per cache window.
export const useDriverProfiles = (): Record<string, string> => {
  const { data = {} } = useQuery({
    queryKey: ["driver-profiles"],
    queryFn: fetchDriverProfiles,
    staleTime: 5 * 60 * 1000,
  });
  return data;
};
