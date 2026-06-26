import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Truck {
  id: string;
  truck_number: string;
  driver_id: string | null;
  is_active: boolean;
}

interface Bin {
  id: string;
  bin_code: string;
  location_name: string;
  fill_level: number;
}

interface RouteAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const RouteAssignmentDialog = ({ open, onOpenChange, onSuccess }: RouteAssignmentDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [bins, setBins] = useState<Bin[]>([]);
  const [canAcceptRoute, setCanAcceptRoute] = useState<boolean>(true);
  const [formData, setFormData] = useState({
    truck_id: "",
    route_name: "",
    bin_ids: [] as string[],
    estimated_distance_km: "",
    estimated_duration_minutes: "",
    notes: "",
  });

  useEffect(() => {
    if (open) {
      fetchTrucks();
      fetchBins();
    }
  }, [open]);

  const fetchTrucks = async () => {
    const { data } = await supabase
      .from("trucks")
      .select("*")
      .eq("is_active", true)
      .not("driver_id", "is", null);

    setTrucks((data as Truck[]) || []);
  };

  const fetchBins = async () => {
    const { data } = await supabase
      .from("bins")
      .select("id, bin_code, location_name, fill_level")
      .gte("fill_level", 60)
      .order("fill_level", { ascending: false });

    setBins((data as Bin[]) || []);
  };

  const checkDriverAvailability = async (truckId: string) => {
    const truck = trucks.find((t) => t.id === truckId);
    if (!truck?.driver_id) {
      setCanAcceptRoute(false);
      return;
    }

    const { data, error } = await supabase.rpc("can_driver_accept_route", {
      driver_uuid: truck.driver_id,
    });

    if (error) {
      console.error("Error checking driver availability:", error);
      setCanAcceptRoute(true); // Assume true on error
    } else {
      setCanAcceptRoute(data ?? true);
    }
  };

  const handleTruckChange = (truckId: string) => {
    setFormData({ ...formData, truck_id: truckId });
    checkDriverAvailability(truckId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const truck = trucks.find((t) => t.id === formData.truck_id);
    if (!truck?.driver_id) {
      toast.error("Selected truck has no assigned driver");
      setLoading(false);
      return;
    }

    if (formData.bin_ids.length === 0) {
      toast.error("Please select at least one bin");
      setLoading(false);
      return;
    }

    const { data: userData } = await supabase.auth.getUser();

    const { error } = await supabase.from("route_assignments").insert([
      {
        truck_id: formData.truck_id,
        driver_id: truck.driver_id,
        route_name: formData.route_name,
        bin_ids: formData.bin_ids,
        total_bins: formData.bin_ids.length,
        estimated_distance_km: parseFloat(formData.estimated_distance_km) || null,
        estimated_duration_minutes: parseInt(formData.estimated_duration_minutes) || null,
        assignment_type: "manual",
        assigned_by: userData.user?.id,
        notes: formData.notes || null,
      },
    ]);

    if (error) {
      toast.error("Failed to create route assignment");
      console.error(error);
    } else {
      toast.success("Route assigned successfully");
      onSuccess();
      onOpenChange(false);
      setFormData({
        truck_id: "",
        route_name: "",
        bin_ids: [],
        estimated_distance_km: "",
        estimated_duration_minutes: "",
        notes: "",
      });
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Manual Route Assignment</DialogTitle>
            <DialogDescription>
              Assign a collection route to a truck and driver
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="route_name">Route Name</Label>
              <Input
                id="route_name"
                value={formData.route_name}
                onChange={(e) => setFormData({ ...formData, route_name: e.target.value })}
                placeholder="Downtown Collection Route 1"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="truck_id">Select Truck</Label>
              <Select value={formData.truck_id} onValueChange={handleTruckChange} required>
                <SelectTrigger id="truck_id">
                  <SelectValue placeholder="Choose a truck" />
                </SelectTrigger>
                <SelectContent>
                  {trucks.map((truck) => (
                    <SelectItem key={truck.id} value={truck.id}>
                      {truck.truck_number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.truck_id && !canAcceptRoute && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Warning: The driver assigned to this truck has reached their workload limits.
                  They may not be able to accept this route.
                </AlertDescription>
              </Alert>
            )}

            <div className="grid gap-2">
              <Label>Select Bins ({formData.bin_ids.length} selected)</Label>
              <div className="border rounded-md p-2 max-h-40 overflow-y-auto space-y-2">
                {bins.map((bin) => (
                  <div key={bin.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={bin.id}
                      checked={formData.bin_ids.includes(bin.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            bin_ids: [...formData.bin_ids, bin.id],
                          });
                        } else {
                          setFormData({
                            ...formData,
                            bin_ids: formData.bin_ids.filter((id) => id !== bin.id),
                          });
                        }
                      }}
                      className="cursor-pointer"
                    />
                    <label htmlFor={bin.id} className="text-sm cursor-pointer flex-1">
                      {bin.bin_code} - {bin.location_name} ({bin.fill_level}% full)
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="estimated_distance_km">Distance (km)</Label>
                <Input
                  id="estimated_distance_km"
                  type="number"
                  step="0.1"
                  value={formData.estimated_distance_km}
                  onChange={(e) =>
                    setFormData({ ...formData, estimated_distance_km: e.target.value })
                  }
                  placeholder="12.5"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="estimated_duration_minutes">Duration (min)</Label>
                <Input
                  id="estimated_duration_minutes"
                  type="number"
                  value={formData.estimated_duration_minutes}
                  onChange={(e) =>
                    setFormData({ ...formData, estimated_duration_minutes: e.target.value })
                  }
                  placeholder="90"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any special instructions..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Assign Route
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RouteAssignmentDialog;
