"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import L, { LatLngExpression } from "leaflet";
import setupLeaflet from "@/components/utils/leaflet-setup";
import { Card } from "@/components/ui/card";
import "leaflet/dist/leaflet.css";

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
  latitude: number;
  longitude: number;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
  category?: string[];
  verified?: boolean;
}

const ResourceLocationsMap: React.FC = () => {
  const [resources, setResources] = useState<ResourceLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<LatLngExpression>([
    39.8283, -98.5795,
  ]); // Center of US
  const [mapZoom, setMapZoom] = useState(4);
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    // Setup Leaflet
    setupLeaflet();

    const fetchResourceLocations = async () => {
      try {
        setLoading(true);

        // Fetch all resources
        const response = await fetch("/api/v1/resources");

        if (!response.ok) {
          throw new Error(`Failed to fetch resources: ${response.statusText}`);
        }

        const data = await response.json();

        // Process resources to get location data
        const resourcesWithLocation: ResourceLocation[] = [];

        // Process each resource
        for (const resource of data) {
          // Skip resources without address
          if (!resource.address) continue;

          try {
            // Try to geocode the address
            const addressString =
              `${resource.address.street || ""}, ${resource.address.city || ""}, ${resource.address.state || ""} ${resource.address.zip || ""}`.trim();

            if (!addressString) continue;

            const geocodeResponse = await fetch(
              `/api/geocode?address=${encodeURIComponent(addressString)}`,
            );

            if (geocodeResponse.ok) {
              const locationData = await geocodeResponse.json();

              resourcesWithLocation.push({
                id: resource.id,
                name: resource.name,
                latitude: locationData.latitude,
                longitude: locationData.longitude,
                address: resource.address,
                category: resource.category,
                verified: resource.verified,
              });
            }
          } catch (err) {
            console.error(`Error geocoding resource ${resource.id}:`, err);
            // Continue with next resource
          }
        }

        setResources(resourcesWithLocation);

        // If we have resources, calculate the center of the map
        if (resourcesWithLocation.length > 0) {
          // Calculate average lat/lng as center
          const totalLat = resourcesWithLocation.reduce(
            (sum, r) => sum + r.latitude,
            0,
          );
          const totalLng = resourcesWithLocation.reduce(
            (sum, r) => sum + r.longitude,
            0,
          );

          setMapCenter([
            totalLat / resourcesWithLocation.length,
            totalLng / resourcesWithLocation.length,
          ]);

          // Adjust zoom based on number of resources
          if (resourcesWithLocation.length === 1) {
            setMapZoom(13); // Close zoom for single resource
          } else if (resourcesWithLocation.length < 5) {
            setMapZoom(7); // Medium zoom for few resources
          } else if (resourcesWithLocation.length < 20) {
            setMapZoom(5); // Wider zoom for more resources
          } else {
            setMapZoom(4); // Default zoom for many resources
          }
        }

        setIsMapReady(true);
        setError(null);
      } catch (err) {
        console.error("Error fetching resource locations:", err);
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchResourceLocations();
  }, []);

  // Group resources by category for the legend
  const getCategoryColors = () => {
    const categories = new Set<string>();
    resources.forEach((resource) => {
      if (resource.category && resource.category.length > 0) {
        resource.category.forEach((cat) => categories.add(cat));
      }
    });

    // Generate colors for each category
    const colors: Record<string, string> = {};
    const baseColors = [
      "#4285F4", // Google Blue
      "#EA4335", // Google Red
      "#FBBC05", // Google Yellow
      "#34A853", // Google Green
      "#8E24AA", // Purple
      "#00ACC1", // Cyan
      "#FB8C00", // Orange
      "#607D8B", // Blue Grey
    ];

    Array.from(categories).forEach((category, index) => {
      colors[category] = baseColors[index % baseColors.length];
    });

    return colors;
  };

  // Get marker color based on category
  const getMarkerColor = (resource: ResourceLocation) => {
    const categoryColors = getCategoryColors();

    if (resource.category && resource.category.length > 0) {
      return categoryColors[resource.category[0]];
    }

    return "#4285F4"; // Default blue
  };

  if (loading) {
    return (
      <Card className="p-6 bg-gray-800 border-0 shadow-md">
        <h2 className="text-xl font-bold text-white mb-4">
          Resource Locations
        </h2>
        <div className="h-64 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-300 mx-auto mb-2"></div>
            <p className="text-gray-400">Loading resource locations...</p>
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6 bg-gray-800 border-0 shadow-md">
        <h2 className="text-xl font-bold text-white mb-4">
          Resource Locations
        </h2>
        <div className="bg-red-900 bg-opacity-50 p-4 rounded-md text-white">
          <p>Error loading resource locations: {error}</p>
        </div>
      </Card>
    );
  }

  if (resources.length === 0) {
    return (
      <Card className="p-6 bg-gray-800 border-0 shadow-md">
        <h2 className="text-xl font-bold text-white mb-4">
          Resource Locations
        </h2>
        <div className="h-64 flex items-center justify-center">
          <p className="text-gray-400">
            No resource locations available. Resources need address information.
          </p>
        </div>
      </Card>
    );
  }

  const categoryColors = getCategoryColors();

  return (
    <Card className="p-6 bg-gray-800 border-0 shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">
          Resource Locations ({resources.length})
        </h2>
      </div>

      <div className="h-96 relative">
        {!isMapReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-300 mx-auto mb-2"></div>
              <p>Loading map...</p>
            </div>
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

          {resources.map((resource) => (
            <Marker
              key={resource.id}
              position={[resource.latitude, resource.longitude]}
              icon={
                new L.Icon({
                  iconUrl: resource.verified
                    ? "/images/marker-icon-verified.png"
                    : "/images/marker-icon.png",
                  iconSize: [25, 41],
                  iconAnchor: [12, 41],
                  popupAnchor: [1, -34],
                  shadowUrl: "/images/marker-shadow.png",
                  shadowSize: [41, 41],
                })
              }
            >
              <Popup>
                <div className="max-w-xs">
                  <h3 className="font-bold text-lg mb-1">{resource.name}</h3>
                  {resource.verified && (
                    <div className="mb-2 text-green-600 text-sm font-semibold">
                      Verified Resource
                    </div>
                  )}
                  {resource.address && (
                    <p className="text-sm mb-2">
                      {resource.address.street &&
                        `${resource.address.street}, `}
                      {resource.address.city && `${resource.address.city}, `}
                      {resource.address.state}
                      {resource.address.zip && ` ${resource.address.zip}`}
                    </p>
                  )}
                  {resource.category && resource.category.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs font-semibold mb-1">Categories:</p>
                      <div className="flex flex-wrap gap-1">
                        {resource.category.map((cat) => (
                          <span
                            key={cat}
                            className="px-2 py-1 text-xs rounded-full text-white"
                            style={{
                              backgroundColor: categoryColors[cat] || "#4285F4",
                            }}
                          >
                            {cat}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="mt-2">
                    <a
                      href={`/resources/${resource.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 text-sm hover:underline"
                    >
                      View Resource Details
                    </a>
                  </div>
                  <div className="mt-1">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${resource.latitude},${resource.longitude}`}
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

        {/* Legend */}
        {Object.keys(categoryColors).length > 0 && (
          <div className="absolute bottom-2 right-2 z-20 bg-black bg-opacity-70 p-2 rounded max-h-40 overflow-y-auto">
            <p className="text-white text-xs font-semibold mb-1">Categories:</p>
            <div className="space-y-1">
              {Object.entries(categoryColors).map(([category, color]) => (
                <div key={category} className="flex items-center text-xs">
                  <span
                    className="w-3 h-3 inline-block mr-1 rounded-full"
                    style={{ backgroundColor: color }}
                  ></span>
                  <span className="text-white truncate max-w-[120px]">
                    {category}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ResourceLocationsMap;
