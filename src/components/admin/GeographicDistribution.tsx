"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import UserGeographicMap from "./UserGeographicMap";

interface StateData {
  state: string;
  count: number;
  demographics?: {
    ageGroups?: Record<string, number>;
    genders?: Record<string, number>;
    raceEthnicity?: Record<string, number>;
    sexualOrientation?: Record<string, number>;
    resourceInterests?: Record<string, number>;
  };
}

interface StateMapData {
  id: string;
  name: string;
  path: string;
  center: [number, number];
  count?: number;
  demographics?: {
    ageGroups?: Record<string, number>;
    genders?: Record<string, number>;
    raceEthnicity?: Record<string, number>;
    sexualOrientation?: Record<string, number>;
    resourceInterests?: Record<string, number>;
  };
}

interface GeographicDistributionProps {
  data: StateData[];
  loading: boolean;
}

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

const GeographicDistribution: React.FC<GeographicDistributionProps> = ({
  data,
  loading,
}) => {
  const [userLocations, setUserLocations] = useState<UserLocation[]>([]);
  const [geocodeLoading, setGeocodeLoading] = useState(false);
  const [geocodeError, setGeocodeError] = useState<string | null>(null);
  const [showList, setShowList] = useState(true);

  // Process the data to get unique zipcodes
  useEffect(() => {
    const processGeographicData = async () => {
      if (!data || data.length === 0 || loading) return;

      setGeocodeLoading(true);
      setGeocodeError(null);

      try {
        // Extract unique zipcodes from the data
        const zipcodeMap: Record<
          string,
          {
            state: string;
            count: number;
            demographics?: {
              ageGroups?: Record<string, number>;
              genders?: Record<string, number>;
              raceEthnicity?: Record<string, number>;
              sexualOrientation?: Record<string, number>;
              resourceInterests?: Record<string, number>;
            };
          }
        > = {};

        // For now, we'll use state data as a proxy for zipcode data
        // In a real implementation, we would use actual zipcode data from users
        data.forEach((stateData) => {
          // Create a fake zipcode for each state (for demo purposes)
          const fakeZipcode = getFakeZipcodeForState(stateData.state);

          zipcodeMap[fakeZipcode] = {
            state: stateData.state,
            count: stateData.count,
            demographics: stateData.demographics,
          };
        });

        // Get the list of unique zipcodes
        const zipcodes = Object.keys(zipcodeMap);

        if (zipcodes.length === 0) {
          setUserLocations([]);
          setGeocodeLoading(false);
          return;
        }

        // Call the geocode API to get coordinates for each zipcode
        const response = await fetch("/api/v1/admin/geocode-zipcodes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ zipcodes }),
        });

        if (!response.ok) {
          throw new Error(`Geocoding failed: ${response.statusText}`);
        }

        const geocodeData = await response.json();

        // Map the geocoded data to user locations
        const locations: UserLocation[] = [];

        Object.entries(geocodeData.results).forEach(([zipcode, coords]) => {
          const { latitude, longitude } = coords as {
            latitude: number;
            longitude: number;
          };
          const stateData = zipcodeMap[zipcode];

          if (stateData) {
            locations.push({
              zipcode,
              state: stateData.state,
              latitude,
              longitude,
              count: stateData.count,
              demographics: stateData.demographics,
            });
          }
        });

        setUserLocations(locations);
      } catch (error) {
        console.error("Error geocoding zipcodes:", error);
        setGeocodeError((error as Error).message);

        // Fallback: Create locations with approximate coordinates based on states
        const fallbackLocations = data.map((stateData) => {
          const coords = getApproximateStateCoordinates(stateData.state);
          return {
            zipcode: getFakeZipcodeForState(stateData.state),
            state: stateData.state,
            latitude: coords[0],
            longitude: coords[1],
            count: stateData.count,
            demographics: stateData.demographics,
          };
        });

        setUserLocations(fallbackLocations);
      } finally {
        setGeocodeLoading(false);
      }
    };

    processGeographicData();
  }, [data, loading]);

  // Helper function to get a fake zipcode for a state (for demo purposes)
  const getFakeZipcodeForState = (state: string): string => {
    const stateZipcodes: Record<string, string> = {
      CA: "90210",
      TX: "75001",
      NY: "10001",
      FL: "33101",
      IL: "60601",
      WA: "98101",
      CO: "80201",
      GA: "30301",
      MI: "48201",
      OH: "44101",
      VA: "23218",
    };

    return stateZipcodes[state] || "00000";
  };

  // Helper function to get approximate coordinates for states (fallback)
  const getApproximateStateCoordinates = (state: string): [number, number] => {
    const stateCoordinates: Record<string, [number, number]> = {
      CA: [36.7783, -119.4179],
      TX: [31.9686, -99.9018],
      NY: [42.1657, -74.9481],
      FL: [27.6648, -81.5158],
      IL: [40.6331, -89.3985],
      WA: [47.7511, -120.7401],
      CO: [39.5501, -105.7821],
      GA: [33.0406, -83.6431],
      MI: [44.3148, -85.6024],
      OH: [40.4173, -82.9071],
      VA: [37.7693, -78.17],
    };

    return stateCoordinates[state] || [39.8283, -98.5795]; // Default to center of US
  };

  // Check if there's any data
  const hasData =
    data && data.length > 0 && data.some((item) => item.count > 0);

  return (
    <Card className="p-6 bg-gray-800 border-0 shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">
          Geographic Distribution
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowList(!showList)}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-md transition-colors"
          >
            {showList ? "Hide List" : "Show List"}
          </button>
        </div>
      </div>

      {loading || geocodeLoading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-300 mx-auto mb-2"></div>
            <p className="text-gray-400">Loading geographic data...</p>
          </div>
        </div>
      ) : !hasData ? (
        <div className="h-64 flex items-center justify-center">
          <p className="text-gray-400">
            No geographic data available. Users need to provide zipcode
            information.
          </p>
        </div>
      ) : (
        <div>
          <div className="mb-2 text-xs text-gray-400">
            <span className="inline-flex items-center mr-4">
              <span className="w-3 h-3 rounded-full bg-green-400 mr-1"></span>{" "}
              Circles show user density by location
            </span>
            <span className="text-xs text-gray-400">
              Click on circles for detailed demographic information
            </span>
          </div>

          {geocodeError && (
            <div className="mb-4 p-3 bg-red-900 bg-opacity-50 text-white rounded-md text-sm">
              <p className="font-semibold">Warning:</p>
              <p>{geocodeError}</p>
              <p className="mt-1">Using approximate locations as fallback.</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`${showList ? "md:col-span-2" : "md:col-span-3"}`}>
              <UserGeographicMap
                userLocations={userLocations}
                loading={loading || geocodeLoading}
              />
            </div>

            {showList && (
              <div className="md:col-span-1">
                <div className="bg-gray-700 rounded-md p-4 h-96 overflow-y-auto">
                  <h3 className="text-lg font-semibold text-white mb-3">
                    Locations
                  </h3>

                  {userLocations.length === 0 ? (
                    <p className="text-gray-400">No location data available.</p>
                  ) : (
                    <div className="space-y-2">
                      {userLocations
                        .sort((a, b) => b.count - a.count)
                        .map((location) => (
                          <div
                            key={`${location.zipcode}-${location.state}`}
                            className="flex justify-between items-center p-2 bg-gray-800 rounded-md"
                          >
                            <div>
                              <p className="font-medium text-white">
                                {location.zipcode} ({location.state})
                              </p>
                              <p className="text-xs text-gray-400">
                                {location.latitude.toFixed(2)},{" "}
                                {location.longitude.toFixed(2)}
                              </p>
                            </div>
                            <div className="bg-gray-600 px-2 py-1 rounded-full text-white text-sm">
                              {location.count} users
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};

export default GeographicDistribution;
