"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, CheckCircle, Save } from "lucide-react";

interface ResourceManageModalProps {
  isOpen: boolean;
  onClose: (value: boolean) => void;
  resourceId: string;
}

export default function ResourceManageModal({
  isOpen,
  onClose,
  resourceId,
}: ResourceManageModalProps) {
  const [resource, setResource] = useState<any | null>(null);
  const [editedResource, setEditedResource] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Helper function to ensure operatingHours has the correct structure
  const ensureOperatingHoursStructure = (hours: any) => {
    if (!hours) {
      // Default hours structure
      return {
        monday: { open: "09:00", close: "17:00" },
        tuesday: { open: "09:00", close: "17:00" },
        wednesday: { open: "09:00", close: "17:00" },
        thursday: { open: "09:00", close: "17:00" },
        friday: { open: "09:00", close: "17:00" },
        saturday: { open: "09:00", close: "17:00" },
        sunday: { open: "09:00", close: "17:00" },
      };
    }

    // If hours is a string, try to parse it as JSON
    if (typeof hours === "string") {
      try {
        hours = JSON.parse(hours);
      } catch (e) {
        console.error("Failed to parse operatingHours string:", e);
        return {
          monday: { open: "09:00", close: "17:00" },
          tuesday: { open: "09:00", close: "17:00" },
          wednesday: { open: "09:00", close: "17:00" },
          thursday: { open: "09:00", close: "17:00" },
          friday: { open: "09:00", close: "17:00" },
          saturday: { open: "09:00", close: "17:00" },
          sunday: { open: "09:00", close: "17:00" },
        };
      }
    }

    // Ensure all days are present
    const days = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ];
    const result: any = {};

    days.forEach((day) => {
      result[day] = {
        open: hours[day]?.open || "09:00",
        close: hours[day]?.close || "17:00",
      };
    });

    return result;
  };

  useEffect(() => {
    if (isOpen && resourceId) {
      fetchResource(resourceId);
    }
  }, [isOpen, resourceId]);

  const fetchResource = async (id: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/v1/resources/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch resource");
      }
      const responseData = await response.json();

      // Extract the resource from the response
      const resourceData = responseData.resource || responseData;

      // Transform the data to match the UI structure if needed
      const transformedData = {
        ...resourceData,
        // Extract contact fields if they exist
        phone: resourceData.contact?.phone || "",
        email: resourceData.contact?.email || "",
        website: resourceData.contact?.website || "",
        // Make sure address is an object
        address: resourceData.address || {},
        // Make sure operatingHours is an object with the correct structure
        operatingHours: ensureOperatingHoursStructure(
          resourceData.operatingHours,
        ),
      };

      setResource(transformedData);
      setEditedResource(transformedData);
      setError(null);
    } catch (err) {
      console.error("Error fetching resource:", err);
      setError("Failed to load resource. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResourceChange = (field: string, value: any) => {
    if (!editedResource) return;

    // Handle nested fields (e.g., address.street)
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setEditedResource({
        ...editedResource,
        [parent]: {
          ...((editedResource[parent] as object) || {}),
          [child]: value,
        },
      });
    } else if (field === "phone" || field === "email" || field === "website") {
      // These fields need to go into the contact JSON object
      setEditedResource({
        ...editedResource,
        contact: {
          ...((editedResource.contact as object) || {}),
          [field]: value,
        },
        // Keep the UI field updated too
        [field]: value,
      });
    } else if (field === "operatingHours") {
      // Update the operatingHours field
      setEditedResource({
        ...editedResource,
        operatingHours: value,
      });
    } else {
      setEditedResource({
        ...editedResource,
        [field]: value,
      });
    }
  };

  // Prepare resource data for API submission
  const prepareResourceData = () => {
    if (!editedResource) return null;

    // Create a copy of the resource with the proper structure for the API
    return {
      name: editedResource.name,
      description: editedResource.description,
      // Ensure contact is a proper JSON object
      contact: {
        phone: editedResource.phone || "",
        email: editedResource.email || "",
        website: editedResource.website || "",
        ...((editedResource.contact as object) || {}),
      },
      // Use the address object directly
      address: editedResource.address || {},
      // Use operatingHours directly
      operatingHours: editedResource.operatingHours || {},
    };
  };

  const handleSave = async () => {
    if (!resourceId || !editedResource) return;

    // Prepare the resource data with the proper structure for the API
    const resourceData = prepareResourceData();
    if (!resourceData) return;

    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Use the business-update endpoint specifically for business representatives
      const response = await fetch(
        `/api/v1/resources/${resourceId}/business-update`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(resourceData),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update resource");
      }

      const updatedResource = await response.json();

      // Transform the data to match the UI structure
      const transformedData = {
        ...updatedResource,
        phone: updatedResource.contact?.phone || "",
        email: updatedResource.contact?.email || "",
        website: updatedResource.contact?.website || "",
        address: updatedResource.address || {},
        operatingHours: ensureOperatingHoursStructure(
          updatedResource.operatingHours,
        ),
      };

      setResource(transformedData);
      setEditedResource(transformedData);
      setIsEditing(false);
      setSuccessMessage("Resource updated successfully!");

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      console.error("Error updating resource:", err);
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset edited resource to the original resource
    setEditedResource(resource);
    setIsEditing(false);
    setError(null);
  };

  const handleClose = () => {
    // Reset state when closing the modal
    setIsEditing(false);
    setError(null);
    setSuccessMessage(null);
    onClose(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-gray-800 text-white border-gray-700 max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Manage Your Resource
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Update information for the resource you manage
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
          </div>
        ) : !resource ? (
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Resource Not Found</h2>
            <p className="mb-4">
              {error ||
                "We couldn't find the resource you're looking for. Please contact an administrator."}
            </p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              {isEditing ? (
                <div className="flex space-x-2">
                  <Button
                    onClick={handleSave}
                    className="bg-green-600 hover:bg-green-700 flex items-center"
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    className="border-gray-600 text-white hover:bg-gray-700"
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Edit Resource
                </Button>
              )}

              <Button
                onClick={() =>
                  window.open(`/resources/${resource.id}`, "_blank")
                }
                className="bg-purple-600 hover:bg-purple-700"
              >
                View Public Page
              </Button>
            </div>

            {error && (
              <div className="bg-red-900 p-4 mb-4 rounded-md flex items-center">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {successMessage && (
              <div className="bg-green-900 p-4 mb-4 rounded-md flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                <p>{successMessage}</p>
              </div>
            )}

            <Tabs defaultValue="details" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="details">Resource Details</TabsTrigger>
                <TabsTrigger value="contact">Contact Information</TabsTrigger>
                <TabsTrigger value="location">Location & Hours</TabsTrigger>
              </TabsList>

              {/* Resource Details Tab */}
              <TabsContent value="details">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Resource Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white"
                        value={editedResource?.name || ""}
                        onChange={(e) =>
                          handleResourceChange("name", e.target.value)
                        }
                      />
                    ) : (
                      <p className="bg-gray-700 border border-gray-600 rounded-md p-2 text-white">
                        {resource.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Description
                    </label>
                    {isEditing ? (
                      <textarea
                        className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white min-h-[150px]"
                        value={editedResource?.description || ""}
                        onChange={(e) =>
                          handleResourceChange("description", e.target.value)
                        }
                      />
                    ) : (
                      <div className="bg-gray-700 border border-gray-600 rounded-md p-2 text-white min-h-[100px] whitespace-pre-wrap">
                        {resource.description}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Categories
                    </label>
                    <div className="bg-gray-700 border border-gray-600 rounded-md p-2 text-white">
                      {resource.category && Array.isArray(resource.category) ? (
                        <div className="flex flex-wrap gap-2">
                          {resource.category.map(
                            (cat: string, index: number) => (
                              <span
                                key={index}
                                className="bg-blue-900 text-white px-2 py-1 rounded-full text-sm"
                              >
                                {cat}
                              </span>
                            ),
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-400">No categories assigned</p>
                      )}
                    </div>
                    {isEditing && (
                      <p className="text-sm text-gray-400 mt-1">
                        Categories can only be updated by administrators.
                      </p>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* Contact Information Tab */}
              <TabsContent value="contact">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Phone Number
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white"
                        value={editedResource?.phone || ""}
                        onChange={(e) =>
                          handleResourceChange("phone", e.target.value)
                        }
                        placeholder="e.g., (555) 123-4567"
                      />
                    ) : (
                      <p className="bg-gray-700 border border-gray-600 rounded-md p-2 text-white">
                        {resource.phone || "No phone number provided"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Email Address
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white"
                        value={editedResource?.email || ""}
                        onChange={(e) =>
                          handleResourceChange("email", e.target.value)
                        }
                        placeholder="e.g., contact@organization.org"
                      />
                    ) : (
                      <p className="bg-gray-700 border border-gray-600 rounded-md p-2 text-white">
                        {resource.email || "No email address provided"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Website
                    </label>
                    {isEditing ? (
                      <input
                        type="url"
                        className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white"
                        value={editedResource?.website || ""}
                        onChange={(e) =>
                          handleResourceChange("website", e.target.value)
                        }
                        placeholder="e.g., https://www.organization.org"
                      />
                    ) : (
                      <p className="bg-gray-700 border border-gray-600 rounded-md p-2 text-white">
                        {resource.website ? (
                          <a
                            href={resource.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:underline"
                          >
                            {resource.website}
                          </a>
                        ) : (
                          "No website provided"
                        )}
                      </p>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* Location & Hours Tab */}
              <TabsContent value="location">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-3">Address</h3>
                    {isEditing ? (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            Street
                          </label>
                          <input
                            type="text"
                            className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white"
                            value={
                              (editedResource?.address as any)?.street || ""
                            }
                            onChange={(e) =>
                              handleResourceChange(
                                "address.street",
                                e.target.value,
                              )
                            }
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                              City
                            </label>
                            <input
                              type="text"
                              className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white"
                              value={
                                (editedResource?.address as any)?.city || ""
                              }
                              onChange={(e) =>
                                handleResourceChange(
                                  "address.city",
                                  e.target.value,
                                )
                              }
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                              State
                            </label>
                            <input
                              type="text"
                              className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white"
                              value={
                                (editedResource?.address as any)?.state || ""
                              }
                              onChange={(e) =>
                                handleResourceChange(
                                  "address.state",
                                  e.target.value,
                                )
                              }
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                              ZIP Code
                            </label>
                            <input
                              type="text"
                              className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white"
                              value={
                                (editedResource?.address as any)?.zip || ""
                              }
                              onChange={(e) =>
                                handleResourceChange(
                                  "address.zip",
                                  e.target.value,
                                )
                              }
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-700 border border-gray-600 rounded-md p-3 text-white">
                        {resource.address ? (
                          <address className="not-italic">
                            {(resource.address as any)?.street && (
                              <div>{(resource.address as any).street}</div>
                            )}
                            {((resource.address as any)?.city ||
                              (resource.address as any)?.state ||
                              (resource.address as any)?.zip) && (
                              <div>
                                {(resource.address as any)?.city || ""}
                                {(resource.address as any)?.city &&
                                (resource.address as any)?.state
                                  ? ", "
                                  : ""}
                                {(resource.address as any)?.state || ""}
                                {((resource.address as any)?.city ||
                                  (resource.address as any)?.state) &&
                                (resource.address as any)?.zip
                                  ? " "
                                  : ""}
                                {(resource.address as any)?.zip || ""}
                              </div>
                            )}
                          </address>
                        ) : (
                          <p className="text-gray-400">
                            No address information
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <Separator className="bg-gray-700" />

                  <div>
                    <h3 className="text-lg font-medium mb-3">
                      Operating Hours
                    </h3>
                    {isEditing ? (
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
                          ] as Array<string>
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
                                  value={
                                    editedResource?.operatingHours?.[day]
                                      ?.open || ""
                                  }
                                  onChange={(e) => {
                                    if (!editedResource?.operatingHours) return;
                                    const updatedHours = {
                                      ...editedResource.operatingHours,
                                    };
                                    updatedHours[day] = {
                                      ...updatedHours[day],
                                      open: e.target.value,
                                    };
                                    handleResourceChange(
                                      "operatingHours",
                                      updatedHours,
                                    );
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
                                  value={
                                    editedResource?.operatingHours?.[day]
                                      ?.close || ""
                                  }
                                  onChange={(e) => {
                                    if (!editedResource?.operatingHours) return;
                                    const updatedHours = {
                                      ...editedResource.operatingHours,
                                    };
                                    updatedHours[day] = {
                                      ...updatedHours[day],
                                      close: e.target.value,
                                    };
                                    handleResourceChange(
                                      "operatingHours",
                                      updatedHours,
                                    );
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-gray-700 border border-gray-600 rounded-md p-3 text-white">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                          {resource?.operatingHours &&
                            Object.entries(resource.operatingHours).map(
                              ([day, hours]: [string, any]) => (
                                <div key={day} className="mb-1">
                                  <span className="font-medium capitalize">
                                    {day}:{" "}
                                  </span>
                                  <span>
                                    {hours.open} - {hours.close}
                                  </span>
                                </div>
                              ),
                            )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
