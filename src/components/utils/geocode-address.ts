import axios from "axios";

// Simple in-memory cache for geocoded addresses
const geocodeCache: Record<string, { latitude: number; longitude: number }> = {};

// Debug configuration
const DEBUG = {
  enabled: false,
};

// Debug logger utility
function debugLog(message: string, data?: any): void {
  if (!DEBUG.enabled) return;

  const prefix = "[GEOCODE DEBUG]";
  if (data !== undefined) {
    console.log(`${prefix} ${message}`, data);
  } else {
    console.log(`${prefix} ${message}`);
  }
}

const geocodeAddress = async (
  address: string,
): Promise<{ latitude: number; longitude: number }> => {
  debugLog("Geocoding address:", address);
  
  // Normalize the address to ensure consistent cache keys
  const normalizedAddress = address.trim().toLowerCase();
  
  // Check if we have this address cached
  if (geocodeCache[normalizedAddress]) {
    debugLog("Using cached geocode result for:", normalizedAddress);
    return geocodeCache[normalizedAddress];
  }

  // Get API key from environment variable
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    console.error("Google Maps API key is not set");
    throw new Error(
      "Google Maps API key is not configured. Please check your environment variables.",
    );
  }

  // Handle empty or invalid addresses
  if (!address || normalizedAddress === "") {
    console.error("Empty or invalid address provided");
    throw new Error("Empty or invalid address provided for geocoding");
  }

  const encodedAddress = encodeURIComponent(address);

  try {
    debugLog("Making API request for address:", encodedAddress);
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`,
      { timeout: 5000 }, // Add timeout to prevent hanging requests
    );

    debugLog("API response status:", response.data.status);
    debugLog("API response results count:", response.data.results?.length || 0);

    if (
      response.data.status === "OK" &&
      response.data.results &&
      response.data.results.length > 0
    ) {
      const location = response.data.results[0].geometry.location;
      debugLog("Successfully geocoded to:", location);
      
      // Cache the result
      const result = {
        latitude: location.lat,
        longitude: location.lng,
      };
      geocodeCache[normalizedAddress] = result;
      
      return result;
    } else {
      console.error(`Geocoding error: ${response.data.status}`);
      debugLog("Full error response:", response.data);
      throw new Error(
        `Geocoding failed: ${response.data.status || "Unknown error"}`,
      );
    }
  } catch (error) {
    console.error("Geocoding error:", error);

    // Check if it's an axios error with a response
    if (axios.isAxiosError(error) && error.response) {
      console.error("API error response:", error.response.data);
      throw new Error(
        `Geocoding API error: ${error.response.status} - ${error.response.statusText}`,
      );
    }

    // Re-throw the error to be handled by the caller
    throw error;
  }
};

export default geocodeAddress;
