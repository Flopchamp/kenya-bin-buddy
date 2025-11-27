import { useEffect, useRef } from "react";
import { MapPin } from "lucide-react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface Bin {
  id: string;
  bin_code: string;
  location_name: string;
  fill_level: number;
  status: string;
  latitude: number;
  longitude: number;
}

interface BinMapProps {
  bins: Bin[];
  center?: [number, number];
  zoom?: number;
}

const BinMap = ({ bins, center = [-1.286389, 36.817223], zoom = 12 }: BinMapProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize map
    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current).setView(center, zoom);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapRef.current);
    }

    // Clear existing markers
    mapRef.current.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        mapRef.current?.removeLayer(layer);
      }
    });

    // Add markers for bins
    bins.forEach((bin) => {
      if (!bin.latitude || !bin.longitude || !mapRef.current) return;

      const getMarkerColor = (status: string) => {
        switch (status) {
          case "full":
          case "overflow":
            return "red";
          case "half":
            return "orange";
          default:
            return "green";
        }
      };

      const color = getMarkerColor(bin.status);
      const icon = L.divIcon({
        className: "custom-marker",
        html: `
          <div style="
            background-color: ${color};
            width: 24px;
            height: 24px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          "></div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker([bin.latitude, bin.longitude], { icon })
        .bindPopup(
          `
          <div style="min-width: 200px;">
            <h3 style="font-weight: bold; margin-bottom: 8px;">${bin.bin_code}</h3>
            <p style="margin: 4px 0;"><strong>Location:</strong> ${bin.location_name}</p>
            <p style="margin: 4px 0;"><strong>Fill Level:</strong> ${bin.fill_level}%</p>
            <p style="margin: 4px 0;"><strong>Status:</strong> <span style="color: ${color}; font-weight: bold;">${bin.status}</span></p>
          </div>
        `
        )
        .addTo(mapRef.current);
    });

    // Fit bounds to show all markers
    if (bins.length > 0) {
      const bounds = L.latLngBounds(
        bins
          .filter((b) => b.latitude && b.longitude)
          .map((b) => [b.latitude, b.longitude] as [number, number])
      );
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [bins, center, zoom]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainerRef} className="w-full h-full rounded-lg" />
      {bins.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/30 rounded-lg">
          <div className="text-center space-y-2">
            <MapPin className="h-12 w-12 mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">No bins to display</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BinMap;
