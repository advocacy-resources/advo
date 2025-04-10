import { cn } from "../utils";

describe("cn utility function", () => {
  test("should merge class names correctly", () => {
    // Test with simple strings
    expect(cn("class1", "class2")).toBe("class1 class2");

    // Test with conditional classes
    expect(cn("class1", true && "class2", false && "class3")).toBe(
      "class1 class2",
    );

    // Test with Tailwind classes that might have conflicts
    expect(cn("p-4", "p-6")).toBe("p-6");

    // Test with complex Tailwind classes
    const result = cn("text-gray-500", "hover:text-gray-700", "md:text-lg", {
      "text-red-500": true,
      "text-blue-500": false,
    });

    // The cn function uses tailwind-merge which may reorder or combine classes
    // So we'll test that the result is a string and contains the expected classes
    expect(typeof result).toBe("string");

    // Since tailwind-merge might remove conflicting classes, we'll only check for
    // classes that shouldn't conflict
    expect(result).toContain("hover:text-gray-700");
    expect(result).toContain("md:text-lg");
    expect(result).toContain("text-red-500");
    expect(result).not.toContain("text-blue-500");
  });
});
