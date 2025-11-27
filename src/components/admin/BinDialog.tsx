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

const binSchema = z.object({
  bin_code: z.string().trim().min(1, { message: "Bin code is required" }).max(50, { message: "Bin code must be less than 50 characters" }),
  location_name: z.string().trim().min(1, { message: "Location name is required" }).max(200, { message: "Location name must be less than 200 characters" }),
  latitude: z.number({ invalid_type_error: "Latitude must be a number" }).min(-90).max(90),
  longitude: z.number({ invalid_type_error: "Longitude must be a number" }).min(-180).max(180),
  fill_level: z.number({ invalid_type_error: "Fill level must be a number" }).min(0).max(100),
  status: z.enum(["empty", "half", "full", "overflow"]),
});

interface Bin {
  id: string;
  bin_code: string;
  location_name: string;
  fill_level: number;
  status: string;
  latitude: number;
  longitude: number;
}

interface BinDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bin: Bin | null;
  onSuccess: () => void;
}

const BinDialog = ({ open, onOpenChange, bin, onSuccess }: BinDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    bin_code: "",
    location_name: "",
    fill_level: "0",
    status: "empty",
    latitude: "",
    longitude: "",
  });

  useEffect(() => {
    if (bin) {
      setFormData({
        bin_code: bin.bin_code,
        location_name: bin.location_name,
        fill_level: bin.fill_level.toString(),
        status: bin.status,
        latitude: bin.latitude.toString(),
        longitude: bin.longitude.toString(),
      });
    } else {
      setFormData({
        bin_code: "",
        location_name: "",
        fill_level: "0",
        status: "empty",
        latitude: "",
        longitude: "",
      });
    }
  }, [bin, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validate input
    const validation = binSchema.safeParse({
      bin_code: formData.bin_code,
      location_name: formData.location_name,
      fill_level: parseInt(formData.fill_level),
      status: formData.status,
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
    });

    if (!validation.success) {
      const errors = validation.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(", ");
      toast.error(errors);
      setLoading(false);
      return;
    }

    if (bin) {
      const { error } = await supabase
        .from("bins")
        .update(validation.data as any)
        .eq("id", bin.id);

      if (error) {
        toast.error("Failed to update bin");
        console.error(error);
      } else {
        toast.success("Bin updated successfully");
        onSuccess();
        onOpenChange(false);
      }
    } else {
      const { error } = await supabase.from("bins").insert([validation.data as any]);

      if (error) {
        toast.error("Failed to create bin");
        console.error(error);
      } else {
        toast.success("Bin created successfully");
        onSuccess();
        onOpenChange(false);
      }
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{bin ? "Edit Bin" : "Add New Bin"}</DialogTitle>
            <DialogDescription>
              {bin
                ? "Update the bin information below"
                : "Enter the details for the new bin"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="bin_code">Bin Code</Label>
              <Input
                id="bin_code"
                value={formData.bin_code}
                onChange={(e) =>
                  setFormData({ ...formData, bin_code: e.target.value })
                }
                placeholder="BIN-001"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="location_name">Location Name</Label>
              <Input
                id="location_name"
                value={formData.location_name}
                onChange={(e) =>
                  setFormData({ ...formData, location_name: e.target.value })
                }
                placeholder="Westlands Market"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={(e) =>
                    setFormData({ ...formData, latitude: e.target.value })
                  }
                  placeholder="-1.2674"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={(e) =>
                    setFormData({ ...formData, longitude: e.target.value })
                  }
                  placeholder="36.8073"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="fill_level">Fill Level (%)</Label>
                <Input
                  id="fill_level"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.fill_level}
                  onChange={(e) =>
                    setFormData({ ...formData, fill_level: e.target.value })
                  }
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="empty">Empty</SelectItem>
                    <SelectItem value="half">Half Full</SelectItem>
                    <SelectItem value="full">Full</SelectItem>
                    <SelectItem value="overflow">Overflow</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
              {bin ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BinDialog;
