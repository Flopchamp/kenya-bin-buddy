import { useEffect, useState } from "react";
import { MapPin, CheckCircle2, Clock, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import LocationTracker from "@/components/driver/LocationTracker";
import { toast } from "sonner";

interface Schedule {
  id: string;
  scheduled_date: string;
  scheduled_time: string;
  status: string;
  bins: {
    bin_code: string;
    location_name: string;
    fill_level: number;
    status: string;
  };
}

const Driver = () => {
  const { user } = useAuth();
  const { isDriver, isAdmin } = useUserRole();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const fetchSchedules = async () => {
    if (!user) return;

    // Get truck assigned to this driver
    const { data: trucks } = await supabase
      .from("trucks")
      .select("id")
      .eq("driver_id", user.id)
      .single();

    if (!trucks) {
      setIsLoadingData(false);
      return;
    }

    const { data, error } = await supabase
      .from("collection_schedules")
      .select(`
        *,
        bins (
          bin_code,
          location_name,
          fill_level,
          status
        )
      `)
      .eq("truck_id", trucks.id)
      .gte("scheduled_date", new Date().toISOString().split("T")[0])
      .order("scheduled_date")
      .order("scheduled_time");

    if (error) {
      console.error("Error fetching schedules:", error);
      toast.error("Failed to load schedules");
    } else {
      setSchedules(data || []);
    }
    setIsLoadingData(false);
  };

  useEffect(() => {
    if (user && (isDriver || isAdmin)) {
      fetchSchedules();
    }
  }, [user, isDriver, isAdmin]);

  const markAsCompleted = async (scheduleId: string) => {
    const { error } = await supabase
      .from("collection_schedules")
      .update({
        status: "completed",
        collected_at: new Date().toISOString(),
      })
      .eq("id", scheduleId);

    if (error) {
      toast.error("Failed to update status");
      console.error(error);
    } else {
      toast.success("Collection marked as completed");
      fetchSchedules();
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return "default";
      case "in_progress":
        return "warning";
      default:
        return "secondary";
    }
  };

  const getBinStatusColor = (status: string) => {
    switch (status) {
      case "full":
      case "overflow":
        return "text-destructive";
      case "half":
        return "text-warning";
      default:
        return "text-success";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Driver Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Your collection schedule and routes
            </p>
          </div>
          <div className="flex items-center gap-2 text-primary">
            <Truck className="h-5 w-5" />
            <span className="font-medium">On Duty</span>
          </div>
        </div>

        <LocationTracker />

        <div className="grid gap-4">
          {isLoadingData ? (
            <Card>
              <CardContent className="py-12">
                <p className="text-center text-muted-foreground">Loading schedule...</p>
              </CardContent>
            </Card>
          ) : schedules.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center space-y-4">
                  <Clock className="h-12 w-12 mx-auto text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">No upcoming collections</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Check back later for new assignments
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            schedules.map((schedule) => (
              <Card
                key={schedule.id}
                className="hover:shadow-[var(--shadow-card)] transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-primary" />
                        {schedule.bins.bin_code}
                      </CardTitle>
                      <CardDescription>{schedule.bins.location_name}</CardDescription>
                    </div>
                    <Badge variant={getStatusBadge(schedule.status) as any}>
                      {schedule.status.replace("_", " ")}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Scheduled:</span>
                      <span className="font-medium">
                        {new Date(schedule.scheduled_date).toLocaleDateString()} at{" "}
                        {schedule.scheduled_time}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Fill Level:</span>
                      <span className={`font-medium ${getBinStatusColor(schedule.bins.status)}`}>
                        {schedule.bins.fill_level}% ({schedule.bins.status})
                      </span>
                    </div>
                    {schedule.status === "pending" && (
                      <Button
                        onClick={() => markAsCompleted(schedule.id)}
                        className="w-full mt-4"
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Mark as Completed
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Driver;
