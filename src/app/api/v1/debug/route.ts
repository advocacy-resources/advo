// app/api/v1/debug/route.ts
import { NextResponse } from "next/server";
import prisma from "../../../../prisma/client";

export async function GET() {
  try {
    const resourceCount = await prisma.resource.count();
    return NextResponse.json({ count: resourceCount });
  } catch (error) {
    console.error("Prisma connection error:", error);
    return NextResponse.json(
      { error: "Database connection failed" },
      { status: 500 },
    );
  }
}
