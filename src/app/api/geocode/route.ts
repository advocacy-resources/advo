import { NextRequest, NextResponse } from "next/server";
import geocodeAddress from "@/components/utils/geocode-address";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const address = searchParams.get("address");

    if (!address) {
      return NextResponse.json(
        { error: "Address parameter is required" },
        { status: 400 },
      );
    }

    const location = await geocodeAddress(address);

    if (!location) {
      return NextResponse.json(
        { error: "Could not geocode the provided address" },
        { status: 404 },
      );
    }

    return NextResponse.json(location);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}
