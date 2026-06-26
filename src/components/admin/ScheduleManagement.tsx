import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ScheduleDialog from "./ScheduleDialog";

interface Schedule {
  id: string;
  scheduled_date: string;
  scheduled_time: string;
  status: string;
  bins: {
    bin_code: string;
    location_name: string;
  };
  trucks: {
    truck_number: string;
  };
}

const ScheduleManagement = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchSchedules = async () => {
    const { data, error } = await supabase
      .from("collection_schedules")
      .select(`
        *,
        bins (
          bin_code,
          location_name
        ),
        trucks (
          truck_number
        )
      `)
      .order("scheduled_date", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Error fetching schedules:", error);
      toast.error("Failed to load schedules");
    } else {
      setSchedules((data as unknown as Schedule[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this schedule?")) return;

    const { error } = await supabase.from("collection_schedules").delete().eq("id", id);

    if (error) {
      toast.error("Failed to delete schedule");
      console.error(error);
    } else {
      toast.success("Schedule deleted successfully");
      fetchSchedules();
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return "default";
      case "in_progress":
        return "warning";
      case "cancelled":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Collection Schedules</CardTitle>
              <CardDescription>Manage collection schedules and routes</CardDescription>
            </div>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Schedule
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground py-8">Loading schedules...</p>
          ) : schedules.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <p>No schedules found</p>
              <p className="text-sm mt-2">Create your first schedule to get started</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Truck</TableHead>
                  <TableHead>Bin</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedules.map((schedule) => (
                  <TableRow key={schedule.id}>
                    <TableCell className="font-medium">
                      {schedule.trucks.truck_number}
                    </TableCell>
                    <TableCell>{schedule.bins.bin_code}</TableCell>
                    <TableCell>{schedule.bins.location_name}</TableCell>
                    <TableCell>
                      {new Date(schedule.scheduled_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{schedule.scheduled_time}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadge(schedule.status) as any}>
                        {schedule.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(schedule.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ScheduleDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={fetchSchedules}
      />
    </>
  );
};

export default ScheduleManagement;
