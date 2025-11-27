import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDriverWorkload } from "@/hooks/useDriverWorkload";
import { Loader2, User, TrendingUp, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const DriverWorkloadPanel = () => {
  const { workloads, loading } = useDriverWorkload();

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      available: "default",
      busy: "secondary",
      overworked: "destructive",
      offline: "outline",
    };
    return variants[status] || "default";
  };

  const getFatigueColor = (score: number) => {
    if (score >= 70) return "text-destructive";
    if (score >= 50) return "text-yellow-600";
    return "text-green-600";
  };

  const getFatigueProgress = (score: number) => {
    if (score >= 70) return 100;
    if (score >= 50) return 60;
    return 30;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          <CardTitle>Driver Workload Monitor</CardTitle>
        </div>
        <CardDescription>
          Real-time tracking of driver availability and fatigue levels
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : workloads.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No active drivers today</p>
            <p className="text-sm mt-2">Driver activity will appear here once shifts begin</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Driver</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Routes</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead>Distance</TableHead>
                <TableHead>Bins</TableHead>
                <TableHead>Fatigue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workloads.map((workload) => (
                <TableRow key={workload.driver_id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      {workload.full_name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadge(workload.current_status)}>
                      {workload.current_status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {workload.routes_today}/2
                      {workload.routes_today >= 2 && (
                        <AlertCircle className="h-4 w-4 text-destructive" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {Number(workload.hours_worked_today).toFixed(1)}/8h
                      {workload.hours_worked_today >= 8 && (
                        <AlertCircle className="h-4 w-4 text-destructive" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {Number(workload.distance_covered_today).toFixed(1)}/35km
                      {workload.distance_covered_today >= 35 && (
                        <AlertCircle className="h-4 w-4 text-destructive" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {workload.bins_collected_today}/25
                      {workload.bins_collected_today >= 25 && (
                        <AlertCircle className="h-4 w-4 text-destructive" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${getFatigueColor(workload.avg_fatigue_score)}`}>
                          {Number(workload.avg_fatigue_score).toFixed(0)}%
                        </span>
                      </div>
                      <Progress
                        value={getFatigueProgress(workload.avg_fatigue_score)}
                        className="h-2"
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default DriverWorkloadPanel;
