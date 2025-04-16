import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { hash } from "bcryptjs";
import prisma from "@/prisma/client";
import { authOptions } from "@/lib/authOptions";

// Constants
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

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

// GET handler for fetching users with pagination
export async function GET(request: NextRequest) {
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

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, Number(searchParams.get("page")) || DEFAULT_PAGE);
    const limit = Math.min(
      MAX_LIMIT,
      Math.max(1, Number(searchParams.get("limit")) || DEFAULT_LIMIT),
    );
    const skip = (page - 1) * limit;

    // Fetch users with pagination
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          managedResourceId: true,
          zipcode: true,
          state: true,
        },
      }),
      prisma.user.count(),
    ]);

    // Return paginated response
    return NextResponse.json({
      data: users,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 },
    );
  }
}

// POST handler for creating a new user
export async function POST(request: NextRequest) {
  try {
    // Only admin can create users
    const isAdmin = await checkAdminRole();
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 },
      );
    }

    // Parse request body
    const {
      name,
      email,
      password,
      role,
      isActive,
      managedResourceId,
      zipcode,
      state,
    } = await request.json();

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    // Check if user with this email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 },
      );
    }

    // Hash the password
    const hashedPassword = await hash(password, 10);

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        name: name || "",
        email,
        password: hashedPassword,
        role: role || "user",
        isActive: isActive !== undefined ? isActive : true,
        managedResourceId: role === "business_rep" ? managedResourceId : null,
        zipcode,
        state: state || (zipcode ? deriveStateFromZipcode(zipcode) : null),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        managedResourceId: true,
        zipcode: true,
        state: true,
      },
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 },
    );
  }
}

// Helper function to derive state from zipcode
function deriveStateFromZipcode(zipcode: string): string | null {
  if (!zipcode || zipcode.length < 1) return null;

  // Simple mapping of first digit to state (same as in analytics route)
  const zipcodeToState: Record<string, string> = {
    "0": "NY",
    "1": "NY",
    "2": "VA",
    "3": "FL",
    "4": "MI",
    "5": "TX",
    "6": "IL",
    "7": "TX",
    "8": "CO",
    "9": "CA",
  };

  const firstDigit = zipcode.charAt(0);
  return zipcodeToState[firstDigit] || null;
}
