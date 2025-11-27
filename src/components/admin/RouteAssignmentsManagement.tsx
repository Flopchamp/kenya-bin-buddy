import { useState } from "react";
import { Plus, Eye, CheckCircle, XCircle } from "lucide-react";
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
import { useRouteAssignments } from "@/hooks/useRouteAssignments";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RouteAssignmentDialog from "./RouteAssignmentDialog";
import { format } from "date-fns";

const RouteAssignmentsManagement = () => {
  const { assignments, loading, refetch } = useRouteAssignments();
  const [dialogOpen, setDialogOpen] = useState(false);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "outline",
      assigned: "default",
      in_progress: "secondary",
      completed: "default",
      cancelled: "destructive",
    };
    return variants[status] || "default";
  };

  const automaticAssignments = assignments.filter((a) => a.assignment_type === "automatic");
  const manualAssignments = assignments.filter((a) => a.assignment_type === "manual");

  const AssignmentTable = ({ data }: { data: typeof assignments }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Route Name</TableHead>
          <TableHead>Truck</TableHead>
          <TableHead>Driver</TableHead>
          <TableHead>Bins</TableHead>
          <TableHead>Distance</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Assigned</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length === 0 ? (
          <TableRow>
            <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
              No route assignments found
            </TableCell>
          </TableRow>
        ) : (
          data.map((assignment) => (
            <TableRow key={assignment.id}>
              <TableCell className="font-medium">{assignment.route_name}</TableCell>
              <TableCell>{assignment.trucks?.truck_number}</TableCell>
              <TableCell>{assignment.profiles?.full_name}</TableCell>
              <TableCell>{assignment.total_bins} bins</TableCell>
              <TableCell>
                {assignment.estimated_distance_km
                  ? `${assignment.estimated_distance_km} km`
                  : "-"}
              </TableCell>
              <TableCell>
                <Badge variant={getStatusBadge(assignment.status)}>
                  {assignment.status}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {format(new Date(assignment.assigned_at), "MMM dd, HH:mm")}
              </TableCell>
              <TableCell className="text-right">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Route Assignments</CardTitle>
              <CardDescription>
                View and manage automatic and manual route assignments
              </CardDescription>
            </div>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Assignment
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground py-8">Loading assignments...</p>
          ) : (
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">
                  All ({assignments.length})
                </TabsTrigger>
                <TabsTrigger value="automatic">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Automatic ({automaticAssignments.length})
                </TabsTrigger>
                <TabsTrigger value="manual">
                  <XCircle className="h-4 w-4 mr-2" />
                  Manual ({manualAssignments.length})
                </TabsTrigger>
              </TabsList>
              <TabsContent value="all">
                <AssignmentTable data={assignments} />
              </TabsContent>
              <TabsContent value="automatic">
                <AssignmentTable data={automaticAssignments} />
              </TabsContent>
              <TabsContent value="manual">
                <AssignmentTable data={manualAssignments} />
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>

      <RouteAssignmentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={refetch}
      />
    </>
  );
};

export default RouteAssignmentsManagement;
