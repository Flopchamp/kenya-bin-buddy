import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Bin {
  id: string;
  bin_code: string;
  location_name: string;
  fill_level: number;
  status: string;
  latitude: number;
  longitude: number;
}

export const BINS_QUERY_KEY = ["bins"] as const;

const fetchBins = async (): Promise<Bin[]> => {
  const { data, error } = await supabase
    .from("bins")
    .select("*")
    .order("bin_code");
  if (error) throw error;
  return (data as Bin[]) || [];
};

export const useBins = () =>
  useQuery({ queryKey: BINS_QUERY_KEY, queryFn: fetchBins });
