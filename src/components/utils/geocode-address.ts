import axios from "axios";

const geocodeAddress = async (
  address: string,
): Promise<{ latitude: number; longitude: number }> => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    console.error("Google Maps API key is not set");
    // Default to Nashville, TN coordinates instead of null island
    return { latitude: 36.1627, longitude: -86.7816 };
  }

  const encodedAddress = encodeURIComponent(address);

  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`,
    );

    if (response.data.status === "OK") {
      const location = response.data.results[0].geometry.location;
      return {
        latitude: location.lat,
        longitude: location.lng,
      };
    } else {
      console.error(`Geocoding error: ${response.data.status}`);
      // Default to Nashville, TN coordinates
      return { latitude: 36.1627, longitude: -86.7816 };
    }
  } catch (error) {
    console.error("Geocoding error:", error);
    // Default to Nashville, TN coordinates
    return { latitude: 36.1627, longitude: -86.7816 };
  }
};

export default geocodeAddress;
