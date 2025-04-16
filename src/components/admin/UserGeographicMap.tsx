"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { LatLngExpression } from "leaflet";
import setupLeaflet from "@/components/utils/leaflet-setup";
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
const CircleMarker = dynamic(
  () => import("react-leaflet").then((mod) => mod.CircleMarker),
  { ssr: false },
);

interface UserLocation {
  zipcode: string;
  state: string;
  latitude: number;
  longitude: number;
  count: number;
  demographics?: {
    ageGroups?: Record<string, number>;
    genders?: Record<string, number>;
    raceEthnicity?: Record<string, number>;
    sexualOrientation?: Record<string, number>;
    resourceInterests?: Record<string, number>;
  };
}

interface UserGeographicMapProps {
  userLocations: UserLocation[];
  loading: boolean;
}

const UserGeographicMap: React.FC<UserGeographicMapProps> = ({
  userLocations,
  loading,
}) => {
  const [mapCenter, setMapCenter] = useState<LatLngExpression>([
    39.8283, -98.5795,
  ]); // Center of US
  const [mapZoom, setMapZoom] = useState(4);
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    // Setup Leaflet
    setupLeaflet();

    // If we have user locations, calculate the center of the map
    if (userLocations.length > 0) {
      // Find the location with the most users to center the map
      const maxLocation = userLocations.reduce((prev, current) =>
        prev.count > current.count ? prev : current,
      );

      setMapCenter([maxLocation.latitude, maxLocation.longitude]);
      setMapZoom(5); // Zoom in a bit more when we have data
    }

    setIsMapReady(true);
  }, [userLocations]);

  // Calculate marker size based on user count
  const getMarkerRadius = (count: number) => {
    const maxCount = Math.max(...userLocations.map((loc) => loc.count));
    const minRadius = 8;
    const maxRadius = 25;

    if (maxCount === count) return maxRadius;
    return minRadius + (count / maxCount) * (maxRadius - minRadius);
  };

  // Get marker color based on count
  const getMarkerColor = (count: number) => {
    const maxCount = Math.max(...userLocations.map((loc) => loc.count));
    const intensity = count / maxCount;

    // Generate a color from blue (low) to red (high)
    const r = Math.round(255 * intensity);
    const g = Math.round(100 * (1 - intensity));
    const b = Math.round(200 * (1 - intensity));

    return `rgb(${r}, ${g}, ${b})`;
  };

  // Format demographic data for display
  const formatDemographics = (location: UserLocation) => {
    if (!location.demographics) return "No demographic data available";

    const result = [];

    if (
      location.demographics.ageGroups &&
      Object.keys(location.demographics.ageGroups).length > 0
    ) {
      result.push(
        <div key="age" className="mb-2">
          <h4 className="font-semibold">Age Groups:</h4>
          <ul className="pl-2">
            {Object.entries(location.demographics.ageGroups)
              .sort(([, a], [, b]) => (b as number) - (a as number))
              .map(([group, count]) => (
                <li key={group}>
                  {group}: {count} (
                  {Math.round(((count as number) / location.count) * 100)}%)
                </li>
              ))}
          </ul>
        </div>,
      );
    }

    if (
      location.demographics.genders &&
      Object.keys(location.demographics.genders).length > 0
    ) {
      result.push(
        <div key="gender" className="mb-2">
          <h4 className="font-semibold">Genders:</h4>
          <ul className="pl-2">
            {Object.entries(location.demographics.genders)
              .sort(([, a], [, b]) => (b as number) - (a as number))
              .map(([gender, count]) => (
                <li key={gender}>
                  {gender}: {count} (
                  {Math.round(((count as number) / location.count) * 100)}%)
                </li>
              ))}
          </ul>
        </div>,
      );
    }

    if (
      location.demographics.raceEthnicity &&
      Object.keys(location.demographics.raceEthnicity).length > 0
    ) {
      result.push(
        <div key="race" className="mb-2">
          <h4 className="font-semibold">Race/Ethnicity:</h4>
          <ul className="pl-2">
            {Object.entries(location.demographics.raceEthnicity)
              .sort(([, a], [, b]) => (b as number) - (a as number))
              .map(([race, count]) => (
                <li key={race}>
                  {race}: {count} (
                  {Math.round(((count as number) / location.count) * 100)}%)
                </li>
              ))}
          </ul>
        </div>,
      );
    }

    return result.length > 0 ? result : "No demographic data available";
  };

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-300 mx-auto mb-2"></div>
          <p>Loading map data...</p>
        </div>
      </div>
    );
  }

  if (userLocations.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center">
        <p className="text-gray-400">
          No geographic data available. Users need to provide zipcode
          information.
        </p>
      </div>
    );
  }

  return (
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

        {userLocations.map((location) => (
          <CircleMarker
            key={`${location.zipcode}-${location.state}`}
            center={[location.latitude, location.longitude]}
            radius={getMarkerRadius(location.count)}
            pathOptions={{
              fillColor: getMarkerColor(location.count),
              color: "white",
              weight: 1,
              opacity: 1,
              fillOpacity: 0.8,
            }}
          >
            <Popup>
              <div className="max-w-xs">
                <h3 className="font-bold text-lg mb-1">
                  {location.zipcode} ({location.state})
                </h3>
                <p className="mb-2">
                  <span className="font-semibold">Users:</span> {location.count}
                </p>
                <div className="max-h-48 overflow-y-auto">
                  {formatDemographics(location)}
                </div>
                <div className="mt-2">
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
          </CircleMarker>
        ))}
      </MapContainer>

      <div className="absolute bottom-2 right-2 z-20 bg-black bg-opacity-70 p-2 rounded">
        <div className="flex items-center text-xs">
          <span
            className="w-3 h-3 inline-block mr-1 rounded-full"
            style={{ backgroundColor: "rgb(0, 100, 200)" }}
          ></span>
          <span className="text-white mr-2">Fewer Users</span>
          <span
            className="w-3 h-3 inline-block mr-1 rounded-full"
            style={{ backgroundColor: "rgb(255, 0, 0)" }}
          ></span>
          <span className="text-white">More Users</span>
        </div>
      </div>
    </div>
  );
};

export default UserGeographicMap;
