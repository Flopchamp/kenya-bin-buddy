import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import ReportDialog from "@/components/reports/ReportDialog";
import { toast } from "sonner";

interface Report {
  id: string;
  report_type: string;
  description: string;
  status: string;
  created_at: string;
  bin_id: string | null;
  bins?: {
    bin_code: string;
    location_name: string;
  };
}

const Reports = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  const fetchReports = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("citizen_reports")
      .select(`
        *,
        bins (
          bin_code,
          location_name
        )
      `)
      .eq("citizen_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching reports:", error);
      toast.error("Failed to load reports");
    } else {
      setReports(data || []);
    }
    setIsLoadingData(false);
  };

  useEffect(() => {
    if (user) {
      fetchReports();

      // Set up realtime subscription
      const channel = supabase
        .channel("reports-changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "citizen_reports",
            filter: `citizen_id=eq.${user.id}`,
          },
          () => {
            fetchReports();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  if (loading || !user) {
    return null;
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "resolved":
        return <CheckCircle2 className="h-4 w-4 text-success" />;
      case "in_progress":
        return <Clock className="h-4 w-4 text-warning" />;
      default:
        return <AlertCircle className="h-4 w-4 text-destructive" />;
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground">My Reports</h1>
            <p className="text-muted-foreground mt-1">
              Report waste issues and track their status
            </p>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Report
          </Button>
        </div>

        <div className="grid gap-4">
          {isLoadingData ? (
            <Card>
              <CardContent className="py-12">
                <p className="text-center text-muted-foreground">Loading reports...</p>
              </CardContent>
            </Card>
          ) : reports.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center space-y-4">
                  <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">No reports yet</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Create your first report to get started
                    </p>
                  </div>
                  <Button onClick={() => setDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            reports.map((report) => (
              <Card key={report.id} className="hover:shadow-[var(--shadow-card)] transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2">
                        {getStatusIcon(report.status)}
                        {report.report_type}
                      </CardTitle>
                      <CardDescription>
                        {report.bins ? (
                          <>
                            {report.bins.bin_code} - {report.bins.location_name}
                          </>
                        ) : (
                          "General report"
                        )}
                      </CardDescription>
                    </div>
                    <Badge variant={getStatusBadge(report.status) as any}>
                      {report.status.replace("_", " ")}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">
                    {report.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Reported on {new Date(report.created_at).toLocaleDateString()} at{" "}
                    {new Date(report.created_at).toLocaleTimeString()}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <ReportDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={fetchReports}
      />
    </div>
  );
};

export default Reports;
