import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, CheckCircle2, Clock, XCircle } from "lucide-react";

interface Report {
  id: string;
  report_type: string;
  description: string;
  status: string;
  created_at: string;
  citizen_id: string;
  bin_id: string | null;
  latitude: number | null;
  longitude: number | null;
  profiles: {
    full_name: string;
    phone: string | null;
  };
  bins?: {
    bin_code: string;
    location_name: string;
  };
}

const ReportsManagement = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    const { data: reportsData, error } = await supabase
      .from("citizen_reports")
      .select(`
        *,
        bins (
          bin_code,
          location_name
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching reports:", error);
      toast.error("Failed to load reports");
      setLoading(false);
      return;
    }

    // Fetch profiles separately
    const citizenIds = reportsData?.map((r) => r.citizen_id) || [];
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("id, full_name, phone")
      .in("id", citizenIds);

    // Merge the data
    const enrichedReports = reportsData?.map((report) => ({
      ...report,
      profiles: profilesData?.find((p) => p.id === report.citizen_id) || {
        full_name: "Unknown",
        phone: null,
      },
    }));

    setReports((enrichedReports as unknown as Report[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchReports();

    // Set up realtime subscription
    const channel = supabase
      .channel("admin-reports")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "citizen_reports",
        },
        () => {
          fetchReports();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const updateStatus = async (reportId: string, newStatus: string) => {
    const { error } = await supabase
      .from("citizen_reports")
      .update({
        status: newStatus,
        resolved_at: newStatus === "resolved" ? new Date().toISOString() : null,
      })
      .eq("id", reportId);

    if (error) {
      toast.error("Failed to update status");
      console.error(error);
    } else {
      toast.success("Status updated successfully");
      fetchReports();
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "resolved":
        return "default";
      case "in_progress":
        return "warning";
      default:
        return "destructive";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "resolved":
        return <CheckCircle2 className="h-4 w-4" />;
      case "in_progress":
        return <Clock className="h-4 w-4" />;
      default:
        return <XCircle className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Citizen Reports Management</CardTitle>
        <CardDescription>
          View and manage citizen-submitted waste reports
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : reports.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No reports found</p>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Citizen</TableHead>
                  <TableHead>Location/Bin</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(report.status)}
                        <Badge variant={getStatusBadge(report.status) as any}>
                          {report.status.replace("_", " ")}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{report.report_type}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{report.profiles.full_name}</div>
                        {report.profiles.phone && (
                          <div className="text-muted-foreground">{report.profiles.phone}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {report.bins ? (
                        <div className="text-sm">
                          <div className="font-medium">{report.bins.bin_code}</div>
                          <div className="text-muted-foreground">{report.bins.location_name}</div>
                        </div>
                      ) : report.latitude && report.longitude ? (
                        <div className="text-sm text-muted-foreground">
                          {report.latitude.toFixed(6)}, {report.longitude.toFixed(6)}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{report.description}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(report.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={report.status}
                        onValueChange={(value) => updateStatus(report.id, value)}
                      >
                        <SelectTrigger className="w-[130px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReportsManagement;
