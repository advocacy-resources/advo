import {
  getResource,
  updateResource,
  deleteResource,
  getResources,
} from "../resource-operations";
import prisma from "@/prisma/client";
import { processResourceImages } from "../image-utils";

// Mock the Prisma client
jest.mock("@/prisma/client", () => ({
  __esModule: true,
  default: {
    resource: {
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));

// Mock the image-utils module
jest.mock("../image-utils", () => ({
  processResourceImages: jest.fn((resource) =>
    resource ? { ...resource, processed: true } : null,
  ),
}));

describe("Resource Operations", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getResource", () => {
    test("should return null when resource not found", async () => {
      // Mock Prisma findUnique to return null
      (prisma.resource.findUnique as jest.Mock).mockResolvedValue(null);

      // Call the function
      const result = await getResource("non-existent-id");

      // Verify the result
      expect(result).toBeNull();
      expect(prisma.resource.findUnique).toHaveBeenCalledWith({
        where: { id: "non-existent-id" },
      });
      expect(processResourceImages).not.toHaveBeenCalled();
    });

    test("should return processed resource when found", async () => {
      // Mock resource data
      const mockResource = {
        id: "test-id",
        name: "Test Resource",
        description: "Test Description",
      };

      // Mock Prisma findUnique to return the resource
      (prisma.resource.findUnique as jest.Mock).mockResolvedValue(mockResource);

      // Call the function
      const result = await getResource("test-id");

      // Verify the result
      expect(prisma.resource.findUnique).toHaveBeenCalledWith({
        where: { id: "test-id" },
      });
      expect(processResourceImages).toHaveBeenCalledWith(mockResource);
      expect(result).toEqual({ ...mockResource, processed: true });
    });

    test("should throw error when database operation fails", async () => {
      // Mock Prisma findUnique to throw an error
      const mockError = new Error("Database error");
      (prisma.resource.findUnique as jest.Mock).mockRejectedValue(mockError);

      // Call the function and expect it to throw
      await expect(getResource("test-id")).rejects.toThrow("Database error");
      expect(prisma.resource.findUnique).toHaveBeenCalledWith({
        where: { id: "test-id" },
      });
    });
  });

  describe("updateResource", () => {
    test("should return null when resource not found", async () => {
      // Mock Prisma findUnique to return null
      (prisma.resource.findUnique as jest.Mock).mockResolvedValue(null);

      // Call the function
      const result = await updateResource("non-existent-id", {
        name: "Updated Name",
      });

      // Verify the result
      expect(result).toBeNull();
      expect(prisma.resource.findUnique).toHaveBeenCalledWith({
        where: { id: "non-existent-id" },
      });
      expect(prisma.resource.update).not.toHaveBeenCalled();
    });

    test("should update resource with provided data", async () => {
      // Mock existing resource
      const existingResource = {
        id: "test-id",
        name: "Original Name",
        description: "Original Description",
      };

      // Mock updated resource
      const updatedResource = {
        id: "test-id",
        name: "Updated Name",
        description: "Original Description",
      };

      // Mock Prisma findUnique and update
      (prisma.resource.findUnique as jest.Mock).mockResolvedValue(
        existingResource,
      );
      (prisma.resource.update as jest.Mock).mockResolvedValue(updatedResource);

      // Call the function
      const result = await updateResource("test-id", { name: "Updated Name" });

      // Verify the result
      expect(prisma.resource.findUnique).toHaveBeenCalledWith({
        where: { id: "test-id" },
      });
      expect(prisma.resource.update).toHaveBeenCalledWith({
        where: { id: "test-id" },
        data: { name: "Updated Name" },
      });
      expect(result).toEqual(updatedResource);
    });

    test("should preserve existing profilePhotoUrl when not provided in update", async () => {
      // Mock existing resource with profilePhotoUrl
      const existingResource = {
        id: "test-id",
        name: "Original Name",
        profilePhotoUrl: "/uploads/existing-photo.jpg",
      };

      // Mock updated resource
      const updatedResource = {
        id: "test-id",
        name: "Updated Name",
        profilePhotoUrl: "/uploads/existing-photo.jpg",
      };

      // Mock Prisma findUnique and update
      (prisma.resource.findUnique as jest.Mock).mockResolvedValue(
        existingResource,
      );
      (prisma.resource.update as jest.Mock).mockResolvedValue(updatedResource);

      // Call the function with update data that doesn't include profilePhotoUrl
      const result = await updateResource("test-id", { name: "Updated Name" });

      // Verify the result
      expect(prisma.resource.update).toHaveBeenCalledWith({
        where: { id: "test-id" },
        data: {
          name: "Updated Name",
          profilePhotoUrl: "/uploads/existing-photo.jpg",
        },
      });
      expect(result).toEqual(updatedResource);
    });

    test("should preserve existing bannerImageUrl when not provided in update", async () => {
      // Mock existing resource with bannerImageUrl
      const existingResource = {
        id: "test-id",
        name: "Original Name",
        bannerImageUrl: "/uploads/existing-banner.jpg",
      };

      // Mock updated resource
      const updatedResource = {
        id: "test-id",
        name: "Updated Name",
        bannerImageUrl: "/uploads/existing-banner.jpg",
      };

      // Mock Prisma findUnique and update
      (prisma.resource.findUnique as jest.Mock).mockResolvedValue(
        existingResource,
      );
      (prisma.resource.update as jest.Mock).mockResolvedValue(updatedResource);

      // Call the function with update data that doesn't include bannerImageUrl
      const result = await updateResource("test-id", { name: "Updated Name" });

      // Verify the result
      expect(prisma.resource.update).toHaveBeenCalledWith({
        where: { id: "test-id" },
        data: {
          name: "Updated Name",
          bannerImageUrl: "/uploads/existing-banner.jpg",
        },
      });
      expect(result).toEqual(updatedResource);
    });

    test("should throw error when database operation fails", async () => {
      // Mock existing resource
      const existingResource = {
        id: "test-id",
        name: "Original Name",
      };

      // Mock Prisma findUnique to succeed but update to fail
      (prisma.resource.findUnique as jest.Mock).mockResolvedValue(
        existingResource,
      );
      const mockError = new Error("Database error");
      (prisma.resource.update as jest.Mock).mockRejectedValue(mockError);

      // Call the function and expect it to throw
      await expect(
        updateResource("test-id", { name: "Updated Name" }),
      ).rejects.toThrow("Database error");
    });
  });

  describe("deleteResource", () => {
    test("should return false when resource not found", async () => {
      // Mock Prisma findUnique to return null
      (prisma.resource.findUnique as jest.Mock).mockResolvedValue(null);

      // Call the function
      const result = await deleteResource("non-existent-id");

      // Verify the result
      expect(result).toBe(false);
      expect(prisma.resource.findUnique).toHaveBeenCalledWith({
        where: { id: "non-existent-id" },
      });
      expect(prisma.resource.delete).not.toHaveBeenCalled();
    });

    test("should delete resource and return true when resource exists", async () => {
      // Mock existing resource
      const existingResource = {
        id: "test-id",
        name: "Resource to Delete",
      };

      // Mock Prisma findUnique and delete
      (prisma.resource.findUnique as jest.Mock).mockResolvedValue(
        existingResource,
      );
      (prisma.resource.delete as jest.Mock).mockResolvedValue(undefined);

      // Call the function
      const result = await deleteResource("test-id");

      // Verify the result
      expect(result).toBe(true);
      expect(prisma.resource.findUnique).toHaveBeenCalledWith({
        where: { id: "test-id" },
      });
      expect(prisma.resource.delete).toHaveBeenCalledWith({
        where: { id: "test-id" },
      });
    });

    test("should throw error when database operation fails", async () => {
      // Mock existing resource
      const existingResource = {
        id: "test-id",
        name: "Resource to Delete",
      };

      // Mock Prisma findUnique to succeed but delete to fail
      (prisma.resource.findUnique as jest.Mock).mockResolvedValue(
        existingResource,
      );
      const mockError = new Error("Database error");
      (prisma.resource.delete as jest.Mock).mockRejectedValue(mockError);

      // Call the function and expect it to throw
      await expect(deleteResource("test-id")).rejects.toThrow("Database error");
    });
  });

  describe("getResources", () => {
    test("should return paginated resources with default parameters", async () => {
      // Mock resources
      const mockResources = [
        { id: "1", name: "Resource 1" },
        { id: "2", name: "Resource 2" },
      ];

      // Mock Prisma count and findMany
      (prisma.resource.count as jest.Mock).mockResolvedValue(2);
      (prisma.resource.findMany as jest.Mock).mockResolvedValue(mockResources);

      // Call the function with default parameters
      const result = await getResources();

      // Verify the result
      expect(prisma.resource.count).toHaveBeenCalledWith({ where: {} });
      expect(prisma.resource.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
        orderBy: { createdAt: "desc" },
      });
      expect(processResourceImages).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        data: mockResources.map((resource) => ({
          ...resource,
          processed: true,
        })),
        pagination: {
          total: 2,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });
    });

    test("should apply category filters correctly", async () => {
      // Mock resources
      const mockResources = [
        { id: "1", name: "Resource 1", category: ["health"] },
      ];

      // Mock Prisma count and findMany
      (prisma.resource.count as jest.Mock).mockResolvedValue(1);
      (prisma.resource.findMany as jest.Mock).mockResolvedValue(mockResources);

      // Call the function with category filter
      await getResources(1, 10, { category: ["health"] });

      // Verify the result
      const expectedWhere = { category: { hasSome: ["health"] } };
      expect(prisma.resource.count).toHaveBeenCalledWith({
        where: expectedWhere,
      });
      expect(prisma.resource.findMany).toHaveBeenCalledWith({
        where: expectedWhere,
        skip: 0,
        take: 10,
        orderBy: { createdAt: "desc" },
      });
    });

    test("should apply type filters correctly", async () => {
      // Mock resources
      const mockResources = [
        { id: "1", name: "Resource 1", type: ["nonprofit"] },
      ];

      // Mock Prisma count and findMany
      (prisma.resource.count as jest.Mock).mockResolvedValue(1);
      (prisma.resource.findMany as jest.Mock).mockResolvedValue(mockResources);

      // Call the function with type filter
      await getResources(1, 10, { type: ["nonprofit"] });

      // Verify the result
      // The type filter is applied using a more generic approach
      expect(prisma.resource.count).toHaveBeenCalled();
      expect(prisma.resource.findMany).toHaveBeenCalled();

      // Check that the where clause was passed with the type filter
      const findManyCall = (prisma.resource.findMany as jest.Mock).mock
        .calls[0][0];
      expect(findManyCall.where).toHaveProperty("type");
      expect(findManyCall.where.type).toEqual({ hasSome: ["nonprofit"] });
    });

    test("should handle pagination correctly", async () => {
      // Mock a larger set of resources
      const mockResources = [
        { id: "11", name: "Resource 11" },
        { id: "12", name: "Resource 12" },
      ];

      // Mock Prisma count and findMany
      (prisma.resource.count as jest.Mock).mockResolvedValue(25);
      (prisma.resource.findMany as jest.Mock).mockResolvedValue(mockResources);

      // Call the function with page 2, limit 5
      const result = await getResources(2, 5);

      // Verify the result
      expect(prisma.resource.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 5, // Skip the first 5 items
        take: 5, // Take the next 5
        orderBy: { createdAt: "desc" },
      });
      expect(result.pagination).toEqual({
        total: 25,
        page: 2,
        limit: 5,
        totalPages: 5,
      });
    });

    test("should throw error when database operation fails", async () => {
      // Mock Prisma count to fail
      const mockError = new Error("Database error");
      (prisma.resource.count as jest.Mock).mockRejectedValue(mockError);

      // Call the function and expect it to throw
      await expect(getResources()).rejects.toThrow("Database error");
    });
  });
});
