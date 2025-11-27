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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { z } from "zod";

const truckSchema = z.object({
  truck_number: z.string().trim().min(1, { message: "Truck number is required" }).max(50, { message: "Truck number must be less than 50 characters" }),
  capacity: z.number({ invalid_type_error: "Capacity must be a number" }).min(1, { message: "Capacity must be at least 1 kg" }).max(100000, { message: "Capacity must be less than 100,000 kg" }),
  is_active: z.boolean(),
  driver_id: z.string().nullable(),
});

interface Truck {
  id: string;
  truck_number: string;
  capacity: number;
  is_active: boolean;
  driver_id: string | null;
}

interface Driver {
  id: string;
  full_name: string;
}

interface TruckDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  truck: Truck | null;
  onSuccess: () => void;
}

const TruckDialog = ({ open, onOpenChange, truck, onSuccess }: TruckDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [formData, setFormData] = useState({
    truck_number: "",
    capacity: "",
    is_active: true,
    driver_id: "",
  });

  useEffect(() => {
    const fetchDrivers = async () => {
      // Fetch users with driver role
      const { data: driverRoles } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "driver");

      if (driverRoles && driverRoles.length > 0) {
        const driverIds = driverRoles.map((r) => r.user_id);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", driverIds);

        setDrivers(profiles || []);
      }
    };

    if (open) {
      fetchDrivers();
    }

    if (truck) {
      setFormData({
        truck_number: truck.truck_number,
        capacity: truck.capacity.toString(),
        is_active: truck.is_active,
        driver_id: truck.driver_id || "",
      });
    } else {
      setFormData({
        truck_number: "",
        capacity: "",
        is_active: true,
        driver_id: "",
      });
    }
  }, [truck, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validate input
    const validation = truckSchema.safeParse({
      truck_number: formData.truck_number,
      capacity: parseInt(formData.capacity),
      is_active: formData.is_active,
      driver_id: formData.driver_id || null,
    });

    if (!validation.success) {
      const errors = validation.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(", ");
      toast.error(errors);
      setLoading(false);
      return;
    }

    if (truck) {
      const { error } = await supabase
        .from("trucks")
        .update(validation.data as any)
        .eq("id", truck.id);

      if (error) {
        toast.error("Failed to update truck");
        console.error(error);
      } else {
        toast.success("Truck updated successfully");
        onSuccess();
        onOpenChange(false);
      }
    } else {
      const { error } = await supabase.from("trucks").insert([validation.data as any]);

      if (error) {
        toast.error("Failed to create truck");
        console.error(error);
      } else {
        toast.success("Truck created successfully");
        onSuccess();
        onOpenChange(false);
      }
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{truck ? "Edit Truck" : "Add New Truck"}</DialogTitle>
            <DialogDescription>
              {truck
                ? "Update the truck information below"
                : "Enter the details for the new truck"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="truck_number">Truck Number</Label>
              <Input
                id="truck_number"
                value={formData.truck_number}
                onChange={(e) =>
                  setFormData({ ...formData, truck_number: e.target.value })
                }
                placeholder="TRK-001"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="capacity">Capacity (kg)</Label>
              <Input
                id="capacity"
                type="number"
                min="0"
                value={formData.capacity}
                onChange={(e) =>
                  setFormData({ ...formData, capacity: e.target.value })
                }
                placeholder="5000"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="driver_id">Assign Driver (Optional)</Label>
              <Select
                value={formData.driver_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, driver_id: value })
                }
              >
                <SelectTrigger id="driver_id">
                  <SelectValue placeholder="Select a driver" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No Driver</SelectItem>
                  {drivers.map((driver) => (
                    <SelectItem key={driver.id} value={driver.id}>
                      {driver.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="is_active">Active Status</Label>
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_active: checked })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {truck ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TruckDialog;
