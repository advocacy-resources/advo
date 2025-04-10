/**
 * @jest-environment jsdom
 */

// Mock next/font/local before importing anything else
jest.mock("next/font/local", () => {
  return jest.fn().mockImplementation((config) => {
    return {
      className: "mock-font-class",
      style: { fontFamily: "mock-font-family" },
      variable: config.variable,
      _config: config,
    };
  });
});

// Import after mocking
import { anonymousPro, univers } from "../fonts";
import localFont from "next/font/local";

describe("Font Configuration", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  test("anonymousPro should be configured correctly", () => {
    // Verify localFont was called
    expect(localFont).toHaveBeenCalled();

    // Get the configuration passed to localFont
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const config = (anonymousPro as any)._config;

    // Verify the font sources
    expect(config.src).toHaveLength(4);

    // Verify regular font
    expect(config.src).toContainEqual({
      path: expect.stringContaining("AnonymousPro-Regular"),
      weight: "400",
      style: "normal",
    });

    // Verify bold font
    expect(config.src).toContainEqual({
      path: expect.stringContaining("AnonymousPro-Bold"),
      weight: "700",
      style: "normal",
    });

    // Verify italic font
    expect(config.src).toContainEqual({
      path: expect.stringContaining("AnonymousPro-Italic"),
      weight: "400",
      style: "italic",
    });

    // Verify bold italic font
    expect(config.src).toContainEqual({
      path: expect.stringContaining("AnonymousPro-BoldItalic"),
      weight: "700",
      style: "italic",
    });

    // Verify CSS variable name
    expect(config.variable).toBe("--font-anonymous-pro");
  });

  test("univers should be configured correctly", () => {
    // Verify localFont was called
    expect(localFont).toHaveBeenCalled();

    // Get the configuration passed to localFont
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const config = (univers as any)._config;

    // Verify the font source
    expect(config.src).toBe("../../public/fonts/Univers/Univers-BlackExt.otf");

    // Verify CSS variable name
    expect(config.variable).toBe("--font-univers");
  });

  test("fonts should have the expected properties", () => {
    // Verify anonymousPro has expected properties
    expect(anonymousPro).toHaveProperty("className");
    expect(anonymousPro).toHaveProperty("style");
    expect(anonymousPro).toHaveProperty("variable");

    // Verify univers has expected properties
    expect(univers).toHaveProperty("className");
    expect(univers).toHaveProperty("style");
    expect(univers).toHaveProperty("variable");
  });
});
