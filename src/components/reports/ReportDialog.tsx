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
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { z } from "zod";

const reportSchema = z.object({
  report_type: z.string().min(1, { message: "Please select an issue type" }).max(100, { message: "Issue type must be less than 100 characters" }),
  description: z.string().trim().min(10, { message: "Description must be at least 10 characters" }).max(1000, { message: "Description must be less than 1000 characters" }),
  bin_id: z.string().uuid().optional().or(z.literal("")),
});

interface ReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface Bin {
  id: string;
  bin_code: string;
  location_name: string;
}

const ReportDialog = ({ open, onOpenChange, onSuccess }: ReportDialogProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [bins, setBins] = useState<Bin[]>([]);
  const [formData, setFormData] = useState({
    report_type: "",
    description: "",
    bin_id: "",
  });

  useEffect(() => {
    const fetchBins = async () => {
      const { data } = await supabase
        .from("bins")
        .select("id, bin_code, location_name")
        .order("bin_code");
      setBins((data as Bin[]) || []);
    };

    if (open) {
      fetchBins();
      setFormData({
        report_type: "",
        description: "",
        bin_id: "",
      });
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    // Validate input
    const validation = reportSchema.safeParse({
      report_type: formData.report_type,
      description: formData.description,
      bin_id: formData.bin_id,
    });

    if (!validation.success) {
      const errors = validation.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(", ");
      toast.error(errors);
      setLoading(false);
      return;
    }

    const data = {
      citizen_id: user.id,
      report_type: validation.data.report_type,
      description: validation.data.description,
      bin_id: validation.data.bin_id || null,
      status: "open",
    };

    const { error } = await supabase.from("citizen_reports").insert([data]);

    if (error) {
      toast.error("Failed to submit report");
      console.error(error);
    } else {
      toast.success("Report submitted successfully");
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
            <DialogTitle>Submit New Report</DialogTitle>
            <DialogDescription>
              Report a waste management issue in your area
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="report_type">Issue Type</Label>
              <Select
                value={formData.report_type}
                onValueChange={(value) =>
                  setFormData({ ...formData, report_type: value })
                }
                required
              >
                <SelectTrigger id="report_type">
                  <SelectValue placeholder="Select issue type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Overflowing Bin">Overflowing Bin</SelectItem>
                  <SelectItem value="Missed Collection">Missed Collection</SelectItem>
                  <SelectItem value="Damaged Bin">Damaged Bin</SelectItem>
                  <SelectItem value="Illegal Dumping">Illegal Dumping</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="bin_id">Related Bin (Optional)</Label>
              <Select
                value={formData.bin_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, bin_id: value })
                }
              >
                <SelectTrigger id="bin_id">
                  <SelectValue placeholder="Select a bin (optional)" />
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
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Please describe the issue in detail..."
                rows={4}
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
              Submit Report
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReportDialog;
