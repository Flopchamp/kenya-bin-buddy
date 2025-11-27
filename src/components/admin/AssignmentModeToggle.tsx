import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Settings2 } from "lucide-react";

const AssignmentModeToggle = () => {
  const [mode, setMode] = useState<"automatic" | "manual">("automatic");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchMode();
  }, []);

  const fetchMode = async () => {
    const { data, error } = await supabase
      .from("system_settings")
      .select("assignment_mode")
      .single();

    if (error) {
      console.error("Error fetching assignment mode:", error);
    } else {
      setMode(data.assignment_mode);
    }
    setLoading(false);
  };

  const toggleMode = async (checked: boolean) => {
    const newMode = checked ? "automatic" : "manual";
    setUpdating(true);

    const { data: userData } = await supabase.auth.getUser();

    const { error } = await supabase
      .from("system_settings")
      .update({
        assignment_mode: newMode,
        updated_by: userData.user?.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", (await supabase.from("system_settings").select("id").single()).data?.id);

    if (error) {
      console.error("Error updating assignment mode:", error);
      toast.error("Failed to update assignment mode");
    } else {
      setMode(newMode);
      toast.success(
        `Assignment mode changed to ${newMode === "automatic" ? "Automatic" : "Manual"}`
      );
    }

    setUpdating(false);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Settings2 className="h-5 w-5" />
          <CardTitle>Assignment Mode</CardTitle>
        </div>
        <CardDescription>
          Control how routes are assigned to drivers and trucks
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="assignment-mode" className="text-base font-semibold">
              {mode === "automatic" ? "Automatic Assignment" : "Manual Assignment"}
            </Label>
            <p className="text-sm text-muted-foreground">
              {mode === "automatic"
                ? "System automatically assigns routes based on workload and availability"
                : "Admins manually assign routes to drivers and trucks"}
            </p>
          </div>
          <Switch
            id="assignment-mode"
            checked={mode === "automatic"}
            onCheckedChange={toggleMode}
            disabled={updating}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default AssignmentModeToggle;
