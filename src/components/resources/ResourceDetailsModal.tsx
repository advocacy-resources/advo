"use client";

import React, { useState, useEffect } from "react";
import { Resource, OperatingHours } from "@/interfaces/resource";
import { BadgeCheck, XCircle } from "lucide-react";
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
import Image from "next/image";

interface ResourceDetailsModalProps {
  isOpen: boolean;
  onClose: (value: boolean) => void;
  resource: Resource | null;
  onResourceUpdate?: (updatedResource: Resource) => void;
}

const ResourceDetailsModal: React.FC<ResourceDetailsModalProps> = ({
  isOpen,
  onClose,
  resource,
  onResourceUpdate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedResource, setEditedResource] = useState<Resource | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (resource) {
      setEditedResource(JSON.parse(JSON.stringify(resource))); // Deep copy
    }
  }, [resource]);

  if (!resource || !editedResource) return null;
  // Format operating hours
  const formatHours = (hours: { open: string; close: string }) => {
    return `${hours.open} - ${hours.close}`;
  };

  const handleInputChange = (field: string, value: any) => {
    if (!editedResource) return;

    setEditedResource({
      ...editedResource,
      [field]: value,
    });
  };

  const handleCategoryChange = (value: string) => {
    if (!editedResource) return;

    // Split by commas and trim whitespace
    const categories = value.split(",").map((cat) => cat.trim());

    setEditedResource({
      ...editedResource,
      category: categories,
    });
  };

  const handleSave = async () => {
    if (!editedResource) return;

    try {
      setIsSaving(true);
      setError(null);

      // Ensure the verified field is included
      const resourceToUpdate = {
        ...editedResource,
        verified: editedResource.verified || false,
      };

      const response = await fetch(
        `/api/v1/admin/resources/${editedResource.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(resourceToUpdate),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update resource");
      }

      const updatedResource = await response.json();

      if (onResourceUpdate) {
        onResourceUpdate(updatedResource);
      }

      setIsEditing(false);
      setError(null);
    } catch (err) {
      setError("Error updating resource. Please try again.");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleEditMode = () => {
    if (isEditing && editedResource) {
      // Reset to original resource data if canceling edit
      setEditedResource(JSON.parse(JSON.stringify(resource)));
    }
    setIsEditing(!isEditing);
    setError(null);
  };

  // Handle modal close
  const handleModalClose = (open: boolean) => {
    // If the modal is being closed and we're in edit mode, reset to view mode
    if (!open && isEditing) {
      setIsEditing(false);
      setEditedResource(JSON.parse(JSON.stringify(resource))); // Reset to original data
      setError(null);
    }
    onClose(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleModalClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-xl text-white">
            {isEditing ? (
              <input
                type="text"
                className="w-full bg-gray-700 text-white border border-gray-600 rounded p-2"
                value={editedResource.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
              />
            ) : (
              resource.name
            )}
          </DialogTitle>
          <DialogDescription className="text-gray-300 mt-2">
            {isEditing ? "Edit Resource" : "Resource Details"}
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
                currentImage={editedResource.bannerImageUrl || ""}
              />
            ) : (
              resource.bannerImageUrl && (
                <div className="w-full h-40 overflow-hidden rounded-md">
                  <Image
                    src={resource.bannerImageUrl}
                    alt={`${resource.name} banner`}
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
                currentImage={editedResource.profilePhotoUrl || ""}
              />
            ) : (
              resource.profilePhotoUrl && (
                <div className="w-full h-40 overflow-hidden rounded-md">
                  <Image
                    src={resource.profilePhotoUrl}
                    alt={`${resource.name} profile`}
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
                  value={editedResource.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  required
                />
              ) : (
                <p className="text-white text-sm">{resource.description}</p>
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
                  value={editedResource.category.join(", ")}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                />
              ) : (
                <div className="flex flex-wrap gap-2">
                  {resource.category.map((cat, index) => (
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

            {/* Verification Status */}
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">
                Verification Status
              </h3>
              {isEditing ? (
                <div className="flex items-center">
                  <label className="flex items-center cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={editedResource?.verified || false}
                        onChange={(e) =>
                          handleInputChange("verified", e.target.checked)
                        }
                      />
                      <div
                        className={`block w-14 h-8 rounded-full ${
                          editedResource?.verified
                            ? "bg-green-600"
                            : "bg-gray-600"
                        }`}
                      ></div>
                      <div
                        className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${
                          editedResource?.verified
                            ? "transform translate-x-6"
                            : ""
                        }`}
                      ></div>
                    </div>
                    <div className="ml-3 text-gray-300 font-medium">
                      {editedResource?.verified ? "Verified" : "Not Verified"}
                    </div>
                  </label>
                </div>
              ) : (
                <div className="flex items-center">
                  {resource.verified ? (
                    <BadgeCheck className="h-5 w-5 text-green-500 mr-2" />
                  ) : (
                    <XCircle className="h-5 w-5 text-gray-500 mr-2" />
                  )}
                  <span className="text-white text-sm">
                    {resource.verified ? "Verified" : "Not Verified"}
                  </span>
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
                      value={editedResource.contact.phone || ""}
                      onChange={(e) =>
                        handleInputChange("contact", {
                          ...editedResource.contact,
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
                      value={editedResource.contact.email || ""}
                      onChange={(e) =>
                        handleInputChange("contact", {
                          ...editedResource.contact,
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
                      value={editedResource.contact.website || ""}
                      onChange={(e) =>
                        handleInputChange("contact", {
                          ...editedResource.contact,
                          website: e.target.value,
                        })
                      }
                      placeholder="N/A"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-1 text-sm text-white">
                  <p>Phone: {resource.contact.phone || "N/A"}</p>
                  <p>Email: {resource.contact.email || "N/A"}</p>
                  <p>
                    Website:{" "}
                    {resource.contact.website ? (
                      <a
                        href={resource.contact.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline"
                      >
                        {resource.contact.website}
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
                      value={editedResource.address.street || ""}
                      onChange={(e) =>
                        handleInputChange("address", {
                          ...editedResource.address,
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
                        value={editedResource.address.city || ""}
                        onChange={(e) =>
                          handleInputChange("address", {
                            ...editedResource.address,
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
                        value={editedResource.address.state || ""}
                        onChange={(e) =>
                          handleInputChange("address", {
                            ...editedResource.address,
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
                        value={editedResource.address.zip || ""}
                        onChange={(e) =>
                          handleInputChange("address", {
                            ...editedResource.address,
                            zip: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-white">
                  <p>{resource.address.street}</p>
                  <p>
                    {resource.address.city}, {resource.address.state}{" "}
                    {resource.address.zip || ""}
                  </p>
                </div>
              )}
            </div>

            {/* Operating Hours */}
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">
                Operating Hours
              </h3>
              {isEditing ? (
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-white">
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
                    <React.Fragment key={day}>
                      <p className="font-medium capitalize">{day}:</p>
                      <div className="flex space-x-2 items-center">
                        <input
                          type="time"
                          className="bg-gray-700 text-white border border-gray-600 rounded p-1 w-24"
                          value={
                            editedResource.operatingHours?.[day]?.open || ""
                          }
                          onChange={(e) => {
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
                        <span>-</span>
                        <input
                          type="time"
                          className="bg-gray-700 text-white border border-gray-600 rounded p-1 w-24"
                          value={
                            editedResource.operatingHours?.[day]?.close || ""
                          }
                          onChange={(e) => {
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
                    </React.Fragment>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-white">
                  <p className="font-medium">Monday:</p>
                  <p>{formatHours(resource.operatingHours.monday)}</p>
                  <p className="font-medium">Tuesday:</p>
                  <p>{formatHours(resource.operatingHours.tuesday)}</p>
                  <p className="font-medium">Wednesday:</p>
                  <p>{formatHours(resource.operatingHours.wednesday)}</p>
                  <p className="font-medium">Thursday:</p>
                  <p>{formatHours(resource.operatingHours.thursday)}</p>
                  <p className="font-medium">Friday:</p>
                  <p>{formatHours(resource.operatingHours.friday)}</p>
                  <p className="font-medium">Saturday:</p>
                  <p>{formatHours(resource.operatingHours.saturday)}</p>
                  <p className="font-medium">Sunday:</p>
                  <p>{formatHours(resource.operatingHours.sunday)}</p>
                </div>
              )}
            </div>

            {/* Stats */}
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">Stats</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-white">
                <p>Favorites:</p>
                <p>{resource.favoriteCount}</p>
                {resource.upvoteCount !== undefined && (
                  <>
                    <p>Upvotes:</p>
                    <p>{resource.upvoteCount}</p>
                  </>
                )}
                <p>Created:</p>
                <p>{new Date(resource.createdAt).toLocaleDateString()}</p>
                <p>Last Updated:</p>
                <p>{new Date(resource.updatedAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        {resource.reviews && resource.reviews.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-400 mb-2">
              Reviews ({resource.reviews.length})
            </h3>
            <div className="max-h-60 overflow-y-auto space-y-3">
              {resource.reviews.map((review) => (
                <div key={review.id} className="bg-gray-900 p-3 rounded-md">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-sm font-medium text-white">
                      {review.User?.name || "Anonymous User"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="text-sm text-gray-300">{review.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <DialogFooter className="mt-6">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white border-0 rounded-full"
                onClick={toggleEditMode}
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
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white border-0 rounded-full"
                onClick={() => onClose(false)}
              >
                Close
              </Button>
              <Button
                variant="outline"
                className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white border-0 rounded-full"
                onClick={toggleEditMode}
              >
                Edit Resource
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ResourceDetailsModal;
