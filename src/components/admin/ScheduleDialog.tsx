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

const scheduleSchema = z.object({
  truck_id: z.string().uuid({ message: "Please select a valid truck" }),
  bin_id: z.string().uuid({ message: "Please select a valid bin" }),
  scheduled_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Invalid date format" }),
  scheduled_time: z.string().regex(/^\d{2}:\d{2}$/, { message: "Invalid time format" }),
});

interface ScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface Bin {
  id: string;
  bin_code: string;
  location_name: string;
}

interface Truck {
  id: string;
  truck_number: string;
}

const ScheduleDialog = ({ open, onOpenChange, onSuccess }: ScheduleDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [bins, setBins] = useState<Bin[]>([]);
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [formData, setFormData] = useState({
    truck_id: "",
    bin_id: "",
    scheduled_date: "",
    scheduled_time: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      const [binsRes, trucksRes] = await Promise.all([
        supabase.from("bins").select("id, bin_code, location_name").order("bin_code"),
        supabase.from("trucks").select("id, truck_number").eq("is_active", true).order("truck_number"),
      ]);

      setBins((binsRes.data as Bin[]) || []);
      setTrucks((trucksRes.data as Truck[]) || []);
    };

    if (open) {
      fetchData();
      setFormData({
        truck_id: "",
        bin_id: "",
        scheduled_date: "",
        scheduled_time: "",
      });
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validate input
    const validation = scheduleSchema.safeParse({
      truck_id: formData.truck_id,
      bin_id: formData.bin_id,
      scheduled_date: formData.scheduled_date,
      scheduled_time: formData.scheduled_time,
    });

    if (!validation.success) {
      const errors = validation.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(", ");
      toast.error(errors);
      setLoading(false);
      return;
    }

    const data = {
      ...validation.data,
      status: "pending" as const,
    };

    const { error } = await supabase.from("collection_schedules").insert([data as any]);

    if (error) {
      toast.error("Failed to create schedule");
      console.error(error);
    } else {
      toast.success("Schedule created successfully");
      onSuccess();
      onOpenChange(false);
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Collection Schedule</DialogTitle>
            <DialogDescription>
              Schedule a bin collection for a specific truck
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="truck_id">Truck</Label>
              <Select
                value={formData.truck_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, truck_id: value })
                }
                required
              >
                <SelectTrigger id="truck_id">
                  <SelectValue placeholder="Select a truck" />
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

            <div className="grid gap-2">
              <Label htmlFor="bin_id">Bin</Label>
              <Select
                value={formData.bin_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, bin_id: value })
                }
                required
              >
                <SelectTrigger id="bin_id">
                  <SelectValue placeholder="Select a bin" />
                </SelectTrigger>
                <SelectContent>
                  {bins.map((bin) => (
                    <SelectItem key={bin.id} value={bin.id}>
                      {bin.bin_code} - {bin.location_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="scheduled_date">Date</Label>
              <Input
                id="scheduled_date"
                type="date"
                value={formData.scheduled_date}
                onChange={(e) =>
                  setFormData({ ...formData, scheduled_date: e.target.value })
                }
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="scheduled_time">Time</Label>
              <Input
                id="scheduled_time"
                type="time"
                value={formData.scheduled_time}
                onChange={(e) =>
                  setFormData({ ...formData, scheduled_time: e.target.value })
                }
                required
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
              Create Schedule
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleDialog;
