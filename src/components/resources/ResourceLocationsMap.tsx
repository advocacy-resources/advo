"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { LatLngExpression } from "leaflet";
import setupLeaflet from "@/components/utils/leaflet-setup";
import "leaflet/dist/leaflet.css";
import { Resource } from "@/interfaces/resource";
import Link from "next/link";

// Dynamically import Leaflet components with no SSR
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false },
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false },
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false },
);
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});

interface ResourceLocation {
  id: string;
  name: string;
  category: string[];
  address: string;
  latitude: number;
  longitude: number;
  resource: Resource;
}

interface ResourceLocationsMapProps {
  resources?: Resource[];
  loading?: boolean;
  height?: string;
}

const ResourceLocationsMap: React.FC<ResourceLocationsMapProps> = ({
  resources = [],
  loading = false,
  height = "600px",
}) => {
  const [mapCenter, setMapCenter] = useState<LatLngExpression>([
    39.8283, -98.5795,
  ]); // Center of US
  const [mapZoom, setMapZoom] = useState(4);
  const [isMapReady, setIsMapReady] = useState(false);
  const [resourceLocations, setResourceLocations] = useState<
    ResourceLocation[]
  >([]);
  const [geocodeLoading, setGeocodeLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Geocode resource addresses
  useEffect(() => {
    const geocodeResources = async () => {
      if (!resources || resources.length === 0 || loading) {
        setResourceLocations([]);
        return;
      }

      setGeocodeLoading(true);
      setError(null);

      try {
        // Prepare addresses for geocoding
        const addressesToGeocode = resources.map((resource) => {
          const { address } = resource;
          return {
            id: resource.id || "",
            address: `${address.street}, ${address.city}, ${address.state} ${address.zip || ""}`,
            resource,
          };
        });

        // Call the geocode API to get coordinates for each address
        const response = await fetch("/api/v1/geocode-addresses", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            addresses: addressesToGeocode.map((a) => a.address),
          }),
        });

        if (!response.ok) {
          throw new Error(`Geocoding failed: ${response.statusText}`);
        }

        const geocodeData = await response.json();

        // Map the geocoded data to resource locations
        const locations: ResourceLocation[] = [];

        Object.entries(geocodeData.results).forEach(
          ([address, coords], index) => {
            const { latitude, longitude } = coords as {
              latitude: number;
              longitude: number;
            };

            const resourceData = addressesToGeocode.find(
              (r) => r.address === address,
            );

            if (resourceData) {
              locations.push({
                id: resourceData.id,
                name: resourceData.resource.name,
                category: resourceData.resource.category,
                address: address,
                latitude,
                longitude,
                resource: resourceData.resource,
              });
            }
          },
        );

        setResourceLocations(locations);

        // If we have locations, calculate the center of the map
        if (locations.length > 0) {
          // Find the average latitude and longitude
          const avgLat =
            locations.reduce((sum, loc) => sum + loc.latitude, 0) /
            locations.length;
          const avgLng =
            locations.reduce((sum, loc) => sum + loc.longitude, 0) /
            locations.length;

          setMapCenter([avgLat, avgLng]);
          setMapZoom(locations.length === 1 ? 13 : 10); // Zoom in more if there's only one location
        }
      } catch (error) {
        console.error("Error geocoding addresses:", error);
        setError((error as Error).message);

        // Fallback: Create approximate locations based on state
        const fallbackLocations = resources.map((resource) => {
          const coords = getApproximateStateCoordinates(resource.address.state);
          return {
            id: resource.id || "",
            name: resource.name,
            category: resource.category,
            address: `${resource.address.city}, ${resource.address.state}`,
            latitude: coords[0],
            longitude: coords[1],
            resource,
          };
        });

        setResourceLocations(fallbackLocations);
      } finally {
        setGeocodeLoading(false);
      }
    };

    geocodeResources();
  }, [resources, loading]);

  // Setup Leaflet when component mounts
  useEffect(() => {
    setupLeaflet();
    setIsMapReady(true);
  }, []);

  // Helper function to get approximate coordinates for states (fallback)
  const getApproximateStateCoordinates = (state: string): [number, number] => {
    const stateCoordinates: Record<string, [number, number]> = {
      AL: [32.806671, -86.79113],
      AK: [61.370716, -152.404419],
      AZ: [33.729759, -111.431221],
      AR: [34.969704, -92.373123],
      CA: [36.116203, -119.681564],
      CO: [39.059811, -105.311104],
      CT: [41.597782, -72.755371],
      DE: [39.318523, -75.507141],
      FL: [27.766279, -81.686783],
      GA: [33.040619, -83.643074],
      HI: [21.094318, -157.498337],
      ID: [44.240459, -114.478828],
      IL: [40.349457, -88.986137],
      IN: [39.849426, -86.258278],
      IA: [42.011539, -93.210526],
      KS: [38.5266, -96.726486],
      KY: [37.66814, -84.670067],
      LA: [31.169546, -91.867805],
      ME: [44.693947, -69.381927],
      MD: [39.063946, -76.802101],
      MA: [42.230171, -71.530106],
      MI: [43.326618, -84.536095],
      MN: [45.694454, -93.900192],
      MS: [32.741646, -89.678696],
      MO: [38.456085, -92.288368],
      MT: [46.921925, -110.454353],
      NE: [41.12537, -98.268082],
      NV: [38.313515, -117.055374],
      NH: [43.452492, -71.563896],
      NJ: [40.298904, -74.521011],
      NM: [34.840515, -106.248482],
      NY: [42.165726, -74.948051],
      NC: [35.630066, -79.806419],
      ND: [47.528912, -99.784012],
      OH: [40.388783, -82.764915],
      OK: [35.565342, -96.928917],
      OR: [44.572021, -122.070938],
      PA: [40.590752, -77.209755],
      RI: [41.680893, -71.51178],
      SC: [33.856892, -80.945007],
      SD: [44.299782, -99.438828],
      TN: [35.747845, -86.692345],
      TX: [31.054487, -97.563461],
      UT: [40.150032, -111.862434],
      VT: [44.045876, -72.710686],
      VA: [37.769337, -78.169968],
      WA: [47.400902, -121.490494],
      WV: [38.491226, -80.954453],
      WI: [44.268543, -89.616508],
      WY: [42.755966, -107.30249],
      DC: [38.897438, -77.026817],
    };

    return stateCoordinates[state] || [39.8283, -98.5795]; // Default to center of US
  };

  // Format categories for display
  const formatCategories = (categories: string[]) => {
    return categories.join(", ");
  };

  if (loading || geocodeLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-300 mx-auto mb-2"></div>
          <p>Loading map data...</p>
        </div>
      </div>
    );
  }

  if (resourceLocations.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center">
        <p className="text-gray-400">
          No resources with location data available.
        </p>
      </div>
    );
  }

  return (
    <div className="relative" style={{ height }}>
      {!isMapReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-300 mx-auto mb-2"></div>
            <p>Loading map...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute top-2 left-2 right-2 z-30 bg-red-900 bg-opacity-75 p-2 rounded text-white text-sm">
          <p className="font-semibold">Warning: {error}</p>
          <p>Using approximate locations as fallback.</p>
        </div>
      )}

      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
        className="h-full w-full absolute inset-0 z-10 rounded-md overflow-hidden"
        whenReady={() => {
          // Force Leaflet to recalculate map size
          window.dispatchEvent(new Event("resize"));
        }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {resourceLocations.map((location) => (
          <Marker
            key={location.id}
            position={[location.latitude, location.longitude]}
          >
            <Popup>
              <div className="max-w-xs">
                <h3 className="font-bold text-lg mb-1">{location.name}</h3>
                <p className="text-sm mb-2">
                  <span className="font-semibold">Categories:</span>{" "}
                  {formatCategories(location.category)}
                </p>
                <p className="text-sm mb-2">
                  <span className="font-semibold">Address:</span>{" "}
                  {location.address}
                </p>
                {location.resource.contact && (
                  <div className="text-sm mb-2">
                    <p className="font-semibold">Contact:</p>
                    {location.resource.contact.phone && (
                      <p>Phone: {location.resource.contact.phone}</p>
                    )}
                    {location.resource.contact.email && (
                      <p>Email: {location.resource.contact.email}</p>
                    )}
                    {location.resource.contact.website && (
                      <p>
                        <a
                          href={location.resource.contact.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          Website
                        </a>
                      </p>
                    )}
                  </div>
                )}
                <div className="mt-2">
                  <Link
                    href={`/resources/${location.id}`}
                    className="text-blue-500 hover:underline"
                  >
                    View Details
                  </Link>
                </div>
                <div className="mt-1">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 text-sm hover:underline"
                  >
                    View in Google Maps
                  </a>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default ResourceLocationsMap;
