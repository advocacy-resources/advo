"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Resource, OperatingHours } from "@/interfaces/resource";
import Logo from "../../assets/myAdvo-peachWhite.svg";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { FileUpload } from "@/components/ui/file-upload";

interface ResourceCreateModalProps {
  isOpen: boolean;
  onClose: (value: boolean) => void;
  onResourceCreated?: (createdResource: Resource) => void;
}

const ResourceCreateModal: React.FC<ResourceCreateModalProps> = ({
  isOpen,
  onClose,
  onResourceCreated,
}) => {
  const [isEditing, setIsEditing] = useState(true); // Start in editing mode
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize a new empty resource
  const [newResource, setNewResource] = useState<Partial<Resource>>({
    name: "",
    description: "",
    category: [],
    profilePhoto: "",
    bannerImage: "",
    contact: {
      phone: "",
      email: "",
      website: "",
    },
    address: {
      street: "",
      city: "",
      state: "",
      zip: "",
    },
    operatingHours: {
      monday: { open: "09:00", close: "17:00" },
      tuesday: { open: "09:00", close: "17:00" },
      wednesday: { open: "09:00", close: "17:00" },
      thursday: { open: "09:00", close: "17:00" },
      friday: { open: "09:00", close: "17:00" },
      saturday: { open: "09:00", close: "17:00" },
      sunday: { open: "09:00", close: "17:00" },
    },
  });

  const handleInputChange = (field: string, value: any) => {
    console.log(
      `handleInputChange field: ${field}, value type: ${typeof value}`,
    );
    if (field === "profilePhotoUrl" || field === "bannerImageUrl") {
      console.log(`Setting ${field} to:`, value);
    }

    setNewResource({
      ...newResource,
      [field]: value,
    });
  };

  const handleCategoryChange = (value: string) => {
    // Split by commas and trim whitespace
    const categories = value.split(",").map((cat) => cat.trim());

    setNewResource({
      ...newResource,
      category: categories,
    });
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);

      // Validate required fields
      if (!newResource.name || !newResource.description) {
        setError("Name and description are required");
        setIsSaving(false);
        return;
      }

      // Log the resource before saving
      console.log(
        "Creating resource with profile photo:",
        !!newResource.profilePhoto,
      );
      console.log(
        "Creating resource with banner image:",
        !!newResource.bannerImage,
      );

      // Create a new object with only the fields we want to create
      const resourceToCreate: any = {
        name: newResource.name,
        description: newResource.description,
        category: newResource.category,
        contact: newResource.contact,
        address: newResource.address,
        operatingHours: newResource.operatingHours,
        profilePhotoType: newResource.profilePhotoType,
        bannerImageType: newResource.bannerImageType,
        profilePhotoUrl: newResource.profilePhotoUrl,
        bannerImageUrl: newResource.bannerImageUrl,
      };

      // Add the image data if it exists
      if (newResource.profilePhoto) {
        resourceToCreate.profilePhoto = newResource.profilePhoto;
      }

      if (newResource.bannerImage) {
        resourceToCreate.bannerImage = newResource.bannerImage;
      }

      const response = await fetch(`/api/v1/admin/resources`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(resourceToCreate),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create resource");
      }

      const createdResource = await response.json();

      // Call the callback with the created resource
      if (onResourceCreated) {
        onResourceCreated(createdResource);
      }

      // Reset form and close modal
      resetForm();
      onClose(false);
    } catch (err) {
      setError("Error creating resource. Please try again.");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setNewResource({
      name: "",
      description: "",
      category: [],
      profilePhoto: "",
      bannerImage: "",
      contact: {
        phone: "",
        email: "",
        website: "",
      },
      address: {
        street: "",
        city: "",
        state: "",
        zip: "",
      },
      operatingHours: {
        monday: { open: "09:00", close: "17:00" },
        tuesday: { open: "09:00", close: "17:00" },
        wednesday: { open: "09:00", close: "17:00" },
        thursday: { open: "09:00", close: "17:00" },
        friday: { open: "09:00", close: "17:00" },
        saturday: { open: "09:00", close: "17:00" },
        sunday: { open: "09:00", close: "17:00" },
      },
    });
    setError(null);
  };

  // Handle modal close
  const handleModalClose = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    onClose(open);
  };

  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleModalClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Logo */}
        <div className="flex justify-center mb-4">
          <Image
            src={Logo}
            alt="The myAdvo Logo"
            width={120}
            height={40}
            className="object-contain"
          />
        </div>
        <DialogHeader>
          <DialogTitle className="text-xl text-white">
            {isEditing ? (
              <input
                type="text"
                className="w-full bg-gray-700 text-white border border-gray-600 rounded p-2"
                value={newResource.name || ""}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Resource Name"
                required
              />
            ) : (
              newResource.name || "New Resource"
            )}
          </DialogTitle>
          <DialogDescription className="text-gray-300 mt-2">
            {isEditing ? "Create New Resource" : "Resource Details"}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-red-900 p-4 mb-4 text-white rounded">{error}</div>
        )}

        {/* Images */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          {/* Banner Image */}
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-2">
              Banner Image
            </h3>
            {isEditing ? (
              <FileUpload
                label="Banner Image"
                type="banner"
                onUploadComplete={(imageData) => {
                  if (imageData.filePath) {
                    handleInputChange("bannerImageUrl", imageData.filePath);
                    handleInputChange("bannerImageType", imageData.mimeType);
                  }
                }}
                currentImage={newResource.bannerImageUrl || ""}
              />
            ) : (
              newResource.bannerImageUrl && (
                <div className="w-full h-40 overflow-hidden rounded-md">
                  <Image
                    src={newResource.bannerImageUrl}
                    alt="Banner"
                    className="object-cover"
                    width={300}
                    height={160}
                  />
                </div>
              )
            )}
          </div>

          {/* Profile Image */}
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-2">
              Profile Image
            </h3>
            {isEditing ? (
              <FileUpload
                label="Profile Image"
                type="profile"
                onUploadComplete={(imageData) => {
                  if (imageData.filePath) {
                    handleInputChange("profilePhotoUrl", imageData.filePath);
                    handleInputChange("profilePhotoType", imageData.mimeType);
                  }
                }}
                currentImage={newResource.profilePhotoUrl || ""}
              />
            ) : (
              newResource.profilePhotoUrl && (
                <div className="w-full h-40 overflow-hidden rounded-md">
                  <Image
                    src={newResource.profilePhotoUrl}
                    alt="Profile"
                    className="object-cover"
                    width={300}
                    height={160}
                  />
                </div>
              )
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
          {/* Left Column */}
          <div className="space-y-4">
            {/* Basic Info */}
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">
                Description
              </h3>
              {isEditing ? (
                <textarea
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded p-2 h-32"
                  value={newResource.description || ""}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  required
                />
              ) : (
                <p className="text-white text-sm">{newResource.description}</p>
              )}
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">
                Categories
              </h3>
              {isEditing ? (
                <input
                  type="text"
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded p-2"
                  value={newResource.category?.join(", ") || ""}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                />
              ) : (
                <div className="flex flex-wrap gap-2">
                  {newResource.category?.map((cat, index) => (
                    <span
                      key={index}
                      className="bg-gray-700 text-white text-xs px-2 py-1 rounded-full"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">
                Contact Information
              </h3>
              {isEditing ? (
                <div className="space-y-2 text-sm text-white">
                  <div className="grid grid-cols-2 gap-x-4 items-center">
                    <p className="font-medium">Phone:</p>
                    <input
                      type="text"
                      className="bg-gray-700 text-white border border-gray-600 rounded p-1"
                      value={newResource.contact?.phone || ""}
                      onChange={(e) =>
                        handleInputChange("contact", {
                          ...newResource.contact,
                          phone: e.target.value,
                        })
                      }
                      placeholder="N/A"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 items-center">
                    <p className="font-medium">Email:</p>
                    <input
                      type="email"
                      className="bg-gray-700 text-white border border-gray-600 rounded p-1"
                      value={newResource.contact?.email || ""}
                      onChange={(e) =>
                        handleInputChange("contact", {
                          ...newResource.contact,
                          email: e.target.value,
                        })
                      }
                      placeholder="N/A"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 items-center">
                    <p className="font-medium">Website:</p>
                    <input
                      type="text"
                      className="bg-gray-700 text-white border border-gray-600 rounded p-1"
                      value={newResource.contact?.website || ""}
                      onChange={(e) =>
                        handleInputChange("contact", {
                          ...newResource.contact,
                          website: e.target.value,
                        })
                      }
                      placeholder="N/A"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-1 text-sm text-white">
                  <p>Phone: {newResource.contact?.phone || "N/A"}</p>
                  <p>Email: {newResource.contact?.email || "N/A"}</p>
                  <p>
                    Website:{" "}
                    {newResource.contact?.website ? (
                      <a
                        href={newResource.contact.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline"
                      >
                        {newResource.contact.website}
                      </a>
                    ) : (
                      "N/A"
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Address */}
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">
                Address
              </h3>
              {isEditing ? (
                <div className="space-y-2 text-sm text-white">
                  <div>
                    <p className="font-medium mb-1">Street:</p>
                    <input
                      type="text"
                      className="w-full bg-gray-700 text-white border border-gray-600 rounded p-1"
                      value={newResource.address?.street || ""}
                      onChange={(e) =>
                        handleInputChange("address", {
                          ...newResource.address,
                          street: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <p className="font-medium mb-1">City:</p>
                      <input
                        type="text"
                        className="w-full bg-gray-700 text-white border border-gray-600 rounded p-1"
                        value={newResource.address?.city || ""}
                        onChange={(e) =>
                          handleInputChange("address", {
                            ...newResource.address,
                            city: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <p className="font-medium mb-1">State:</p>
                      <input
                        type="text"
                        className="w-full bg-gray-700 text-white border border-gray-600 rounded p-1"
                        value={newResource.address?.state || ""}
                        onChange={(e) =>
                          handleInputChange("address", {
                            ...newResource.address,
                            state: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <p className="font-medium mb-1">Zip:</p>
                      <input
                        type="text"
                        className="w-full bg-gray-700 text-white border border-gray-600 rounded p-1"
                        value={newResource.address?.zip || ""}
                        onChange={(e) =>
                          handleInputChange("address", {
                            ...newResource.address,
                            zip: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-white">
                  <p>{newResource.address?.street}</p>
                  <p>
                    {newResource.address?.city}, {newResource.address?.state}{" "}
                    {newResource.address?.zip || ""}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Operating Hours - More compact */}
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-400 mb-1">
            Operating Hours
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-2">
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
              <div key={day} className="bg-gray-700 p-2 rounded">
                <label className="block text-xs font-medium text-gray-300 mb-1 capitalize">
                  {day}
                </label>
                <div className="grid grid-cols-2 gap-1">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">
                      Open
                    </label>
                    <input
                      type="time"
                      className="w-full bg-gray-600 text-white border border-gray-600 rounded p-1"
                      value={newResource.operatingHours?.[day]?.open || ""}
                      onChange={(e) => {
                        if (!newResource.operatingHours) return;
                        const updatedHours = { ...newResource.operatingHours };
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
                      value={newResource.operatingHours?.[day]?.close || ""}
                      onChange={(e) => {
                        if (!newResource.operatingHours) return;
                        const updatedHours = { ...newResource.operatingHours };
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

        <div className="mt-3 bg-blue-900 p-2 rounded text-blue-200 text-xs">
          <p>* Required fields</p>
        </div>

        <DialogFooter className="mt-4">
          <Button
            variant="outline"
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white border-0 rounded-full"
            onClick={() => handleModalClose(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            variant="outline"
            className="px-4 py-2 bg-green-700 hover:bg-green-800 text-white border-0 rounded-full"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? "Creating..." : "Create Resource"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ResourceCreateModal;
