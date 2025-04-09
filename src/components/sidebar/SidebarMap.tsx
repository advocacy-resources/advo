"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { LatLngExpression } from "leaflet";

// Import setupLeaflet directly
import setupLeaflet from "@/components/utils/leaflet-setup";

// Dynamically import Leaflet CSS
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

interface MapComponentProps {
  lat?: number;
  lon?: number;
  resourceName?: string;
}
export default function MapComponent({
  lat,
  lon,
  resourceName,
}: MapComponentProps) {
  const [userLocation, setUserLocation] = useState<LatLngExpression>([
    lat || 36.1627, // Default to provided latitude or center of US
    lon || -86.7816, // Default to provided longitude or center of US
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const setProgress = useState(0)[1];
  const setMapReady = useState(false)[1];

  useEffect(() => {
    // Import Leaflet CSS
    // Setup Leaflet
    setupLeaflet();

    let timer: NodeJS.Timeout;

    if (isLoading) {
      timer = setInterval(() => {
        setProgress((prevProgress) => {
          if (prevProgress >= 90) {
            clearInterval(timer);
            return prevProgress;
          }
          return prevProgress + 10;
        });
      }, 500);
    }

    if (!lat || !lon) {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation([
              position.coords.latitude,
              position.coords.longitude,
            ]);
            setIsLoading(false);
            setProgress(100);
            setMapReady(true);
          },
          (error) => {
            console.error("Error getting user location:", error);
            setIsLoading(false);
            setProgress(100);
            setMapReady(true);
          },
        );
      } else {
        console.log("Geolocation is not available");
        setIsLoading(false);
        setProgress(100);
        setMapReady(true);
      }
    } else {
      setIsLoading(false);
      setProgress(100);
      setMapReady(true);
    }

    return () => clearInterval(timer);
  }, [lat, lon, isLoading]);

  // return (
  //   <div className="flex flex-col items-center justify-center h-screen">
  //     <Progress value={progress} className="w-[60%] mb-4" />
  //     <div>Loading map... {progress}%</div>
  //   </div>
  // );

  // Force a re-render when the map is ready
  useEffect(() => {
    if (!isLoading) {
      // This will trigger a re-render after the map is loaded
      const timer = setTimeout(() => {
        // Force Leaflet to recalculate map size
        window.dispatchEvent(new Event("resize"));
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  return (
    <div className="w-full h-full relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 z-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-2"></div>
            <p>Loading map...</p>
          </div>
        </div>
      )}
      <MapContainer
        center={userLocation}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
        className="h-full w-full absolute inset-0 z-10"
        whenReady={() => {
          // Force Leaflet to recalculate map size
          window.dispatchEvent(new Event("resize"));
          // Set loading to false after map is ready
          setIsLoading(false);
        }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={userLocation}>
          <Popup>
            <div className="text-center">
              <strong>{resourceName || "Location"}</strong>
              {resourceName && (
                <div>
                  <p className="mt-1 mb-2">Get directions:</p>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${
                      Array.isArray(userLocation)
                        ? `${userLocation[0]},${userLocation[1]}`
                        : `${userLocation.lat},${userLocation.lng}`
                    }`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
                  >
                    Open in Google Maps
                  </a>
                </div>
              )}
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
