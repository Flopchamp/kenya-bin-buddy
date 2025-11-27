import { useEffect, useState } from "react";
import { Plus, Trash2, Edit } from "lucide-react";
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
import TruckDialog from "./TruckDialog";

interface Truck {
  id: string;
  truck_number: string;
  driver_id: string | null;
  capacity: number;
  is_active: boolean;
  profiles?: {
    full_name: string;
  };
}

const TrucksManagement = () => {
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTruck, setSelectedTruck] = useState<Truck | null>(null);

  const fetchTrucks = async () => {
    const { data, error } = await supabase
      .from("trucks")
      .select("*")
      .order("truck_number");

    if (error) {
      console.error("Error fetching trucks:", error);
      toast.error("Failed to load trucks");
      setLoading(false);
      return;
    }

    // Fetch driver names separately
    const trucksWithDrivers = await Promise.all(
      (data || []).map(async (truck) => {
        if (truck.driver_id) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", truck.driver_id)
            .single();
          
          return {
            ...truck,
            profiles: profile || undefined,
          };
        }
        return truck;
      })
    );

    setTrucks(trucksWithDrivers);
    setLoading(false);
  };

  useEffect(() => {
    fetchTrucks();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this truck?")) return;

    const { error } = await supabase.from("trucks").delete().eq("id", id);

    if (error) {
      toast.error("Failed to delete truck");
      console.error(error);
    } else {
      toast.success("Truck deleted successfully");
      fetchTrucks();
    }
  };

  const handleEdit = (truck: Truck) => {
    setSelectedTruck(truck);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedTruck(null);
    setDialogOpen(true);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Trucks Management</CardTitle>
              <CardDescription>Manage collection vehicles</CardDescription>
            </div>
            <Button onClick={handleAdd}>
              <Plus className="mr-2 h-4 w-4" />
              Add Truck
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground py-8">Loading trucks...</p>
          ) : trucks.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <p>No trucks found</p>
              <p className="text-sm mt-2">Add your first truck to get started</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Truck Number</TableHead>
                  <TableHead>Assigned Driver</TableHead>
                  <TableHead>Capacity (kg)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trucks.map((truck) => (
                  <TableRow key={truck.id}>
                    <TableCell className="font-medium">{truck.truck_number}</TableCell>
                    <TableCell>
                      {truck.profiles?.full_name || (
                        <span className="text-muted-foreground italic">No driver assigned</span>
                      )}
                    </TableCell>
                    <TableCell>{truck.capacity}</TableCell>
                    <TableCell>
                      <Badge variant={truck.is_active ? "default" : "secondary"}>
                        {truck.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(truck)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(truck.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <TruckDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        truck={selectedTruck}
        onSuccess={fetchTrucks}
      />
    </>
  );
};

export default TrucksManagement;
