import { useEffect, useState } from "react";
import { MapPin, Trash2, TrendingUp, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import BinMap from "@/components/maps/BinMap";

interface Bin {
  id: string;
  bin_code: string;
  location_name: string;
  fill_level: number;
  status: string;
  latitude: number;
  longitude: number;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [bins, setBins] = useState<Bin[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    const fetchBins = async () => {
      const { data, error } = await supabase
        .from("bins")
        .select("*")
        .order("fill_level", { ascending: false });

      if (error) {
        console.error("Error fetching bins:", error);
      } else {
        setBins(data || []);
      }
      setIsLoadingData(false);
    };

    if (user) {
      fetchBins();

      // Set up realtime subscription
      const channel = supabase
        .channel("bins-changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "bins",
          },
          () => {
            fetchBins();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const totalBins = bins.length;
  const fullBins = bins.filter((b) => b.status === "full" || b.status === "overflow").length;

  const stats = [
    { label: "Total Bins", value: totalBins.toString(), icon: Trash2, color: "primary" },
    { label: "Full Bins", value: fullBins.toString(), icon: AlertCircle, color: "destructive" },
    { label: "Collections Today", value: "0", icon: TrendingUp, color: "success" },
    { label: "Active Trucks", value: "0", icon: MapPin, color: "secondary" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "full":
        return "bg-destructive";
      case "half":
        return "bg-warning";
      case "empty":
        return "bg-success";
      default:
        return "bg-muted";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "full":
        return "destructive";
      case "half":
        return "warning";
      case "empty":
        return "default";
      default:
        return "secondary";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Real-time waste management overview</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card key={index} className="shadow-[var(--shadow-card)] border-border/50 hover:shadow-[var(--shadow-eco)] transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map */}
          <Card className="lg:col-span-2 shadow-[var(--shadow-card)] border-border/50">
            <CardHeader>
              <CardTitle className="text-foreground">Bin Locations</CardTitle>
              <CardDescription>Real-time bin tracking across Nairobi</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[500px]">
                <BinMap bins={bins} />
              </div>
            </CardContent>
          </Card>

          {/* Bins List */}
          <Card className="shadow-[var(--shadow-card)] border-border/50">
            <CardHeader>
              <CardTitle className="text-foreground">Recent Updates</CardTitle>
              <CardDescription>Latest bin status changes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="max-h-[500px] overflow-y-auto space-y-3">
                {isLoadingData ? (
                  <p className="text-center text-muted-foreground py-8">Loading bins...</p>
                ) : bins.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No bins found</p>
                ) : (
                  bins.map((bin) => (
                    <div
                      key={bin.id}
                      className="flex items-start space-x-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(bin.status)} mt-1.5 flex-shrink-0`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium text-foreground truncate">
                            {bin.bin_code}
                          </p>
                          <Badge variant={getStatusBadge(bin.status) as any} className="ml-2 flex-shrink-0">
                            {bin.fill_level}%
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {bin.location_name}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics */}
        <Card className="shadow-[var(--shadow-card)] border-border/50">
          <CardHeader>
            <CardTitle className="text-foreground">Fill Level Trends</CardTitle>
            <CardDescription>Average bin fill levels over time</CardDescription>
          </CardHeader>
          <CardContent>
            {bins.length === 0 ? (
              <div className="h-[200px] flex items-center justify-center bg-muted/30 rounded-lg">
                <div className="text-center space-y-2">
                  <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground">No data available yet</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <p className="text-2xl font-bold text-foreground">
                    {Math.round(bins.reduce((sum, b) => sum + b.fill_level, 0) / bins.length)}%
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Average Fill</p>
                </div>
                <div className="text-center p-4 bg-success/10 rounded-lg">
                  <p className="text-2xl font-bold text-success">
                    {bins.filter((b) => b.status === "empty").length}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Empty Bins</p>
                </div>
                <div className="text-center p-4 bg-warning/10 rounded-lg">
                  <p className="text-2xl font-bold text-warning">
                    {bins.filter((b) => b.status === "half").length}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Half Full</p>
                </div>
                <div className="text-center p-4 bg-destructive/10 rounded-lg">
                  <p className="text-2xl font-bold text-destructive">
                    {fullBins}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Needs Collection</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
