import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface LocationTrackerProps {
  truckId?: string;
}

const LocationTracker = ({ truckId }: LocationTrackerProps) => {
  const { user } = useAuth();
  const [tracking, setTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);

  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  const startTracking = async () => {
    if (!truckId) {
      // Find truck assigned to this driver
      const { data: trucks } = await supabase
        .from("trucks")
        .select("id")
        .eq("driver_id", user?.id)
        .single();

      if (!trucks) {
        toast.error("No truck assigned to you");
        return;
      }
    }

    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    const id = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ lat: latitude, lng: longitude });

        // Update truck location in database
        const { data: trucks } = await supabase
          .from("trucks")
          .select("id")
          .eq("driver_id", user?.id)
          .single();

        if (trucks) {
          await supabase
            .from("trucks")
            .update({
              current_latitude: latitude,
              current_longitude: longitude,
            })
            .eq("id", trucks.id);
        }
      },
      (error) => {
        console.error("Error getting location:", error);
        toast.error("Failed to get your location");
        setTracking(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );

    setWatchId(id);
    setTracking(true);
    toast.success("Location tracking started");
  };

  const stopTracking = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    setTracking(false);
    toast.success("Location tracking stopped");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Navigation className="h-5 w-5" />
          GPS Tracking
        </CardTitle>
        <CardDescription>
          Share your real-time location while on duty
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant={tracking ? "default" : "secondary"}>
              {tracking ? "Active" : "Inactive"}
            </Badge>
            {tracking && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span>Tracking</span>
              </div>
            )}
          </div>
          <Button
            onClick={tracking ? stopTracking : startTracking}
            variant={tracking ? "destructive" : "default"}
            size="sm"
          >
            {tracking ? (
              <>
                <MapPin className="mr-2 h-4 w-4" />
                Stop Tracking
              </>
            ) : (
              <>
                <Navigation className="mr-2 h-4 w-4" />
                Start Tracking
              </>
            )}
          </Button>
        </div>

        {currentLocation && (
          <div className="p-3 bg-muted/50 rounded-lg space-y-1">
            <p className="text-sm font-medium">Current Location</p>
            <p className="text-xs text-muted-foreground">
              Lat: {currentLocation.lat.toFixed(6)}, Lng: {currentLocation.lng.toFixed(6)}
            </p>
          </div>
        )}

        {tracking && (
          <p className="text-xs text-muted-foreground">
            Your location is being updated every few seconds and shared with the admin dashboard.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default LocationTracker;
