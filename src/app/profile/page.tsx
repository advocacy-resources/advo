"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useUserData } from "@/hooks/useUserData";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import UserProfileModal from "@/components/users/UserProfileModal";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
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

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  interface Resource {
    id: string;
    name: string;
    description: string;
    [key: string]: string | number | boolean | object | null | undefined;
  }

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
  }, [session?.user?.id]);

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
