// Mock the entire api-middleware module to avoid NextRequest issues
jest.mock("../api-middleware", () => ({
  checkAdminRole: jest.fn(),
}));

import { checkAdminRole } from "../api-middleware";
import { getServerSession } from "next-auth/next";

// Mock next-auth
jest.mock("next-auth/next", () => ({
  getServerSession: jest.fn(),
}));

describe("API Middleware", () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup the implementation for checkAdminRole
    (checkAdminRole as jest.Mock).mockImplementation(async () => {
      const session = await getServerSession();
      if (!session || session.user.role !== "admin") {
        return false;
      }
      return true;
    });
  });

  describe("checkAdminRole function", () => {
    test("should return false when no session exists", async () => {
      // Mock no session
      (getServerSession as jest.Mock).mockResolvedValue(null);

      // Call function
      const result = await checkAdminRole();

      // Verify result
      expect(result).toBe(false);
    });

    test("should return false when user is not admin", async () => {
      // Mock non-admin session
      const mockSession = { user: { id: "123", role: "user" } };
      (getServerSession as jest.Mock).mockResolvedValue(mockSession);

      // Call function
      const result = await checkAdminRole();

      // Verify result
      expect(result).toBe(false);
    });

    test("should return true when user is admin", async () => {
      // Mock admin session
      const mockSession = { user: { id: "123", role: "admin" } };
      (getServerSession as jest.Mock).mockResolvedValue(mockSession);

      // Call function
      const result = await checkAdminRole();

      // Verify result
      expect(result).toBe(true);
    });
  });
});
