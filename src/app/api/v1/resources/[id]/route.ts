import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { getResource, updateResource, deleteResource } from "@/lib/resource-operations";

// Base Resource interface
export interface IResource {
  id: string;
  name: string;
  description: string;
  type: string[];
  category: string[];
  contact: Prisma.JsonValue;
  address: Prisma.JsonValue;
  operatingHours: Prisma.JsonValue;
  eligibilityCriteria: string;
  servicesProvided: string[];
  targetAudience: string[];
  accessibilityFeatures: string[];
  cost: string;
  ratings: Prisma.JsonValue;
  geoLocation: Prisma.JsonValue;
  policies: string[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Response interfaces
export interface IGetResourceResponse {
  resource: IResource;
}

export interface IUpdateResourceResponse {
  resource: IResource;
}

export interface IDeleteResourceResponse {
  message: string;
}

export interface IErrorResponse {
  error: string;
}

// Request types
export type ICreateResourceRequest = Omit<
  IResource,
  "id" | "createdAt" | "updatedAt"
>;

export type IUpdateResourceRequest = Prisma.ResourceUpdateInput;

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
): Promise<NextResponse<IGetResourceResponse | IErrorResponse>> {
  try {
    const { id } = params;
    const resource = await getResource(id);
    
    if (!resource) {
      return NextResponse.json(
        { error: "Resource not found" },
        { status: 404 },
      );
    }
    
    return NextResponse.json({ resource: resource as unknown as IResource });
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
    const updatedResource = await updateResource(id, data);

    if (!updatedResource) {
      return NextResponse.json(
        { error: "Resource not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      resource: updatedResource as unknown as IResource,
    });
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
    const result = await deleteResource(id);
    
    if (!result) {
      return NextResponse.json(
        { error: "Resource not found" },
        { status: 404 },
      );
    }
    
    return NextResponse.json({ message: "Resource deleted" }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}
