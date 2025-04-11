"use client";

import React, { useState, useEffect } from "react";
import { IUser } from "@/interfaces/user";
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

interface UserDetailsModalProps {
  isOpen: boolean;
  onClose: (value: boolean) => void;
  user: IUser | null;
  onUserUpdate?: (updatedUser: IUser) => void;
}

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
  isOpen,
  onClose,
  user,
  onUserUpdate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<IUser | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setEditedUser(JSON.parse(JSON.stringify(user))); // Deep copy
    }
  }, [user]);

  if (!user || !editedUser) return null;

  const handleInputChange = (field: string, value: any) => {
    if (!editedUser) return;

    setEditedUser({
      ...editedUser,
      [field]: value,
    });
  };

  const handleSave = async () => {
    if (!editedUser) return;

    try {
      setIsSaving(true);
      setError(null);

      const response = await fetch(`/api/v1/admin/users/${editedUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editedUser),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update user");
      }

      const updatedUser = await response.json();

      if (onUserUpdate) {
        onUserUpdate(updatedUser);
      }

      setIsEditing(false);
      setError(null);
    } catch (err) {
      setError("Error updating user. Please try again.");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleEditMode = () => {
    if (isEditing && editedUser) {
      // Reset to original user data if canceling edit
      setEditedUser(JSON.parse(JSON.stringify(user)));
    }
    setIsEditing(!isEditing);
    setError(null);
  };

  // Handle modal close
  const handleModalClose = (open: boolean) => {
    // If the modal is being closed and we're in edit mode, reset to view mode
    if (!open && isEditing) {
      setIsEditing(false);
      setEditedUser(JSON.parse(JSON.stringify(user))); // Reset to original data
      setError(null);
    }
    onClose(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleModalClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl text-white">
            {isEditing ? (
              <input
                type="text"
                className="w-full bg-gray-700 text-white border border-gray-600 rounded p-2"
                value={editedUser.name || ""}
                onChange={(e) => handleInputChange("name", e.target.value)}
              />
            ) : (
              user.name || "Unnamed User"
            )}
          </DialogTitle>
          <DialogDescription className="text-gray-300 mt-2">
            {isEditing ? "Edit User" : "User Details"}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-red-900 p-4 mb-4 text-white rounded">{error}</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
          {/* Left Column */}
          <div className="space-y-4">
            {/* User Profile Image */}
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-400 mb-2">
                Profile Picture
              </h3>
              {isEditing ? (
                <FileUpload
                  label="Profile Picture"
                  type="profile"
                  onUploadComplete={(imageData) => {
                    if (imageData.filePath) {
                      handleInputChange("image", imageData.filePath);
                    }
                  }}
                  currentImage={editedUser.image || ""}
                />
              ) : user.image ? (
                <div className="flex justify-center">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-gray-700">
                    <Image
                      src={user.image}
                      alt={`${user.name || "User"}'s profile`}
                      className="w-full h-full object-cover"
                      width={128}
                      height={128}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex justify-center">
                  <div className="w-32 h-32 rounded-full bg-gray-700 flex items-center justify-center border-2 border-gray-600">
                    <span className="text-gray-400 text-4xl">
                      {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Basic Info */}
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">
                Basic Information
              </h3>
              {isEditing ? (
                <div className="space-y-2 text-sm text-white">
                  <div className="grid grid-cols-2 gap-x-4 items-center">
                    <p className="font-medium">Name:</p>
                    <input
                      type="text"
                      className="bg-gray-700 text-white border border-gray-600 rounded p-1"
                      value={editedUser.name || ""}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      placeholder="N/A"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 items-center">
                    <p className="font-medium">Email:</p>
                    <input
                      type="email"
                      className="bg-gray-700 text-white border border-gray-600 rounded p-1"
                      value={editedUser.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 items-center">
                    <p className="font-medium">Role:</p>
                    <select
                      className="bg-gray-700 text-white border border-gray-600 rounded p-1"
                      value={editedUser.role || "user"}
                      onChange={(e) =>
                        handleInputChange("role", e.target.value)
                      }
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 items-center">
                    <p className="font-medium">Status:</p>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={editedUser.isActive}
                        onChange={(e) =>
                          handleInputChange("isActive", e.target.checked)
                        }
                        className="rounded bg-gray-700 border-gray-600"
                      />
                      <label htmlFor="isActive" className="text-white">
                        Active
                      </label>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 text-sm text-white">
                  <div className="grid grid-cols-2 gap-x-4">
                    <p className="font-medium">Name:</p>
                    <p>{user.name || "N/A"}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4">
                    <p className="font-medium">Email:</p>
                    <p>{user.email}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4">
                    <p className="font-medium">Role:</p>
                    <p className="capitalize">{user.role || "user"}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4">
                    <p className="font-medium">Status:</p>
                    <div className="flex items-center">
                      <span
                        className={`inline-block w-3 h-3 rounded-full mr-2 ${
                          user.isActive ? "bg-green-500" : "bg-red-500"
                        }`}
                      ></span>
                      <span>{user.isActive ? "Active" : "Frozen"}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Account Info */}
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">
                Account Information
              </h3>
              <div className="space-y-2 text-sm text-white">
                <div className="grid grid-cols-2 gap-x-4">
                  <p className="font-medium">Email Verified:</p>
                  <p>{user.emailVerified ? "Yes" : "No"}</p>
                </div>
                <div className="grid grid-cols-2 gap-x-4">
                  <p className="font-medium">Created:</p>
                  <p>
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-x-4">
                  <p className="font-medium">Last Updated:</p>
                  <p>
                    {user.updatedAt
                      ? new Date(user.updatedAt).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">
                Additional Information
              </h3>
              <div className="space-y-2 text-sm text-white">
                <div className="grid grid-cols-2 gap-x-4">
                  <p className="font-medium">User ID:</p>
                  <p className="truncate">{user.id}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

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
                Edit User
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailsModal;
