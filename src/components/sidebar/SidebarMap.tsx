"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { LatLngExpression } from "leaflet";
import { Progress } from "@/components/ui/progress";

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
}

export default function MapComponent({ lat, lon }: MapComponentProps) {
  const [userLocation, setUserLocation] = useState<LatLngExpression>([
    lat || 51.505, // Default to provided latitude or London
    lon || -0.09, // Default to provided longitude or London
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [mapReady, setMapReady] = useState(false);

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

    if (typeof window !== "undefined") {
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
    }

    return () => clearInterval(timer);
  }, [lat, lon, isLoading]);

  if (typeof window === "undefined" || isLoading || !mapReady) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Progress value={progress} className="w-[60%] mb-4" />
        <p>Loading map... {progress}%</p>
      </div>
    );
  }

  return (
    <div className="col-span-4 bg-gray-200">
      <div style={{ height: "100vh", width: "100%" }}>
        <MapContainer
          center={userLocation}
          zoom={13}
          scrollWheelZoom={true}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <Marker position={userLocation}>
            <Popup>You are here</Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
}
