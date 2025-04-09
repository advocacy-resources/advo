"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Resource, OperatingHours } from "@/interfaces/resource";
import { FileUpload } from "@/components/ui/file-upload";

export default function CreateResourcePage() {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

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
      website: ""
    },
    address: {
      street: "",
      city: "",
      state: "",
      zip: ""
    },
    operatingHours: {
      monday: { open: "09:00", close: "17:00" },
      tuesday: { open: "09:00", close: "17:00" },
      wednesday: { open: "09:00", close: "17:00" },
      thursday: { open: "09:00", close: "17:00" },
      friday: { open: "09:00", close: "17:00" },
      saturday: { open: "09:00", close: "17:00" },
      sunday: { open: "09:00", close: "17:00" }
    }
  });

  const handleInputChange = (field: string, value: any) => {
    console.log(`handleInputChange field: ${field}, value type: ${typeof value}`);
    if (field === "profilePhotoUrl" || field === "bannerImageUrl") {
      console.log(`Setting ${field} to:`, value);
    }
    
    setNewResource({
      ...newResource,
      [field]: value
    });
  };

  const handleCategoryChange = (value: string) => {
    // Split by commas and trim whitespace
    const categories = value.split(',').map(cat => cat.trim());
    
    setNewResource({
      ...newResource,
      category: categories
    });
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      // Validate required fields
      if (!newResource.name || !newResource.description) {
        setError("Name and description are required");
        setIsSaving(false);
        return;
      }
      
      // Log the resource before saving
      console.log("Creating resource with profile photo:", !!newResource.profilePhoto);
      console.log("Creating resource with banner image:", !!newResource.bannerImage);
      
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
        bannerImageUrl: newResource.bannerImageUrl
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
      
      // Redirect to the resource edit page
      router.push(`/admin/resources/${createdResource.id}`);
    } catch (err) {
      setError("Error creating resource. Please try again.");
      console.error(err);
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    router.push("/admin/resources");
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Create New Resource</h2>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            className="bg-green-700 hover:bg-green-800 text-white border-0"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? "Creating..." : "Create Resource"}
          </Button>
          <Button 
            variant="outline" 
            className="bg-gray-700 hover:bg-gray-800 text-white border-0"
            onClick={handleCancel}
            disabled={isSaving}
          >
            Cancel
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-900 p-4 mb-4 text-white rounded">
          {error}
        </div>
      )}

      <div className="bg-gray-800 shadow-md rounded-lg overflow-hidden p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Basic Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Name *</label>
                <input
                  type="text"
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded p-2"
                  value={newResource.name || ""}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Description *</label>
                <textarea
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded p-2 h-32"
                  value={newResource.description || ""}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Categories (comma separated)</label>
                <input
                  type="text"
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded p-2"
                  value={newResource.category?.join(", ") || ""}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                />
              </div>
              <FileUpload
                label="Profile Photo"
                type="profile"
                onUploadComplete={(imageData) => {
                  console.log("Profile Photo upload complete, file path:", imageData.filePath);
                  if (imageData.filePath) {
                    handleInputChange("profilePhotoUrl", imageData.filePath);
                    handleInputChange("profilePhotoType", imageData.mimeType);
                  }
                }}
                currentImage={newResource.profilePhotoUrl || ""}
                className="mb-4"
              />
              
              <FileUpload
                label="Banner Image"
                type="banner"
                onUploadComplete={(imageData) => {
                  console.log("Banner Image upload complete, file path:", imageData.filePath);
                  if (imageData.filePath) {
                    handleInputChange("bannerImageUrl", imageData.filePath);
                    handleInputChange("bannerImageType", imageData.mimeType);
                  }
                }}
                currentImage={newResource.bannerImageUrl || ""}
                className="mb-4"
              />
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Contact Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Phone</label>
                <input
                  type="text"
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded p-2"
                  value={newResource.contact?.phone || ""}
                  onChange={(e) => handleInputChange("contact", {
                    ...newResource.contact,
                    phone: e.target.value
                  })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                <input
                  type="email"
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded p-2"
                  value={newResource.contact?.email || ""}
                  onChange={(e) => handleInputChange("contact", {
                    ...newResource.contact,
                    email: e.target.value
                  })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Website</label>
                <input
                  type="text"
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded p-2"
                  value={newResource.contact?.website || ""}
                  onChange={(e) => handleInputChange("contact", {
                    ...newResource.contact,
                    website: e.target.value
                  })}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-semibold text-white mb-4">Address</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Street</label>
              <input
                type="text"
                className="w-full bg-gray-700 text-white border border-gray-600 rounded p-2"
                value={newResource.address?.street || ""}
                onChange={(e) => handleInputChange("address", {
                  ...newResource.address,
                  street: e.target.value
                })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">City</label>
              <input
                type="text"
                className="w-full bg-gray-700 text-white border border-gray-600 rounded p-2"
                value={newResource.address?.city || ""}
                onChange={(e) => handleInputChange("address", {
                  ...newResource.address,
                  city: e.target.value
                })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">State</label>
              <input
                type="text"
                className="w-full bg-gray-700 text-white border border-gray-600 rounded p-2"
                value={newResource.address?.state || ""}
                onChange={(e) => handleInputChange("address", {
                  ...newResource.address,
                  state: e.target.value
                })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Zip Code</label>
              <input
                type="text"
                className="w-full bg-gray-700 text-white border border-gray-600 rounded p-2"
                value={newResource.address?.zip || ""}
                onChange={(e) => handleInputChange("address", {
                  ...newResource.address,
                  zip: e.target.value
                })}
              />
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-semibold text-white mb-4">Operating Hours</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as Array<keyof OperatingHours>).map((day) => (
              <div key={day} className="bg-gray-700 p-3 rounded">
                <label className="block text-sm font-medium text-gray-300 mb-2 capitalize">{day}</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Open</label>
                    <input
                      type="time"
                      className="w-full bg-gray-600 text-white border border-gray-600 rounded p-1"
                      value={newResource.operatingHours?.[day]?.open || ""}
                      onChange={(e) => {
                        if (!newResource.operatingHours) return;
                        const updatedHours = { ...newResource.operatingHours };
                        updatedHours[day] = {
                          ...updatedHours[day],
                          open: e.target.value
                        };
                        handleInputChange("operatingHours", updatedHours);
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Close</label>
                    <input
                      type="time"
                      className="w-full bg-gray-600 text-white border border-gray-600 rounded p-1"
                      value={newResource.operatingHours?.[day]?.close || ""}
                      onChange={(e) => {
                        if (!newResource.operatingHours) return;
                        const updatedHours = { ...newResource.operatingHours };
                        updatedHours[day] = {
                          ...updatedHours[day],
                          close: e.target.value
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

        <div className="mt-6 bg-blue-900 p-3 rounded text-blue-200 text-sm">
          <p>* Required fields</p>
        </div>
      </div>
    </div>
  );
}