import { NextRequest, NextResponse } from "next/server";
import geocodeAddress from "@/components/utils/geocode-address";

/**
 * POST handler for geocoding multiple addresses
 * This endpoint accepts an array of addresses and returns their geocoded coordinates
 */
export async function POST(request: NextRequest) {
  try {
    // Get request body
    const requestData = await request.json();
    const { addresses } = requestData;

    if (!addresses || !Array.isArray(addresses) || addresses.length === 0) {
      return NextResponse.json(
        { error: "Invalid request. Expected array of addresses." },
        { status: 400 },
      );
    }

    // Process addresses in batches to avoid rate limiting
    const batchSize = 10;
    const results: Record<string, { latitude: number; longitude: number }> = {};
    const errors: Record<string, string> = {};

    // Process in batches
    for (let i = 0; i < addresses.length; i += batchSize) {
      const batch = addresses.slice(i, i + batchSize);

      // Process each address in the batch
      const batchPromises = batch.map(async (address: string) => {
        try {
          const result = await geocodeAddress(address);
          results[address] = result;
          return { address, success: true };
        } catch (error) {
          console.error(`Error geocoding address ${address}:`, error);
          errors[address] = (error as Error).message;
          return { address, success: false };
        }
      });

      // Wait for all promises in the batch to resolve
      await Promise.all(batchPromises);

      // Add a small delay between batches to avoid rate limiting
      if (i + batchSize < addresses.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    return NextResponse.json({
      results,
      errors,
      totalProcessed: addresses.length,
      successCount: Object.keys(results).length,
      errorCount: Object.keys(errors).length,
    });
  } catch (error) {
    console.error("Error in geocode-addresses API:", error);
    return NextResponse.json(
      { error: "Failed to process addresses" },
      { status: 500 },
    );
  }
}
