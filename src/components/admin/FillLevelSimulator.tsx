import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Activity, Loader2 } from "lucide-react";

const FillLevelSimulator = () => {
  const [simulating, setSimulating] = useState(false);

  const simulateFillLevels = async () => {
    setSimulating(true);

    try {
      // Fetch all bins
      const { data: bins, error } = await supabase.from("bins").select("*");

      if (error) throw error;

      // Update each bin with a random fill level increase
      const updates = bins?.map(async (bin) => {
        // Increase fill level by 5-15%
        const increase = Math.floor(Math.random() * 11) + 5;
        let newFillLevel = Math.min((bin.fill_level ?? 0) + increase, 100);

        // Determine new status based on fill level
        let newStatus: "empty" | "half" | "full" | "overflow" = "empty";
        if (newFillLevel >= 90) {
          newStatus = "overflow";
        } else if (newFillLevel >= 80) {
          newStatus = "full";
        } else if (newFillLevel >= 40) {
          newStatus = "half";
        }

        return supabase
          .from("bins")
          .update({
            fill_level: newFillLevel,
            status: newStatus,
          })
          .eq("id", bin.id);
      });

      await Promise.all(updates || []);

      toast.success("Bin fill levels updated successfully");
    } catch (error) {
      console.error("Error simulating fill levels:", error);
      toast.error("Failed to update fill levels");
    } finally {
      setSimulating(false);
    }
  };

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Fill Level Simulator
        </CardTitle>
        <CardDescription>
          Simulate bin fill level changes for testing (increases fill levels by 5-15%)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          onClick={simulateFillLevels}
          disabled={simulating}
          className="w-full"
          variant="outline"
        >
          {simulating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {simulating ? "Simulating..." : "Run Simulation"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default FillLevelSimulator;
