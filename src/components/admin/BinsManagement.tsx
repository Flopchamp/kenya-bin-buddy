import { useState } from "react";
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
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import BinDialog from "./BinDialog";
import FillLevelSimulator from "./FillLevelSimulator";
import { useBins, BINS_QUERY_KEY, type Bin } from "@/hooks/useBins";

const BinsManagement = () => {
  const { data: bins = [], isLoading } = useBins();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedBin, setSelectedBin] = useState<Bin | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this bin?")) return;

    // Optimistic update: remove immediately, restore on error
    const prev = queryClient.getQueryData<Bin[]>(BINS_QUERY_KEY) ?? [];
    queryClient.setQueryData<Bin[]>(BINS_QUERY_KEY, (old) =>
      (old ?? []).filter((b) => b.id !== id)
    );

    const { error } = await supabase.from("bins").delete().eq("id", id);

    if (error) {
      toast.error("Failed to delete bin");
      queryClient.setQueryData<Bin[]>(BINS_QUERY_KEY, prev);
    } else {
      toast.success("Bin deleted successfully");
    }
  };

  const handleMutationSuccess = () => {
    queryClient.invalidateQueries({ queryKey: BINS_QUERY_KEY });
  };

  const handleEdit = (bin: Bin) => {
    setSelectedBin(bin);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedBin(null);
    setDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "full":
      case "overflow":
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
    <>
      <FillLevelSimulator />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Bins Management</CardTitle>
              <CardDescription>Add, edit, or remove waste bins</CardDescription>
            </div>
            <Button onClick={handleAdd}>
              <Plus className="mr-2 h-4 w-4" />
              Add Bin
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center text-muted-foreground py-8">Loading bins...</p>
          ) : bins.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No bins found</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bin Code</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Fill Level</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Coordinates</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bins.map((bin) => (
                  <TableRow key={bin.id}>
                    <TableCell className="font-medium">{bin.bin_code}</TableCell>
                    <TableCell>{bin.location_name}</TableCell>
                    <TableCell>{bin.fill_level}%</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadge(bin.status) as any}>
                        {bin.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {bin.latitude.toFixed(4)}, {bin.longitude.toFixed(4)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(bin)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(bin.id)}
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

      <BinDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        bin={selectedBin}
        onSuccess={handleMutationSuccess}
      />
    </>
  );
};

export default BinsManagement;
