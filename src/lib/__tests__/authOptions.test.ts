/**
 * @jest-environment jsdom
 */

import { authOptions } from "../authOptions";
import { compare } from "bcryptjs";
import prisma from "@/prisma/client";
import { Session } from "next-auth";

// Mock dependencies
jest.mock("bcryptjs", () => ({
  compare: jest.fn(),
}));

jest.mock("@/prisma/client", () => ({
  __esModule: true,
  default: {
    user: {
      count: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}));

// Mock next-auth providers
jest.mock("next-auth/providers/credentials", () => {
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  return function CredentialsProvider(options: Record<string, unknown>) {
    return {
      id: "credentials",
      name: options.name,
      type: "credentials",
      credentials: options.credentials,
      authorize: options.authorize,
    };
  };
});

describe("Auth Options", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Credentials Provider", () => {
    // Get the credentials provider from authOptions
    const credentialsProvider = authOptions.providers.find(
      (provider) => provider.id === "credentials",
    );

    // Get the authorize function from the credentials provider
    // @ts-expect-error - We know this property exists in our mock
    const authorize = credentialsProvider?.authorize;

    test("should exist and have correct configuration", () => {
      expect(credentialsProvider).toBeDefined();
      expect(credentialsProvider?.name).toBe("Credentials");
      // Type assertion to access credentials property
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const provider = credentialsProvider as any;
      expect(provider.credentials).toHaveProperty("email");
      expect(provider.credentials).toHaveProperty("password");
    });

    test("should return null when credentials are missing", async () => {
      // Call authorize with missing credentials
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await authorize?.({ email: "", password: "" }, {} as any);

      // Verify the result
      expect(result).toBeNull();
      expect(prisma.user.count).not.toHaveBeenCalled();
      expect(prisma.user.findUnique).not.toHaveBeenCalled();
    });

    test("should return null when user is not found", async () => {
      // Mock database connection test
      (prisma.user.count as jest.Mock).mockResolvedValue(1);

      // Mock user not found
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      // Call authorize with valid credentials
      const result = await authorize?.(
        { email: "test@example.com", password: "password123" },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        {} as any,
      );

      // Verify the result
      expect(result).toBeNull();
      expect(prisma.user.count).toHaveBeenCalled();
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: "test@example.com" },
      });
      expect(compare).not.toHaveBeenCalled();
    });

    test("should return null when user has no password", async () => {
      // Mock database connection test
      (prisma.user.count as jest.Mock).mockResolvedValue(1);

      // Mock user found but without password
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: "user-id",
        email: "test@example.com",
        name: "Test User",
        role: "user",
        isActive: true,
        password: null,
      });

      // Call authorize with valid credentials
      const result = await authorize?.(
        { email: "test@example.com", password: "password123" },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        {} as any,
      );

      // Verify the result
      expect(result).toBeNull();
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: "test@example.com" },
      });
      expect(compare).not.toHaveBeenCalled();
    });

    test("should return null when user account is not active", async () => {
      // Mock database connection test
      (prisma.user.count as jest.Mock).mockResolvedValue(1);

      // Mock user found but inactive
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: "user-id",
        email: "test@example.com",
        name: "Test User",
        role: "user",
        isActive: false,
        password: "hashed-password",
      });

      // Mock password comparison to succeed
      (compare as jest.Mock).mockResolvedValue(true);

      // Call authorize with valid credentials
      const result = await authorize?.(
        { email: "test@example.com", password: "password123" },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        {} as any,
      );

      // Verify the result
      expect(result).toBeNull();
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: "test@example.com" },
      });
      expect(compare).toHaveBeenCalledWith("password123", "hashed-password");
    });

    test("should return null when password is invalid", async () => {
      // Mock database connection test
      (prisma.user.count as jest.Mock).mockResolvedValue(1);

      // Mock user found
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: "user-id",
        email: "test@example.com",
        name: "Test User",
        role: "user",
        isActive: true,
        password: "hashed-password",
      });

      // Mock password comparison to fail
      (compare as jest.Mock).mockResolvedValue(false);

      // Call authorize with invalid password
      const result = await authorize?.(
        { email: "test@example.com", password: "wrong-password" },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        {} as any,
      );

      // Verify the result
      expect(result).toBeNull();
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: "test@example.com" },
      });
      expect(compare).toHaveBeenCalledWith("wrong-password", "hashed-password");
    });

    test("should return user when credentials are valid", async () => {
      // Mock database connection test
      (prisma.user.count as jest.Mock).mockResolvedValue(1);

      // Mock user found
      const mockUser = {
        id: "user-id",
        email: "test@example.com",
        name: "Test User",
        role: "user",
        isActive: true,
        password: "hashed-password",
      };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      // Mock password comparison to succeed
      (compare as jest.Mock).mockResolvedValue(true);

      // Call authorize with valid credentials
      const result = await authorize?.(
        { email: "test@example.com", password: "password123" },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        {} as any,
      );

      // Verify the result
      expect(result).toEqual({
        id: "user-id",
        name: "Test User",
        email: "test@example.com",
        role: "user",
        isActive: true,
      });
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: "test@example.com" },
      });
      expect(compare).toHaveBeenCalledWith("password123", "hashed-password");
    });

    test("should handle database errors gracefully", async () => {
      // Mock database connection test to fail
      (prisma.user.count as jest.Mock).mockRejectedValue(
        new Error("Database error"),
      );

      // Call authorize with valid credentials
      const result = await authorize?.(
        { email: "test@example.com", password: "password123" },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        {} as any,
      );

      // Verify the result
      expect(result).toBeNull();
      expect(prisma.user.count).toHaveBeenCalled();
      expect(prisma.user.findUnique).not.toHaveBeenCalled();
    });
  });

  describe("Session Callback", () => {
    test("should add user data to session", async () => {
      // Skip if callbacks are not defined
      if (!authOptions.callbacks?.session) {
        return;
      }

      // Mock user data
      const mockUser = {
        id: "user-id",
        role: "admin",
        isActive: true,
      };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      // Create mock session and token
      const mockSession = {
        user: {
          name: "Test User",
          email: "test@example.com",
        },
        expires: new Date().toISOString(),
      } as Session;
      const mockToken = {
        sub: "user-id",
      };

      // Call the session callback
      // @ts-expect-error - We're testing the implementation, not the types
      const result = await authOptions.callbacks.session({
        session: mockSession,
        token: mockToken,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        user: undefined as any,
      });

      // Verify the result
      expect(result.user).toEqual({
        ...mockSession.user,
        id: "user-id",
        role: "admin",
        isActive: true,
      });
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: "user-id" },
        select: { id: true, role: true, isActive: true },
      });
    });

    test("should use default values when user not found", async () => {
      // Skip if callbacks are not defined
      if (!authOptions.callbacks?.session) {
        return;
      }

      // Mock user not found
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      // Create mock session and token
      const mockSession = {
        user: {
          name: "Test User",
          email: "test@example.com",
        },
        expires: new Date().toISOString(),
      } as Session;
      const mockToken = {
        sub: "user-id",
      };

      // Call the session callback
      // @ts-expect-error - We're testing the implementation, not the types
      const result = await authOptions.callbacks.session({
        session: mockSession,
        token: mockToken,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        user: undefined as any,
      });

      // Verify the result
      expect(result.user).toEqual({
        ...mockSession.user,
        id: "user-id",
        role: "user", // Default role
        isActive: true, // Default isActive
      });
    });
  });

  describe("JWT Callback", () => {
    test("should return token unchanged", async () => {
      // Skip if callbacks are not defined
      if (!authOptions.callbacks?.jwt) {
        return;
      }

      // Create mock token
      const mockToken = {
        sub: "user-id",
        name: "Test User",
        email: "test@example.com",
      };

      // Call the jwt callback
      const result = await authOptions.callbacks.jwt({
        token: mockToken,
        // The following parameters are required by the type but not used in our implementation
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        user: undefined as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        account: undefined as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        profile: undefined as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        isNewUser: undefined as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        trigger: undefined as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        session: undefined as any,
      });

      // Verify the result
      expect(result).toEqual(mockToken);
    });
  });
});
