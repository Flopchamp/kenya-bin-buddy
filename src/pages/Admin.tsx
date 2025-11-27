import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Header from "@/components/Header";
import BinsManagement from "@/components/admin/BinsManagement";
import ScheduleManagement from "@/components/admin/ScheduleManagement";
import UsersManagement from "@/components/admin/UsersManagement";
import FillLevelSimulator from "@/components/admin/FillLevelSimulator";
import ReportsManagement from "@/components/admin/ReportsManagement";
import TrucksManagement from "@/components/admin/TrucksManagement";
import AssignmentModeToggle from "@/components/admin/AssignmentModeToggle";
import DriverWorkloadPanel from "@/components/admin/DriverWorkloadPanel";
import RouteAssignmentsManagement from "@/components/admin/RouteAssignmentsManagement";

const Admin = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    } else if (!roleLoading && !isAdmin) {
      navigate("/dashboard");
    }
  }, [user, isAdmin, authLoading, roleLoading, navigate]);

  if (authLoading || roleLoading || !user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Admin Panel</h1>
            <p className="text-muted-foreground mt-1">
              Manage bins, trucks, routes, and monitor driver workloads
            </p>
          </div>
        </div>

        <Tabs defaultValue="bins" className="w-full">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="bins">Bins</TabsTrigger>
            <TabsTrigger value="trucks">Trucks</TabsTrigger>
            <TabsTrigger value="routes">Routes</TabsTrigger>
            <TabsTrigger value="workload">Workload</TabsTrigger>
            <TabsTrigger value="schedules">Schedules</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="simulator">Simulator</TabsTrigger>
          </TabsList>

          <TabsContent value="bins">
            <BinsManagement />
          </TabsContent>

          <TabsContent value="trucks">
            <TrucksManagement />
          </TabsContent>

          <TabsContent value="routes">
            <div className="space-y-4">
              <AssignmentModeToggle />
              <RouteAssignmentsManagement />
            </div>
          </TabsContent>

          <TabsContent value="workload">
            <DriverWorkloadPanel />
          </TabsContent>

          <TabsContent value="schedules">
            <ScheduleManagement />
          </TabsContent>

          <TabsContent value="users">
            <UsersManagement />
          </TabsContent>

          <TabsContent value="reports">
            <ReportsManagement />
          </TabsContent>

          <TabsContent value="simulator">
            <FillLevelSimulator />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
