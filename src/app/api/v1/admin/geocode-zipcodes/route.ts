import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import geocodeAddress from "@/components/utils/geocode-address";

// Helper function to check admin role
async function checkAdminRole() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    return false;
  }

  return true;
}

// Helper function to check if user is admin or business representative
async function checkAdminOrBusinessRepRole() {
  const session = await getServerSession(authOptions);

  if (
    !session ||
    (session.user.role !== "admin" && session.user.role !== "business_rep")
  ) {
    return false;
  }

  return true;
}

// POST handler for geocoding multiple zipcodes
export async function POST(request: NextRequest) {
  try {
    // Check if user is admin or business representative
    const isAuthorized = await checkAdminOrBusinessRepRole();
    if (!isAuthorized) {
      return NextResponse.json(
        {
          error:
            "Unauthorized. Admin or Business Representative access required.",
        },
        { status: 403 },
      );
    }

    // Get request body
    const requestData = await request.json();
    const { zipcodes } = requestData;

    if (!zipcodes || !Array.isArray(zipcodes) || zipcodes.length === 0) {
      return NextResponse.json(
        { error: "Invalid request. Expected array of zipcodes." },
        { status: 400 },
      );
    }

    // Process zipcodes in batches to avoid rate limiting
    const batchSize = 10;
    const results: Record<string, { latitude: number; longitude: number }> = {};
    const errors: Record<string, string> = {};

    // Process in batches
    for (let i = 0; i < zipcodes.length; i += batchSize) {
      const batch = zipcodes.slice(i, i + batchSize);

      // Process each zipcode in the batch
      const batchPromises = batch.map(async (zipcode: string) => {
        try {
          // Add USA to make geocoding more accurate
          const result = await geocodeAddress(`${zipcode}, USA`);
          results[zipcode] = result;
          return { zipcode, success: true };
        } catch (error) {
          console.error(`Error geocoding zipcode ${zipcode}:`, error);
          errors[zipcode] = (error as Error).message;
          return { zipcode, success: false };
        }
      });

      // Wait for all promises in the batch to resolve
      await Promise.all(batchPromises);

      // Add a small delay between batches to avoid rate limiting
      if (i + batchSize < zipcodes.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    return NextResponse.json({
      results,
      errors,
      totalProcessed: zipcodes.length,
      successCount: Object.keys(results).length,
      errorCount: Object.keys(errors).length,
    });
  } catch (error) {
    console.error("Error in geocode-zipcodes API:", error);
    return NextResponse.json(
      { error: "Failed to process zipcodes" },
      { status: 500 },
    );
  }
}
