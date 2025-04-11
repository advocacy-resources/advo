/**
 * Calculates the distance between two coordinates using the Haversine formula
 * @param lat1 Latitude of the first point
 * @param lon1 Longitude of the first point
 * @param lat2 Latitude of the second point
 * @param lon2 Longitude of the second point
 * @returns Distance in miles
 */

// Debug configuration
const DEBUG = {
  enabled: false
};

// Debug logger utility
function debugLog(message: string, data?: any): void {
  if (!DEBUG.enabled) return;
  
  const prefix = "[DISTANCE DEBUG]";
  if (data !== undefined) {
    console.log(`${prefix} ${message}`, data);
  } else {
    console.log(`${prefix} ${message}`);
  }
}
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  debugLog("Calculating distance between:",
    { lat1, lon1, lat2, lon2 });
  // Earth's radius in miles
  const earthRadius = 3958.8;

  // Convert latitude and longitude from degrees to radians
  const latRad1 = (lat1 * Math.PI) / 180;
  const lonRad1 = (lon1 * Math.PI) / 180;
  const latRad2 = (lat2 * Math.PI) / 180;
  const lonRad2 = (lon2 * Math.PI) / 180;

  // Differences in coordinates
  const dLat = latRad2 - latRad1;
  const dLon = lonRad2 - lonRad1;

  // Haversine formula
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(latRad1) * Math.cos(latRad2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = earthRadius * c;

  debugLog(`Calculated distance: ${distance.toFixed(2)} miles`);
  return distance;
}

/**
 * Checks if a location is within a specified distance of another location
 * @param lat1 Latitude of the first point
 * @param lon1 Longitude of the first point
 * @param lat2 Latitude of the second point
 * @param lon2 Longitude of the second point
 * @param maxDistance Maximum distance in miles
 * @returns Boolean indicating if the locations are within the specified distance
 */
export function isWithinDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  maxDistance: number
): boolean {
  debugLog(`Checking if within distance: ${maxDistance} miles`);
  const distance = calculateDistance(lat1, lon1, lat2, lon2);
  const result = distance <= maxDistance;
  debugLog(`Is within distance: ${result} (${distance.toFixed(2)} miles <= ${maxDistance} miles)`);
  return result;
}