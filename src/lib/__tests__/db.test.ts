/**
 * @jest-environment node
 */

// Mock the mongodb module
jest.mock("mongodb", () => {
  // Create mock objects
  const mockDb = jest.fn().mockReturnThis();
  const mockClient = {
    db: jest.fn().mockReturnValue(mockDb),
  };

  // Create a mock constructor that returns the mock client
  const MockMongoClient = jest.fn().mockImplementation(() => mockClient);

  // Add the connect method to the constructor
  (MockMongoClient as any).connect = jest.fn().mockResolvedValue(mockClient);

  return {
    MongoClient: MockMongoClient,
    ServerApiVersion: { v1: "1" },
  };
});

// Import the mocked module
import { MongoClient } from "mongodb";

// Store the original environment variables
const originalEnv = process.env;

describe("Database Connection", () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Reset environment variables before each test
    jest.resetModules();
    process.env = { ...originalEnv };
    process.env.MONGODB_URI = "mongodb://localhost:27017";
  });

  afterEach(() => {
    // Restore environment variables after each test
    process.env = originalEnv;
  });

  test("should throw error when MONGODB_URI is missing", () => {
    // Remove MONGODB_URI from environment
    delete process.env.MONGODB_URI;

    // Import should throw an error
    expect(() => {
      jest.isolateModules(() => {
        // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
        require("../db");
      });
    }).toThrow("Invalid/Missing environment variable: 'MONGODB_URI'");
  });

  test("should create MongoDB client with correct URI", () => {
    // Import the module
    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
      require("../db");
    });

    // Verify MongoClient constructor was called
    expect(MongoClient).toHaveBeenCalledTimes(1);

    // Get the first call arguments
    const callArgs = (MongoClient as unknown as jest.Mock).mock.calls[0];

    // Verify the URI
    expect(callArgs[0]).toBe("mongodb://localhost:27017");

    // Verify the options object has serverApi
    expect(callArgs[1]).toHaveProperty("serverApi");
  });

  test("should use development database in development environment", () => {
    // Mock NODE_ENV as development
    Object.defineProperty(process.env, "NODE_ENV", {
      value: "development",
      configurable: true,
    });

    // Import the module
    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
      const { db } = require("../db");

      // Verify the correct database name is used
      expect(db.client.db).toHaveBeenCalledWith("advo-dev");
    });
  });

  test("should use production database in production environment", () => {
    // Mock NODE_ENV as production
    Object.defineProperty(process.env, "NODE_ENV", {
      value: "production",
      configurable: true,
    });

    // Import the module
    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
      const { db } = require("../db");

      // Verify the correct database name is used
      expect(db.client.db).toHaveBeenCalledWith("advo-prod");
    });
  });

  test("should reuse the same client instance in development", () => {
    // Mock NODE_ENV as development
    Object.defineProperty(process.env, "NODE_ENV", {
      value: "development",
      configurable: true,
    });

    // Import the module twice
    jest.isolateModules(() => {
      // First import
      // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
      const { default: client1 } = require("../db");

      // Second import
      // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
      const { default: client2 } = require("../db");

      // Verify the same client instance is returned
      expect(client1).toBe(client2);

      // Verify MongoClient constructor was called only once
      expect(MongoClient).toHaveBeenCalledTimes(1);
    });
  });
});
