"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Resource, OperatingHours } from "@/interfaces/resource";
import { FileUpload } from "@/components/ui/file-upload";

export default function ResourceEditPage({
  params,
}: {
  params: { id: string };
}) {
  const [resource, setResource] = useState<Resource | null>(null);
  const [editedResource, setEditedResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Use refs to store image URLs
  const profilePhotoUrlRef = useRef<string | null>(null);
  const bannerImageUrlRef = useRef<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Define fetchResource inside useEffect to avoid dependency issues
    const fetchResource = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/v1/admin/resources/${params.id}`);

        if (!response.ok) {
          throw new Error("Failed to fetch resource");
        }

        const data = await response.json();
        console.log("Admin resource data:", data);
        console.log("Profile photo exists:", !!data.profilePhoto);
        console.log("Banner image exists:", !!data.bannerImage);
        setResource(data);
        setEditedResource(data);
        setError(null);
      } catch (err) {
        setError("Error loading resource. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchResource();
  }, [params.id]);

  // Define a type for the possible values that can be passed to handleInputChange
  type ResourceFieldValue =
    | string
    | string[]
    | boolean
    | { [key: string]: string | object } // Allow nested objects
    | Record<string, string | object> // Allow complex nested objects like operatingHours
    | Buffer
    | null
    | undefined;

  const handleInputChange = (field: string, value: ResourceFieldValue) => {
    if (!editedResource) return;

    console.log(
      `handleInputChange field: ${field}, value type: ${typeof value}`,
    );
    if (field === "profilePhoto" || field === "bannerImage") {
      console.log(
        `Image data: ${typeof value === "string" ? value.substring(0, 50) + "..." : "null"}`,
      );
    }
    // Create a copy of the edited resource
    const updatedResource = { ...editedResource };

    // Use type assertion with unknown as intermediate step for safer casting
    (updatedResource as unknown as Record<string, ResourceFieldValue>)[field] =
      value;

    console.log(`Updated ${field} in resource:`, !!value);

    // Special handling for image URLs to ensure they're persisted
    if (field === "profilePhotoUrl") {
      console.log("Setting profilePhotoUrl to:", value);
      updatedResource.profilePhotoUrl =
        typeof value === "string" ? value : undefined;
    }

    if (field === "bannerImageUrl") {
      console.log("Setting bannerImageUrl to:", value);
      updatedResource.bannerImageUrl =
        typeof value === "string" ? value : undefined;
    }

    // Update the state
    setEditedResource(updatedResource);
    setIsEditing(true);
  };

  const handleCategoryChange = (value: string) => {
    if (!editedResource) return;

    // Split by commas and trim whitespace
    const categories = value.split(",").map((cat) => cat.trim());

    setEditedResource({
      ...editedResource,
      category: categories,
    });
    setIsEditing(true);
  };
  const handleSave = async () => {
    if (!editedResource) return;

    try {
      setIsSaving(true);

      // Log the state before saving
      console.log("editedResource before save - raw:", editedResource);
      console.log("Profile photo type:", typeof editedResource?.profilePhoto);
      console.log(
        "Profile photo length:",
        editedResource?.profilePhoto?.length,
      );
      console.log("Banner image type:", typeof editedResource?.bannerImage);
      console.log("Banner image length:", editedResource?.bannerImage?.length);
      console.log("Profile photo URL:", editedResource?.profilePhotoUrl);
      console.log("Banner image URL:", editedResource?.bannerImageUrl);

      // Create a new object with only the fields we want to update
      const resourceToUpdate: Partial<Resource> = {
        id: editedResource.id,
        name: editedResource.name,
        description: editedResource.description,
        category: editedResource.category,
        contact: editedResource.contact,
        address: editedResource.address,
        operatingHours: editedResource.operatingHours,
        verified: editedResource.verified,
        profilePhotoType: editedResource.profilePhotoType,
        bannerImageType: editedResource.bannerImageType,
        profilePhotoUrl: profilePhotoUrlRef.current || undefined,
        bannerImageUrl: bannerImageUrlRef.current || undefined,
      };

      console.log(
        "Using profilePhotoUrl from ref:",
        profilePhotoUrlRef.current,
      );
      console.log("Using bannerImageUrl from ref:", bannerImageUrlRef.current);

      // Add the image data if it exists
      if (editedResource.profilePhoto) {
        resourceToUpdate.profilePhoto = editedResource.profilePhoto;
      }

      if (editedResource.bannerImage) {
        resourceToUpdate.bannerImage = editedResource.bannerImage;
      }

      // Log the resource after preparation
      console.log("resourceToUpdate - raw:", resourceToUpdate);
      console.log("Profile photo included:", !!resourceToUpdate.profilePhoto);
      console.log("Banner image included:", !!resourceToUpdate.bannerImage);
      console.log(
        "Profile photo URL included:",
        !!resourceToUpdate.profilePhotoUrl,
      );
      console.log(
        "Banner image URL included:",
        !!resourceToUpdate.bannerImageUrl,
      );
      console.log("Profile photo URL:", resourceToUpdate.profilePhotoUrl);
      console.log("Banner image URL:", resourceToUpdate.bannerImageUrl);

      // Check what happens during JSON serialization
      const jsonString = JSON.stringify(resourceToUpdate);
      console.log("JSON string length:", jsonString.length);
      console.log(
        "JSON string contains profilePhoto:",
        jsonString.includes("profilePhoto"),
      );
      console.log(
        "JSON string contains bannerImage:",
        jsonString.includes("bannerImage"),
      );

      const response = await fetch(`/api/v1/admin/resources/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: jsonString,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update resource");
      }

      const updatedResource = await response.json();
      setResource(updatedResource);
      setEditedResource(updatedResource);
      setIsEditing(false);
      setError(null);
    } catch (err) {
      setError("Error updating resource. Please try again.");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedResource(resource);
    setIsEditing(false);
    setError(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-gray-300">Loading...</div>
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div className="bg-red-900 p-4 mb-4 text-white rounded">
        {error || "Resource not found"}
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Edit Resource</h2>
        <div className="flex space-x-2">
          {isEditing && (
            <>
              <Button
                variant="outline"
                className="bg-green-700 hover:bg-green-800 text-white border-0"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                variant="outline"
                className="bg-gray-700 hover:bg-gray-800 text-white border-0"
                onClick={handleCancel}
                disabled={isSaving}
              >
                Cancel
              </Button>
            </>
          )}
          <Button
            variant="outline"
            className="bg-transparent border-gray-500 text-gray-300 hover:bg-gray-700"
            onClick={() => router.push("/admin/resources")}
          >
            Back to Resources
          </Button>
        </div>
      </div>

      <div className="bg-gray-800 shadow-md rounded-lg overflow-hidden p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">
              Basic Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded p-2"
                  value={editedResource?.name || ""}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Description
                </label>
                <textarea
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded p-2 h-32"
                  value={editedResource?.description || ""}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Categories (comma separated)
                </label>
                <input
                  type="text"
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded p-2"
                  value={editedResource?.category.join(", ") || ""}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                />
              </div>
              <div className="flex items-center">
                <label className="flex items-center cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={editedResource?.verified || false}
                      onChange={(e) => handleInputChange("verified", e.target.checked)}
                    />
                    <div className={`block w-14 h-8 rounded-full ${
                      editedResource?.verified ? "bg-green-600" : "bg-gray-600"
                    }`}></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${
                      editedResource?.verified ? "transform translate-x-6" : ""
                    }`}></div>
                  </div>
                  <div className="ml-3 text-gray-300 font-medium">
                    Verified Listing
                  </div>
                </label>
              </div>
              <FileUpload
                label="Profile Photo"
                type="profile"
                onUploadComplete={(imageData) => {
                  console.log(
                    "Profile Photo upload complete, file path:",
                    imageData.filePath,
                  );
                  if (imageData.filePath) {
                    // Store the URL in the ref
                    profilePhotoUrlRef.current = imageData.filePath;
                    console.log(
                      "Stored profilePhotoUrl in ref:",
                      profilePhotoUrlRef.current,
                    );

                    // Also update the state for UI rendering
                    handleInputChange("profilePhotoUrl", imageData.filePath);
                    handleInputChange("profilePhotoType", imageData.mimeType);
                  }
                }}
                currentImage={editedResource?.profilePhotoUrl || ""}
                className="mb-4"
              />

              <FileUpload
                label="Banner Image"
                type="banner"
                onUploadComplete={(imageData) => {
                  console.log(
                    "Banner Image upload complete, file path:",
                    imageData.filePath,
                  );
                  if (imageData.filePath) {
                    // Store the URL in the ref
                    bannerImageUrlRef.current = imageData.filePath;
                    console.log(
                      "Stored bannerImageUrl in ref:",
                      bannerImageUrlRef.current,
                    );

                    // Also update the state for UI rendering
                    handleInputChange("bannerImageUrl", imageData.filePath);
                    handleInputChange("bannerImageType", imageData.mimeType);
                  }
                }}
                currentImage={editedResource?.bannerImageUrl || ""}
                className="mb-4"
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-4">
              Contact Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Phone
                </label>
                <input
                  type="text"
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded p-2"
                  value={editedResource?.contact.phone || ""}
                  onChange={(e) =>
                    handleInputChange("contact", {
                      ...editedResource?.contact,
                      phone: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded p-2"
                  value={editedResource?.contact.email || ""}
                  onChange={(e) =>
                    handleInputChange("contact", {
                      ...editedResource?.contact,
                      email: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Website
                </label>
                <input
                  type="text"
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded p-2"
                  value={editedResource?.contact.website || ""}
                  onChange={(e) =>
                    handleInputChange("contact", {
                      ...editedResource?.contact,
                      website: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-semibold text-white mb-4">Address</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Street
              </label>
              <input
                type="text"
                className="w-full bg-gray-700 text-white border border-gray-600 rounded p-2"
                value={editedResource?.address.street || ""}
                onChange={(e) =>
                  handleInputChange("address", {
                    ...editedResource?.address,
                    street: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                City
              </label>
              <input
                type="text"
                className="w-full bg-gray-700 text-white border border-gray-600 rounded p-2"
                value={editedResource?.address.city || ""}
                onChange={(e) =>
                  handleInputChange("address", {
                    ...editedResource?.address,
                    city: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                State
              </label>
              <input
                type="text"
                className="w-full bg-gray-700 text-white border border-gray-600 rounded p-2"
                value={editedResource?.address.state || ""}
                onChange={(e) =>
                  handleInputChange("address", {
                    ...editedResource?.address,
                    state: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Zip Code
              </label>
              <input
                type="text"
                className="w-full bg-gray-700 text-white border border-gray-600 rounded p-2"
                value={editedResource?.address.zip || ""}
                onChange={(e) =>
                  handleInputChange("address", {
                    ...editedResource?.address,
                    zip: e.target.value,
                  })
                }
              />
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Operating Hours
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(
              [
                "monday",
                "tuesday",
                "wednesday",
                "thursday",
                "friday",
                "saturday",
                "sunday",
              ] as Array<keyof OperatingHours>
            ).map((day) => (
              <div key={day} className="bg-gray-700 p-3 rounded">
                <label className="block text-sm font-medium text-gray-300 mb-2 capitalize">
                  {day}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">
                      Open
                    </label>
                    <input
                      type="time"
                      className="w-full bg-gray-600 text-white border border-gray-600 rounded p-1"
                      value={editedResource?.operatingHours?.[day]?.open || ""}
                      onChange={(e) => {
                        if (!editedResource) return;
                        const updatedHours = {
                          ...editedResource.operatingHours,
                        };
                        updatedHours[day] = {
                          ...updatedHours[day],
                          open: e.target.value,
                        };
                        handleInputChange("operatingHours", updatedHours);
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">
                      Close
                    </label>
                    <input
                      type="time"
                      className="w-full bg-gray-600 text-white border border-gray-600 rounded p-1"
                      value={editedResource?.operatingHours?.[day]?.close || ""}
                      onChange={(e) => {
                        if (!editedResource) return;
                        const updatedHours = {
                          ...editedResource.operatingHours,
                        };
                        updatedHours[day] = {
                          ...updatedHours[day],
                          close: e.target.value,
                        };
                        handleInputChange("operatingHours", updatedHours);
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {isEditing && (
          <div className="mt-6 bg-yellow-900 p-3 rounded text-yellow-200 text-sm">
            <p>
              * Changes will not be applied until you click &quot;Save
              Changes&quot;
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
