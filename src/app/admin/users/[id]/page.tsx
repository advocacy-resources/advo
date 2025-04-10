"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { IUser } from "@/interfaces/user";

export default function UserDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const [user, setUser] = useState<IUser | null>(null);
  const [editedUser, setEditedUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTogglingActive, setIsTogglingActive] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchUser();
  }, [params.id]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/v1/admin/users/${params.id}`);

      if (!response.ok) {
        throw new Error("Failed to fetch user");
      }

      const data = await response.json();
      setUser(data);
      setEditedUser(data);
      setError(null);
    } catch (err) {
      setError("Error loading user. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (newRole: string) => {
    if (editedUser) {
      setEditedUser({
        ...editedUser,
        role: newRole,
      });
      setIsEditing(true);
    }
  };

  const handleSave = async () => {
    if (!editedUser) return;

    try {
      setIsSaving(true);
      const response = await fetch(`/api/v1/admin/users/${params.id}/role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: editedUser.role }),
      });

      if (!response.ok) {
        throw new Error("Failed to update user role");
      }

      // Update the user data
      setUser(editedUser);
      setIsEditing(false);
      setError(null);
    } catch (err) {
      setError("Error updating user role. Please try again.");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async () => {
    if (!user) return;

    try {
      setIsTogglingActive(true);

      const newStatus = !(user.isActive ?? true);

      const response = await fetch(`/api/v1/admin/users/${params.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update user status");
      }

      const updatedUser = await response.json();
      setUser(updatedUser);
      setEditedUser(updatedUser);
      setError(null);
    } catch (err) {
      setError("Error updating user status. Please try again.");
      console.error(err);
    } finally {
      setIsTogglingActive(false);
    }
  };

  const handleCancel = () => {
    setEditedUser(user);
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

  if (error || !user) {
    return (
      <div className="bg-red-900 p-4 mb-4 text-white rounded">
        {error || "User not found"}
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">User Details</h2>
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
            className={`${user?.isActive ? "bg-red-700 hover:bg-red-800" : "bg-green-700 hover:bg-green-800"} text-white border-0`}
            onClick={handleToggleActive}
            disabled={isTogglingActive}
          >
            {isTogglingActive
              ? "Updating..."
              : user?.isActive
                ? "Freeze Account"
                : "Unfreeze Account"}
          </Button>
          <Button
            variant="outline"
            className="bg-transparent border-gray-500 text-gray-300 hover:bg-gray-700"
            onClick={() => router.push("/admin/users")}
          >
            Back to Users
          </Button>
        </div>
      </div>

      <div className="bg-gray-800 shadow-md rounded-lg overflow-hidden p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">
              Basic Information
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-400">
                  Name
                </label>
                <div className="mt-1 text-white">{user.name || "N/A"}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400">
                  Email
                </label>
                <div className="mt-1 text-white">{user.email}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400">
                  User ID
                </label>
                <div className="mt-1 text-white">{user.id}</div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-4">
              Account Settings
            </h3>
            <div className="space-y-3">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-400">
                  Account Status
                </label>
                <div className="mt-1 flex items-center">
                  <span
                    className={`inline-block w-3 h-3 rounded-full mr-2 ${user.isActive ? "bg-green-500" : "bg-red-500"}`}
                  ></span>
                  <span className="text-white">
                    {user.isActive ? "Active" : "Frozen"}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400">
                  Role
                </label>
                <div className="mt-1">
                  <select
                    className="bg-gray-700 text-white border border-gray-600 rounded p-2 w-full"
                    value={editedUser?.role || "user"}
                    onChange={(e) => handleRoleChange(e.target.value)}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                  {isEditing && (
                    <p className="text-yellow-400 text-xs mt-1">
                      * Changes will not be applied until you save
                    </p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400">
                  Created At
                </label>
                <div className="mt-1 text-white">
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleString()
                    : "N/A"}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400">
                  Last Updated
                </label>
                <div className="mt-1 text-white">
                  {user.updatedAt
                    ? new Date(user.updatedAt).toLocaleString()
                    : "N/A"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
