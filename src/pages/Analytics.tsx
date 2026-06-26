import { useEffect, useState } from "react";
import { TrendingUp, Trash2, Truck, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

const Analytics = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalBins: 0,
    fullBins: 0,
    activeTrucks: 0,
    openReports: 0,
  });
  const [binStatusData, setBinStatusData] = useState<any[]>([]);
  const [fillLevelData, setFillLevelData] = useState<any[]>([]);

  const [collectionHistory, setCollectionHistory] = useState<any[]>([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      // Fetch bins data
      const { data: bins } = await supabase.from("bins").select("*");
      
      if (bins) {
        setStats((prev) => ({
          ...prev,
          totalBins: bins.length,
          fullBins: bins.filter((b) => b.status === "full" || b.status === "overflow").length,
        }));

        // Status distribution
        const statusCounts = bins.reduce((acc: any, bin) => {
          acc[bin.status] = (acc[bin.status] || 0) + 1;
          return acc;
        }, {});

        setBinStatusData([
          { name: "Empty", value: statusCounts.empty || 0, color: "#10b981" },
          { name: "Half", value: statusCounts.half || 0, color: "#f59e0b" },
          { name: "Full", value: statusCounts.full || 0, color: "#ef4444" },
          { name: "Overflow", value: statusCounts.overflow || 0, color: "#dc2626" },
        ]);

        // Fill level distribution
        const fillRanges: Record<string, number> = {};
        bins.forEach((bin) => {
          const range = Math.floor(bin.fill_level / 20) * 20;
          const label = `${range}-${range + 20}%`;
          fillRanges[label] = (fillRanges[label] || 0) + 1;
        });

        setFillLevelData(
          Object.entries(fillRanges).map(([range, count]) => ({
            range,
            count,
          }))
        );
      }

      // Fetch trucks data
      const { data: trucks } = await supabase.from("trucks").select("*").eq("is_active", true);
      setStats((prev) => ({ ...prev, activeTrucks: trucks?.length || 0 }));

      // Fetch reports data
      const { data: reports } = await supabase
        .from("citizen_reports")
        .select("*")
        .eq("status", "open");
      setStats((prev) => ({ ...prev, openReports: reports?.length || 0 }));

      // Fetch collection history for the last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: history } = await supabase
        .from("collection_history")
        .select("*")
        .gte("collected_at", sevenDaysAgo.toISOString())
        .order("collected_at");

      if (history) {
        // Group by date
        const dailyCollections: Record<string, number> = {};
        history.forEach((item) => {
          const date = new Date(item.collected_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });
          dailyCollections[date] = (dailyCollections[date] || 0) + 1;
        });

        setCollectionHistory(
          Object.entries(dailyCollections).map(([date, count]) => ({
            date,
            collections: count,
          }))
        );
      }
    };

    if (user) {
      fetchAnalytics();
    }
  }, [user]);

  const statCards = [
    { label: "Total Bins", value: stats.totalBins, icon: Trash2, color: "primary" },
    { label: "Full Bins", value: stats.fullBins, icon: AlertCircle, color: "destructive" },
    { label: "Active Trucks", value: stats.activeTrucks, icon: Truck, color: "secondary" },
    { label: "Open Reports", value: stats.openReports, icon: TrendingUp, color: "warning" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Waste collection insights and trends
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, index) => (
            <Card key={index} className="shadow-[var(--shadow-card)] border-border/50">
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

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-[var(--shadow-card)] border-border/50">
            <CardHeader>
              <CardTitle>Bin Status Distribution</CardTitle>
              <CardDescription>Current status of all bins</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={binStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry: any) =>
                      `${entry.name} ${(entry.percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {binStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="shadow-[var(--shadow-card)] border-border/50">
            <CardHeader>
              <CardTitle>Fill Level Distribution</CardTitle>
              <CardDescription>Number of bins by fill level range</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={fillLevelData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-[var(--shadow-card)] border-border/50">
          <CardHeader>
            <CardTitle>Collection Efficiency</CardTitle>
            <CardDescription>Collections completed in the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            {collectionHistory.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center bg-muted/30 rounded-lg">
                <div className="text-center space-y-2">
                  <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground">
                    No collection data available yet
                  </p>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={collectionHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="collections"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
