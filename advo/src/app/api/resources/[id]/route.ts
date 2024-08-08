import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/client";

// Base Resource interface
export interface IResource {
  id: string;
  name: string;
  description: string;
  type: string[];
  category: string[];
  contact: {
    phone: string;
    email: string;
    website: string;
  };
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    latitude: number;
    longitude: number;
  };
  operatingHours: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
  eligibilityCriteria: string;
  servicesProvided: string[];
  targetAudience: string[];
  accessibilityFeatures: string[];
  cost: string;
  ratings: {
    averageRating: number;
    numberOfReviews: number;
  };
  geoLocation: {
    latitude: number;
    longitude: number;
  };
  policies: string[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// GET request response
export interface IGetResourceResponse {
  resource: IResource;
}

// POST request body (for creating a new resource)
export type ICreateResourceRequest = Omit<
  IResource,
  "id" | "createdAt" | "updatedAt"
>;

// POST request response
export interface ICreateResourceResponse {
  resource: IResource;
}

// PUT request body (for updating a resource)
export type IUpdateResourceRequest = Partial<
  Omit<IResource, "id" | "createdAt" | "updatedAt">
>;

// PUT request response
export interface IUpdateResourceResponse {
  resource: IResource;
}

// DELETE request response
export interface IDeleteResourceResponse {
  message: string;
}

// Error response
export interface IErrorResponse {
  error: string;
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
): Promise<NextResponse<IGetResourceResponse | IErrorResponse>> {
  try {
    const { id } = params;
    const resource = await prisma.resource.findUnique({
      where: { id },
    });
    if (!resource) {
      return NextResponse.json(
        { error: "Resource not found" },
        { status: 404 },
      );
    }
    return NextResponse.json({ resource });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
): Promise<NextResponse<IUpdateResourceResponse | IErrorResponse>> {
  try {
    const { id } = params;
    const data: IUpdateResourceRequest = await req.json();
    const resource = await prisma.resource.update({
      where: { id },
      data,
    });
    return NextResponse.json({ resource });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
): Promise<NextResponse<IDeleteResourceResponse | IErrorResponse>> {
  try {
    const { id } = params;
    await prisma.resource.delete({
      where: { id },
    });
    return NextResponse.json({ message: "Resource deleted" }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}
