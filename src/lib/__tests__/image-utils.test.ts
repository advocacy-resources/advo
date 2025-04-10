/**
 * @jest-environment jsdom
 */

import {
  bufferToDataUrl,
  dataUrlToBuffer,
  processResourceImages,
  fileToBuffer,
} from "../image-utils";

describe("Image Utility Functions", () => {
  describe("bufferToDataUrl", () => {
    test("should convert a buffer to a data URL with default mime type", () => {
      // Create a simple buffer
      const buffer = Buffer.from("test image data");

      // Convert to data URL
      const dataUrl = bufferToDataUrl(buffer);

      // Check the result
      expect(dataUrl).toMatch(/^data:image\/jpeg;base64,/);

      // Decode the base64 part to verify the content
      const base64Data = dataUrl.split(",")[1];
      const decodedData = Buffer.from(base64Data, "base64").toString();
      expect(decodedData).toBe("test image data");
    });

    test("should convert a buffer to a data URL with specified mime type", () => {
      // Create a simple buffer
      const buffer = Buffer.from("test png data");

      // Convert to data URL with PNG mime type
      const dataUrl = bufferToDataUrl(buffer, "image/png");

      // Check the result
      expect(dataUrl).toMatch(/^data:image\/png;base64,/);

      // Decode the base64 part to verify the content
      const base64Data = dataUrl.split(",")[1];
      const decodedData = Buffer.from(base64Data, "base64").toString();
      expect(decodedData).toBe("test png data");
    });
  });

  describe("dataUrlToBuffer", () => {
    test("should convert a data URL to a buffer", () => {
      // Create a data URL
      const dataUrl = "data:image/jpeg;base64,dGVzdCBpbWFnZSBkYXRh";

      // Convert to buffer
      const buffer = dataUrlToBuffer(dataUrl);

      // Check the result
      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer?.toString()).toBe("test image data");
    });

    test("should return null for non-data URLs", () => {
      // Test with a regular string
      const result = dataUrlToBuffer("not a data URL");

      // Check the result
      expect(result).toBeNull();
    });
  });

  describe("processResourceImages", () => {
    test("should return null if resource is null", () => {
      const result = processResourceImages(null);
      expect(result).toBeNull();
    });

    test("should process profile photo as binary data", () => {
      // Create a mock resource with binary profile photo
      const resource = {
        id: "123",
        name: "Test Resource",
        profilePhoto: Buffer.from("test profile photo"),
        profilePhotoType: "image/jpeg",
      };

      // Process the resource
      const processed = processResourceImages(resource);

      // Check the result
      expect(processed.profilePhoto).toMatch(/^data:image\/jpeg;base64,/);

      // Decode the base64 part to verify the content
      const base64Data = processed.profilePhoto.split(",")[1];
      const decodedData = Buffer.from(base64Data, "base64").toString();
      expect(decodedData).toBe("test profile photo");
    });

    test("should keep profile photo as is if it's already a data URL", () => {
      // Create a mock resource with data URL profile photo
      const dataUrl = "data:image/jpeg;base64,dGVzdCBwcm9maWxlIHBob3Rv";
      const resource = {
        id: "123",
        name: "Test Resource",
        profilePhoto: dataUrl,
      };

      // Process the resource
      const processed = processResourceImages(resource);

      // Check the result
      expect(processed.profilePhoto).toBe(dataUrl);
    });

    test("should keep profile photo as is if it's a file path", () => {
      // Create a mock resource with file path profile photo
      const filePath = "/uploads/test-image.jpg";
      const resource = {
        id: "123",
        name: "Test Resource",
        profilePhoto: filePath,
      };

      // Process the resource
      const processed = processResourceImages(resource);

      // Check the result
      expect(processed.profilePhoto).toBe(filePath);
    });

    test("should process banner image as binary data", () => {
      // Create a mock resource with binary banner image
      const resource = {
        id: "123",
        name: "Test Resource",
        bannerImage: Buffer.from("test banner image"),
        bannerImageType: "image/png",
      };

      // Process the resource
      const processed = processResourceImages(resource);

      // Check the result
      expect(processed.bannerImage).toMatch(/^data:image\/png;base64,/);

      // Decode the base64 part to verify the content
      const base64Data = processed.bannerImage.split(",")[1];
      const decodedData = Buffer.from(base64Data, "base64").toString();
      expect(decodedData).toBe("test banner image");
    });

    test("should preserve profilePhotoUrl and bannerImageUrl", () => {
      // Create a mock resource with URLs
      const resource = {
        id: "123",
        name: "Test Resource",
        profilePhotoUrl: "/uploads/profile.jpg",
        bannerImageUrl: "/uploads/banner.png",
      };

      // Process the resource
      const processed = processResourceImages(resource);

      // Check the result
      expect(processed.profilePhotoUrl).toBe("/uploads/profile.jpg");
      expect(processed.bannerImageUrl).toBe("/uploads/banner.png");
    });
  });

  describe("fileToBuffer", () => {
    test("should convert a File to a Buffer", async () => {
      // Create a simple mock for the File object
      const fileData = "test file content";
      const inputBuffer = Buffer.from(fileData);

      // Create a mock file with arrayBuffer method that returns a buffer
      const file = {
        arrayBuffer: jest.fn().mockResolvedValue(inputBuffer),
      } as unknown as File;

      // Convert to buffer
      const resultBuffer = await fileToBuffer(file);

      // Check the result
      expect(resultBuffer).toBeInstanceOf(Buffer);
      expect(resultBuffer.toString()).toBe(fileData);
      expect(file.arrayBuffer).toHaveBeenCalled();
    });
  });
});
