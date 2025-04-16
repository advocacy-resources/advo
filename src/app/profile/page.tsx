"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useUserData } from "@/hooks/useUserData";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import UserProfileModal from "@/components/users/UserProfileModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface Resource {
  id: string;
  name: string;
  description: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
  phone?: string;
  email?: string;
  website?: string;
  hours?: string;
  contact?: any;
  operatingHours?: string | object;
  [key: string]: string | number | boolean | object | null | undefined;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [managedResource, setManagedResource] = useState<Resource | null>(null);
  const [isLoadingManagedResource, setIsLoadingManagedResource] =
    useState(false);
  const [isEditingResource, setIsEditingResource] = useState(false);
  const [editedResource, setEditedResource] = useState<Resource | null>(null);
  const [resourceUpdateError, setResourceUpdateError] = useState<string | null>(
    null,
  );
  const [favoriteResources, setFavoriteResources] = useState<Resource[]>([]);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(false);

  const { userData, isLoading, saveUserData } = useUserData(session?.user?.id);

  useEffect(() => {
    const fetchFavoriteResources = async () => {
      if (!session?.user?.id) return;

      setIsLoadingFavorites(true);
      try {
        // Make sure we're using the correct API endpoint
        const response = await fetch(`/api/v1/users/${session.user.id}`);
        if (response.ok) {
          const userData = await response.json();

          if (userData.favorites && userData.favorites.length > 0) {
            // Fetch details for each favorited resource
            const resourcePromises = userData.favorites.map(
              async (resourceId: string) => {
                // Fetch resource details with proper error handling
                try {
                  const resourceResponse = await fetch(
                    `/api/v1/resources/${resourceId}`,
                  );
                  if (resourceResponse.ok) {
                    return resourceResponse.json();
                  }
                  console.log(`Resource not found: ${resourceId}`);
                  return null;
                } catch (error) {
                  console.error(
                    `Error fetching resource ${resourceId}:`,
                    error,
                  );
                  return null;
                }
              },
            );

            const resources = await Promise.all(resourcePromises);
            const validResources = resources
              .filter((r) => r !== null)
              .map((r) => {
                // Handle both direct resources and nested resource objects
                if (r && r.resource) {
                  return r.resource;
                }
                return r;
              });
            console.log("Fetched favorite resources:", validResources);
            // Log each resource to see its structure
            validResources.forEach((resource, index) => {
              console.log(`Resource ${index}:`, resource);
              console.log(`Resource ${index} ID:`, resource.id);
              console.log(`Resource ${index} ID type:`, typeof resource.id);
            });
            setFavoriteResources(validResources);
          } else {
            console.log("No favorites found in user data:", userData);
          }
        }
      } catch (error) {
        console.error("Error fetching favorite resources:", error);
      } finally {
        setIsLoadingFavorites(false);
      }
    };

    fetchFavoriteResources();

    // Fetch managed resource for business representatives
    if (
      session?.user?.role === "business_rep" &&
      session?.user?.managedResourceId
    ) {
      fetchManagedResource(session.user.managedResourceId);
    }
  }, [
    session?.user?.id,
    session?.user?.role,
    session?.user?.managedResourceId,
  ]);
  // Function to fetch the managed resource for business representatives
  const fetchManagedResource = async (resourceId: string) => {
    setIsLoadingManagedResource(true);
    try {
      const response = await fetch(`/api/v1/resources/${resourceId}`);
      if (response.ok) {
        const data = await response.json();

        // Transform the data to match the UI structure if needed
        // For example, extract contact and address fields from JSON
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

        setManagedResource(transformedData);
        setEditedResource(transformedData); // Initialize edited resource with current data
      } else {
        console.error("Failed to fetch managed resource");
      }
    } catch (error) {
      console.error("Error fetching managed resource:", error);
    } finally {
      setIsLoadingManagedResource(false);
    }
  };

  // Function to update the managed resource
  const updateManagedResource = async () => {
    if (!editedResource || !session?.user?.managedResourceId) return;

    // Prepare the resource data with the proper structure for the API
    const resourceData = prepareResourceData();
    if (!resourceData) return;

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

      if (response.ok) {
        const updatedResource = await response.json();
        setManagedResource(updatedResource);
        setIsEditingResource(false);
        setResourceUpdateError(null);
      } else {
        const errorData = await response.json();
        setResourceUpdateError(errorData.error || "Failed to update resource");
      }
    } catch (error) {
      console.error("Error updating resource:", error);
      setResourceUpdateError("An unexpected error occurred");
    }
  };

  // Handle resource field changes
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
      // Use hours as operatingHours
      operatingHours:
        editedResource.hours || editedResource.operatingHours || {},
    };
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">
        Loading...
      </div>
    );
  }

  if (!session) {
    router.push("/auth/signin");
    return null; // Avoid rendering anything while redirecting
  }

  const handleSignOut = async () => {
    await signOut({
      callbackUrl: "/auth/signin", // Redirect to the sign-in page after logging out
    });
  };

  const handleDeleteAccount = async () => {
    if (!session?.user?.id) return;

    if (confirmEmail !== session.user.email) {
      setDeleteError("Email doesn't match your account email");
      return;
    }

    try {
      const response = await fetch(`/api/v1/users/${session.user.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Sign out and redirect to home page after successful deletion
        signOut({ callbackUrl: "/" });
      } else {
        const data = await response.json();
        setDeleteError(data.error || "Failed to delete account");
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      setDeleteError("An unexpected error occurred");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8 mt-[180px] md:mt-0">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Your Profile</h1>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="profile">Profile Information</TabsTrigger>
            <TabsTrigger value="favorites">Favorite Resources</TabsTrigger>
            {session.user?.role === "business_rep" && (
              <TabsTrigger value="manage-resource">Manage Resource</TabsTrigger>
            )}
            <TabsTrigger value="account">Account Management</TabsTrigger>
          </TabsList>

          {/* Profile Information Tab */}
          <TabsContent value="profile">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription className="text-gray-400">
                  View and manage your personal information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300">
                    Name
                  </label>
                  <p className="bg-gray-700 border border-gray-600 rounded-md p-2 text-white">
                    {session.user?.name || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">
                    Email
                  </label>
                  <p className="bg-gray-700 border border-gray-600 rounded-md p-2 text-white">
                    {session.user?.email || "N/A"}
                  </p>
                </div>
                {/* Additional user information would go here */}
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() => setIsProfileModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Edit Profile
                </Button>
              </CardFooter>
            </Card>

            {/* User Profile Modal */}
            {userData && (
              <UserProfileModal
                isOpen={isProfileModalOpen}
                onClose={setIsProfileModalOpen}
                userData={userData}
                onUserUpdate={saveUserData}
              />
            )}
          </TabsContent>

          {/* Favorites Tab */}
          <TabsContent value="favorites">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>Favorite Resources</CardTitle>
                <CardDescription className="text-gray-400">
                  Resources you&apos;ve saved as favorites
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingFavorites ? (
                  <p>Loading your favorites...</p>
                ) : favoriteResources.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {favoriteResources.map((resource) => (
                      <div
                        key={resource.id}
                        className="bg-gray-700 p-4 rounded-md"
                      >
                        <h3 className="font-semibold text-lg">
                          {resource.name}
                        </h3>
                        <p className="text-gray-300 text-sm mt-1">
                          {resource.description}
                        </p>
                        <Button
                          variant="link"
                          className="p-0 h-auto mt-2 text-blue-400"
                          onClick={() => {
                            if (!resource.id) {
                              console.error(
                                "Resource ID is missing:",
                                resource,
                              );
                              return;
                            }
                            const url = `/resources/${resource.id}`;
                            console.log(
                              "Navigating to:",
                              url,
                              "Resource:",
                              resource,
                            );
                            router.push(url);
                          }}
                        >
                          View Details
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>You haven&apos;t favorited any resources yet.</p>
                )}
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() => router.push("/resources")}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Browse Resources
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Manage Resource Tab - Only for Business Representatives */}
          {session.user?.role === "business_rep" && (
            <TabsContent value="manage-resource">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle>Manage Your Resource</CardTitle>
                  <CardDescription className="text-gray-400">
                    Update information for the resource you manage
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingManagedResource ? (
                    <p>Loading resource information...</p>
                  ) : !managedResource ? (
                    <div>
                      <p>No resource assigned to your account.</p>
                      <p className="text-sm text-gray-400 mt-2">
                        Contact an administrator to assign a resource to your
                        account.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {resourceUpdateError && (
                        <div className="bg-red-900 p-4 rounded-md text-white mb-4">
                          {resourceUpdateError}
                        </div>
                      )}

                      {isEditingResource ? (
                        /* Edit Mode */
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                              Resource Name
                            </label>
                            <input
                              type="text"
                              className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white"
                              value={editedResource?.name || ""}
                              onChange={(e) =>
                                handleResourceChange("name", e.target.value)
                              }
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                              Description
                            </label>
                            <textarea
                              className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white min-h-[100px]"
                              value={editedResource?.description || ""}
                              onChange={(e) =>
                                handleResourceChange(
                                  "description",
                                  e.target.value,
                                )
                              }
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-1">
                                Phone
                              </label>
                              <input
                                type="text"
                                className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white"
                                value={editedResource?.phone || ""}
                                onChange={(e) =>
                                  handleResourceChange("phone", e.target.value)
                                }
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-1">
                                Email
                              </label>
                              <input
                                type="email"
                                className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white"
                                value={editedResource?.email || ""}
                                onChange={(e) =>
                                  handleResourceChange("email", e.target.value)
                                }
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                              Website
                            </label>
                            <input
                              type="url"
                              className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white"
                              value={editedResource?.website || ""}
                              onChange={(e) =>
                                handleResourceChange("website", e.target.value)
                              }
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                              Hours
                            </label>
                            <input
                              type="text"
                              className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white"
                              value={editedResource?.hours || ""}
                              onChange={(e) =>
                                handleResourceChange("hours", e.target.value)
                              }
                              placeholder="e.g., Mon-Fri: 9am-5pm, Sat: 10am-2pm"
                            />
                          </div>

                          <div className="border border-gray-700 rounded-md p-4 bg-gray-800">
                            <h4 className="font-medium mb-3">
                              Address Information
                            </h4>
                            <div className="space-y-3">
                              <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                  Street
                                </label>
                                <input
                                  type="text"
                                  className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white"
                                  value={
                                    (editedResource?.address as any)?.street ||
                                    ""
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
                                      (editedResource?.address as any)?.city ||
                                      ""
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
                                      (editedResource?.address as any)?.state ||
                                      ""
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
                                      (editedResource?.address as any)?.zip ||
                                      ""
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
                          </div>

                          <div className="flex space-x-3 mt-6">
                            <Button
                              onClick={updateManagedResource}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Save Changes
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setEditedResource(managedResource);
                                setIsEditingResource(false);
                                setResourceUpdateError(null);
                              }}
                              className="border-gray-600 text-white hover:bg-gray-700"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        /* View Mode */
                        <div className="space-y-4">
                          <div>
                            <h3 className="text-lg font-semibold">
                              {managedResource.name}
                            </h3>
                            <p className="text-gray-300 mt-1">
                              {managedResource.description}
                            </p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div>
                              <h4 className="font-medium text-gray-400">
                                Contact Information
                              </h4>
                              <ul className="mt-2 space-y-1">
                                {managedResource.phone && (
                                  <li className="flex items-center">
                                    <span className="text-gray-400 mr-2">
                                      Phone:
                                    </span>
                                    <span>{managedResource.phone}</span>
                                  </li>
                                )}
                                {managedResource.email && (
                                  <li className="flex items-center">
                                    <span className="text-gray-400 mr-2">
                                      Email:
                                    </span>
                                    <span>{managedResource.email}</span>
                                  </li>
                                )}
                                {managedResource.website && (
                                  <li className="flex items-center">
                                    <span className="text-gray-400 mr-2">
                                      Website:
                                    </span>
                                    <a
                                      href={managedResource.website}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-400 hover:underline"
                                    >
                                      {managedResource.website}
                                    </a>
                                  </li>
                                )}
                              </ul>
                            </div>

                            <div>
                              <h4 className="font-medium text-gray-400">
                                Address
                              </h4>
                              {managedResource.address ? (
                                <address className="mt-2 not-italic">
                                  {(managedResource.address as any)?.street && (
                                    <div>
                                      {(managedResource.address as any).street}
                                    </div>
                                  )}
                                  {((managedResource.address as any)?.city ||
                                    (managedResource.address as any)?.state ||
                                    (managedResource.address as any)?.zip) && (
                                    <div>
                                      {(managedResource.address as any)?.city ||
                                        ""}
                                      {(managedResource.address as any)?.city &&
                                      (managedResource.address as any)?.state
                                        ? ", "
                                        : ""}
                                      {(managedResource.address as any)
                                        ?.state || ""}
                                      {((managedResource.address as any)
                                        ?.city ||
                                        (managedResource.address as any)
                                          ?.state) &&
                                      (managedResource.address as any)?.zip
                                        ? " "
                                        : ""}
                                      {(managedResource.address as any)?.zip ||
                                        ""}
                                    </div>
                                  )}
                                </address>
                              ) : (
                                <p className="text-gray-500 mt-2">
                                  No address information
                                </p>
                              )}
                            </div>
                          </div>

                          {managedResource.hours && (
                            <div className="mt-4">
                              <h4 className="font-medium text-gray-400">
                                Hours
                              </h4>
                              <p className="mt-1">{managedResource.hours}</p>
                            </div>
                          )}

                          <Button
                            onClick={() => setIsEditingResource(true)}
                            className="bg-blue-600 hover:bg-blue-700 mt-4"
                          >
                            Edit Resource Information
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={() =>
                      router.push(`/resources/${managedResource?.id}`)
                    }
                    className="bg-purple-600 hover:bg-purple-700"
                    disabled={!managedResource}
                  >
                    View Public Page
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          )}

          {/* Account Management Tab */}
          <TabsContent value="account">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>Account Management</CardTitle>
                <CardDescription className="text-gray-400">
                  Manage your account settings and security
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">
                    Password & Security
                  </h3>
                  <Button
                    onClick={() => router.push("/auth/change-password")}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Change Password
                  </Button>
                </div>

                <Separator className="bg-gray-700" />

                <div>
                  <h3 className="text-lg font-medium mb-2">
                    Session Management
                  </h3>
                  <Button
                    onClick={handleSignOut}
                    className="bg-yellow-600 hover:bg-yellow-700"
                  >
                    Sign Out
                  </Button>
                </div>

                <Separator className="bg-gray-700" />

                <div>
                  <h3 className="text-lg font-medium mb-2 text-red-500">
                    Danger Zone
                  </h3>
                  <p className="text-gray-400 mb-4 text-sm">
                    Permanently delete your account and all associated data.
                    This action cannot be undone.
                  </p>
                  <Dialog
                    open={isDeleteDialogOpen}
                    onOpenChange={setIsDeleteDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button variant="destructive">Delete Account</Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gray-800 text-white border-gray-700">
                      <DialogHeader>
                        <DialogTitle className="text-red-500">
                          Delete Account
                        </DialogTitle>
                        <DialogDescription className="text-gray-400">
                          This action cannot be undone. All your data will be
                          permanently deleted.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="py-4">
                        <p className="mb-4">
                          To confirm, please enter your email address:{" "}
                          <strong>{session.user?.email}</strong>
                        </p>
                        <Input
                          value={confirmEmail}
                          onChange={(e) => setConfirmEmail(e.target.value)}
                          placeholder="Enter your email"
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                        {deleteError && (
                          <p className="text-red-500 mt-2 text-sm">
                            {deleteError}
                          </p>
                        )}
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setIsDeleteDialogOpen(false)}
                          className="border-gray-600 text-white hover:bg-gray-700"
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={handleDeleteAccount}
                        >
                          Delete Account
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
