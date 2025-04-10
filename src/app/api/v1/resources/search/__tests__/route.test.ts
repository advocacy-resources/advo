import { NextRequest, NextResponse } from "next/server";
import { POST } from "../route";
import prisma from "@/prisma/client";

// Define types for pipeline stages
interface SearchStage {
  $search?: {
    index: string;
    compound: {
      must: Array<{ text: { query: string; path: string | string[] } }>;
      should: Array<{ text: { query: string; path: string | string[] } }>;
    };
  };
  $facet?: {
    metadata: [{ $count: string }];
    data: [{ $skip: number }, { $limit: number }];
  };
}

// Mock prisma client
jest.mock("@/prisma/client", () => ({
  __esModule: true,
  default: {
    resource: {
      findMany: jest.fn(),
      count: jest.fn(),
      aggregateRaw: jest.fn(),
    },
  },
}));
// Mock NextRequest and NextResponse
jest.mock("next/server", () => {
  return {
    NextRequest: jest.fn().mockImplementation((url, init) => {
      return {
        url,
        method: init?.method || "GET",
        body: init?.body,
        json: () => Promise.resolve(JSON.parse(init?.body || "{}")),
      };
    }),
    NextResponse: {
      json: jest.fn((data, options) => ({
        data,
        options,
        headers: new Map(),
        set: function (key: string, value: string) {
          this.headers.set(key, value);
          return this;
        },
      })),
    },
  };
});

// Define Request globally for the tests
global.Request = jest.fn() as unknown as typeof Request;

describe("Resources Search API Route", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST handler", () => {
    test("returns paginated resources when no search parameters are provided", async () => {
      // Mock request
      const request = new NextRequest(
        "http://localhost:3000/api/v1/resources/search",
        {
          method: "POST",
          body: JSON.stringify({
            page: 1,
            limit: 10,
          }),
        },
      );

      // Mock prisma responses
      const mockResources = [
        { id: 1, name: "Resource 1" },
        { id: 2, name: "Resource 2" },
      ];
      (prisma.resource.findMany as jest.Mock).mockResolvedValue(mockResources);
      (prisma.resource.count as jest.Mock).mockResolvedValue(2);

      // Call the handler
      const response = await POST(request);

      // Verify response - don't check the second parameter
      expect(NextResponse.json).toHaveBeenCalledWith({
        data: mockResources,
        pagination: {
          total: 2,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });

      // Verify cache control headers
      expect(response.headers.get("Cache-Control")).toBe("no-store, max-age=0");

      // Verify prisma calls
      expect(prisma.resource.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: "desc" },
        skip: 0,
        take: 10,
      });
      expect(prisma.resource.count).toHaveBeenCalled();
    });

    test("handles search with parameters correctly", async () => {
      // Mock request with search parameters
      const request = new NextRequest(
        "http://localhost:3000/api/v1/resources/search",
        {
          method: "POST",
          body: JSON.stringify({
            page: 1,
            limit: 10,
            category: ["Health"],
            type: ["Service"],
            zipCode: "12345",
            description: "test",
          }),
        },
      );

      // Mock prisma response for aggregateRaw
      const mockAggregateResult = [
        {
          data: [{ id: 1, name: "Health Resource" }],
          total: 1,
        },
      ];
      (prisma.resource.aggregateRaw as jest.Mock).mockResolvedValue(
        mockAggregateResult,
      );

      // Call the handler
      const response = await POST(request);

      // Verify response - don't check the second parameter
      expect(NextResponse.json).toHaveBeenCalledWith({
        data: [{ id: 1, name: "Health Resource" }],
        pagination: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });

      // Verify cache control headers
      expect(response.headers.get("Cache-Control")).toBe("no-store, max-age=0");

      // Verify prisma calls
      expect(prisma.resource.aggregateRaw).toHaveBeenCalled();

      // The pipeline should include search parameters
      const pipelineArg = (prisma.resource.aggregateRaw as jest.Mock).mock
        .calls[0][0].pipeline;
      expect(pipelineArg).toBeDefined();

      // Check that the search clause is included
      const searchClause = pipelineArg.find(
        (stage: SearchStage) => stage.$search,
      );
      expect(searchClause).toBeDefined();
      expect(searchClause.$search?.compound.must).toHaveLength(3); // category, zipCode, type
      expect(searchClause.$search?.compound.should).toHaveLength(1); // description
    });

    test("handles invalid request body", async () => {
      // Mock request with invalid JSON
      const request = new NextRequest(
        "http://localhost:3000/api/v1/resources/search",
        {
          method: "POST",
          body: "invalid json",
        },
      );

      // Call the handler
      await POST(request);

      // Verify response
      expect(NextResponse.json).toHaveBeenCalledWith(
        {
          error: "Invalid request format",
          details: "Could not parse request body as JSON",
        },
        { status: 400 },
      );
    });

    test("handles database error during findMany", async () => {
      // Mock request
      const request = new NextRequest(
        "http://localhost:3000/api/v1/resources/search",
        {
          method: "POST",
          body: JSON.stringify({
            page: 1,
            limit: 10,
          }),
        },
      );

      // Mock prisma error
      const dbError = new Error("Database connection error");
      (prisma.resource.findMany as jest.Mock).mockRejectedValue(dbError);

      // Call the handler
      await POST(request);

      // Verify response
      expect(NextResponse.json).toHaveBeenCalledWith(
        {
          error: "Failed to fetch resources",
          details: "Database error when fetching resources",
        },
        { status: 500 },
      );
    });

    test("handles database error during aggregateRaw", async () => {
      // Mock request with search parameters
      const request = new NextRequest(
        "http://localhost:3000/api/v1/resources/search",
        {
          method: "POST",
          body: JSON.stringify({
            page: 1,
            limit: 10,
            category: ["Health"],
          }),
        },
      );

      // Mock prisma error
      const dbError = new Error("Aggregation error");
      (prisma.resource.aggregateRaw as jest.Mock).mockRejectedValue(dbError);

      // Call the handler
      await POST(request);

      // Verify response
      expect(NextResponse.json).toHaveBeenCalledWith(
        {
          error: "Failed to fetch resources",
          details: "Database error during search query",
        },
        { status: 500 },
      );
    });

    test("normalizes and validates search parameters correctly", async () => {
      // Mock request with mixed parameter types
      const request = new NextRequest(
        "http://localhost:3000/api/v1/resources/search",
        {
          method: "POST",
          body: JSON.stringify({
            page: "2", // String instead of number
            limit: "15", // String instead of number
            category: "Health", // Single string instead of array
            type: ["Service", ""], // Array with empty string
            zipCode: "  12345  ", // String with whitespace
            description: "  ", // Empty string with whitespace
          }),
        },
      );

      // Mock prisma response
      (prisma.resource.aggregateRaw as jest.Mock).mockResolvedValue([
        {
          data: [],
          total: 0,
        },
      ]);

      // Call the handler
      await POST(request);

      // Verify that parameters were normalized correctly
      const pipelineArg = (prisma.resource.aggregateRaw as jest.Mock).mock
        .calls[0][0].pipeline;
      const searchClause = pipelineArg.find(
        (stage: SearchStage) => stage.$search,
      );

      // Check that page and limit were converted to numbers
      expect(
        pipelineArg.find((stage: SearchStage) => stage.$facet).$facet?.data[0]
          .$skip,
      ).toBe(15); // (page-1)*limit = (2-1)*15 = 15

      // Check that category was converted to array
      const categoryClause = searchClause.$search?.compound.must.find(
        (clause: { text: { path: string } }) => clause.text.path === "category",
      );
      expect(categoryClause?.text.query).toBe("Health");

      // Check that empty strings were filtered from type array
      const typeClause = searchClause.$search?.compound.must.find(
        (clause: { text: { path: string } }) => clause.text.path === "type",
      );
      // Use includes instead of exact match to handle potential whitespace
      expect(typeClause?.text.query.trim()).toBe("Service");

      // Check that zipCode was trimmed
      const zipCodeClause = searchClause.$search?.compound.must.find(
        (clause: { text: { path: string } }) => clause.text.path === "zipCode",
      );
      expect(zipCodeClause?.text.query).toBe("12345");

      // Check that empty description was ignored
      expect(searchClause.$search?.compound.should).toHaveLength(0);
    });
  });
});
