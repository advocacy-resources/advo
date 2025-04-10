"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface FileUploadProps {
  onUploadComplete: (imageData: { filePath: string; mimeType: string }) => void;
  label: string;
  currentImage?: string;
  type: "profile" | "banner";
  className?: string;
}

export function FileUpload({
  onUploadComplete,
  label,
  currentImage,
  type,
  className = "",
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Debug log for currentImage
  console.log(
    `FileUpload ${label} currentImage:`,
    currentImage ? "Present" : "Not present",
    typeof currentImage,
  );

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create a preview
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    // Upload the file
    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);

      // Use the consolidated image API endpoint
      formData.append("storage", "disk"); // Store on disk
      const response = await fetch("/api/v1/images", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to upload file");
      }

      const data = await response.json();
      console.log(`FileUpload ${label} received data from server:`, {
        filePath: data.filePath,
        mimeType: data.mimeType,
      });

      // Pass the file path instead of the image data
      onUploadComplete({
        filePath: data.filePath,
        mimeType: data.mimeType,
      });

      console.log(`FileUpload ${label} called onUploadComplete with file path`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An error occurred during upload",
      );
      setPreview(currentImage || null); // Revert to original image on error
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-400 mb-1">
        {label}
      </label>

      <div className="flex flex-col items-center space-y-4">
        {/* Preview area */}
        {preview && (
          <div className="relative w-full h-40 bg-gray-800 rounded-md overflow-hidden">
            <Image
              src={preview}
              alt="Preview"
              fill
              style={{ objectFit: "contain" }}
            />
          </div>
        )}

        {/* Upload button and hidden input */}
        <div className="flex items-center space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={triggerFileInput}
            disabled={isUploading}
            className="bg-gray-700 hover:bg-gray-600 text-white"
          >
            {isUploading
              ? "Uploading..."
              : preview
                ? "Change Image"
                : "Upload Image"}
          </Button>

          {preview && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                console.log(`${label} Remove button clicked`);
                setPreview(null);
                // Pass empty string for file path when removing
                onUploadComplete({ filePath: "", mimeType: "" });
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              className="bg-red-700 hover:bg-red-600 text-white"
            >
              Remove
            </Button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Error message */}
      {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
    </div>
  );
}
