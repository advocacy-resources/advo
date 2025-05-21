// File: src/app/manage-resource/page.tsx
// Purpose: Dashboard for business representatives to manage their resource information.
// Owner: Advo Team

"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, CheckCircle, Save } from "lucide-react";

/**
 * Page component for business representatives to manage their resource.
 * Provides a tabbed interface for editing resource details, contact information,
 * and location/hours.
 * @returns React component with the resource management interface
 */
export default function ManageResourcePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [resource, setResource] = useState<any | null>(null);
  const [editedResource, setEditedResource] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  /**
   * Checks user authentication and role on component mount.
   * Redirects to appropriate pages if user is not authenticated
   * or is not a business representative.
   */
  useEffect(() => {
    // Check if user is logged in and is a business representative
    if (status === "authenticated") {
      if (
        session?.user?.role !== "business_rep" ||
        !session?.user?.managedResourceId
      ) {
        // Redirect to home if not a business representative or no managed resource
        router.push("/");
        return;
      }

      // Fetch the resource data
      fetchResource(session.user.managedResourceId);
    } else if (status === "unauthenticated") {
      // Redirect to login if not authenticated
      router.push("/auth/signin");
    }
  }, [status, session, router]);

  /**
   * Fetches resource data from the API.
   * @param resourceId - ID of the resource to fetch
   */
  const fetchResource = async (resourceId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/v1/resources/${resourceId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch resource");
      }

      const data = await response.json();

      // Transform the data to match the UI structure if needed
      const transformedData = {
        ...data,
        // Extract contact fields if they exist
        phone: data.contact?.phone || "",
        email: data.contact?.email || "",
        website: data.contact?.website || "",
        // Extract hours from operatingHours if it exists
        hours:
          typeof data.operatingHours === "string"
            ? data.operatingHours
            : JSON.stringify(data.operatingHours),
        // Make sure address is an object
        address: data.address || {},
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

  /**
   * Updates the resource state when form fields change.
   * Handles both simple fields and nested objects like contact and address.
   * @param field - The field name to update
   * @param value - The new value for the field
   */
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
    } else if (field === "hours") {
      // Update both operatingHours and the UI hours field
      setEditedResource({
        ...editedResource,
        operatingHours: value,
        hours: value,
      });
    } else {
      setEditedResource({
        ...editedResource,
        [field]: value,
      });
    }
  };

  /**
   * Prepares resource data for API submission.
   * Transforms UI state into the proper structure expected by the API.
   * @returns Formatted resource data object or null if no resource exists
   */
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
      // Use hours as operatingHours
      operatingHours:
        editedResource.hours || editedResource.operatingHours || {},
    };
  };

  /**
   * Saves the edited resource data to the API.
   * Shows success or error messages based on the result.
   */
  const handleSave = async () => {
    if (!session?.user?.managedResourceId || !editedResource) return;

    // Prepare the resource data with the proper structure for the API
    const resourceData = prepareResourceData();
    if (!resourceData) return;

    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Use the business-update endpoint specifically for business representatives
      const response = await fetch(
        `/api/v1/resources/${session.user.managedResourceId}/business-update`,
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
        hours:
          typeof updatedResource.operatingHours === "string"
            ? updatedResource.operatingHours
            : JSON.stringify(updatedResource.operatingHours),
        address: updatedResource.address || {},
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

  /**
   * Cancels the editing process and reverts changes.
   * Resets the edited resource to the original resource data.
   */
  const handleCancel = () => {
    // Reset edited resource to the original resource
    setEditedResource(resource);
    setIsEditing(false);
    setError(null);
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-xl">Loading...</p>
        </div>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Resource Not Found</h1>
          <p className="mb-6">
            {error ||
              "We couldn't find the resource you're looking for. Please contact an administrator."}
          </p>
          <Button
            onClick={() => router.push("/")}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8 mt-[180px] md:mt-0">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Manage Your Resource</h1>
          <div className="flex space-x-2">
            {isEditing ? (
              <>
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
              </>
            ) : (
              <Button
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Edit Resource
              </Button>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-900 p-4 mb-6 rounded-md flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="bg-green-900 p-4 mb-6 rounded-md flex items-center">
            <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            <p>{successMessage}</p>
          </div>
        )}

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="details">Resource Details</TabsTrigger>
            <TabsTrigger value="contact">Contact Information</TabsTrigger>
            <TabsTrigger value="location">Location & Hours</TabsTrigger>
          </TabsList>

          {/* Resource Details Tab */}
          <TabsContent value="details">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>Resource Details</CardTitle>
                <CardDescription className="text-gray-400">
                  Basic information about your resource
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
                        {resource.category.map((cat: string, index: number) => (
                          <span
                            key={index}
                            className="bg-blue-900 text-white px-2 py-1 rounded-full text-sm"
                          >
                            {cat}
                          </span>
                        ))}
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
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contact Information Tab */}
          <TabsContent value="contact">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription className="text-gray-400">
                  How people can reach your organization
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
              </CardContent>
            </Card>
          </TabsContent>

          {/* Location & Hours Tab */}
          <TabsContent value="location">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>Location & Hours</CardTitle>
                <CardDescription className="text-gray-400">
                  Where your resource is located and when it&apos;s available
                </CardDescription>
              </CardHeader>
              <CardContent>
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
                      <div>
                        <textarea
                          className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white min-h-[100px]"
                          value={editedResource?.hours || ""}
                          onChange={(e) =>
                            handleResourceChange("hours", e.target.value)
                          }
                          placeholder="e.g., Monday-Friday: 9am-5pm, Saturday: 10am-2pm, Sunday: Closed"
                        />
                        <p className="text-sm text-gray-400 mt-1">
                          Enter your hours in a readable format. For example:
                          &quot;Monday-Friday: 9am-5pm, Saturday: 10am-2pm,
                          Sunday: Closed&quot;
                        </p>
                      </div>
                    ) : (
                      <div className="bg-gray-700 border border-gray-600 rounded-md p-3 text-white">
                        {resource.hours ? (
                          <div className="whitespace-pre-wrap">
                            {resource.hours}
                          </div>
                        ) : (
                          <p className="text-gray-400">
                            No operating hours provided
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() =>
                    window.open(`/resources/${resource.id}`, "_blank")
                  }
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  View Public Page
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
