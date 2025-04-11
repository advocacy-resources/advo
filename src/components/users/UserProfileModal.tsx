"use client";

import React, { useState, useEffect } from "react";
import { UserData } from "@/hooks/useUserData";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import Image from "next/image";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: (value: boolean) => void;
  userData: UserData | null;
  onUserUpdate?: (updatedUser: UserData) => void;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  userData,
  onUserUpdate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<UserData | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userData) {
      setEditedUser(JSON.parse(JSON.stringify(userData))); // Deep copy
    }
  }, [userData]);

  if (!userData || !editedUser) return null;

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

      console.log("Saving user data:", editedUser);

      // Use the saveUserData function from the hook
      if (onUserUpdate) {
        await onUserUpdate(editedUser);
        console.log("User data saved successfully");
      }

      setIsEditing(false);
      setError(null);
    } catch (err) {
      setError("Error updating profile. Please try again.");
      console.error("Error saving profile:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleEditMode = () => {
    if (isEditing && editedUser) {
      // Reset to original user data if canceling edit
      setEditedUser(JSON.parse(JSON.stringify(userData)));
    }
    setIsEditing(!isEditing);
    setError(null);
  };

  // Handle modal close
  const handleModalClose = (open: boolean) => {
    // If the modal is being closed and we're in edit mode, reset to view mode
    if (!open && isEditing) {
      setIsEditing(false);
      setEditedUser(JSON.parse(JSON.stringify(userData))); // Reset to original data
      setError(null);
    }
    onClose(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleModalClose}>
      <DialogContent className="max-w-3xl bg-gray-900 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl text-white">
            {userData.name || "Your Profile"}
          </DialogTitle>
          <DialogDescription className="text-gray-300 mt-2">
            {isEditing ? "Edit Profile" : "User Details"}
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
              <h3 className="text-sm font-medium text-gray-300 mb-2">
                Profile Picture
              </h3>
              <div className="flex justify-center">
                <div className="w-32 h-32 rounded-full bg-gray-800 flex items-center justify-center border-2 border-gray-600">
                  <span className="text-gray-400 text-5xl">
                    {userData.name
                      ? userData.name.charAt(0).toUpperCase()
                      : "U"}
                  </span>
                </div>
              </div>
            </div>

            {/* Basic Info */}
            <div>
              <h3 className="text-sm font-medium text-gray-300 mb-2">
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
                      placeholder="Enter name"
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
                      disabled
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2 text-sm text-white">
                  <div className="grid grid-cols-2 gap-x-4">
                    <p className="font-medium">Name:</p>
                    <p>{userData.name || "N/A"}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4">
                    <p className="font-medium">Email:</p>
                    <p>{userData.email}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Account Information */}
            <div>
              <h3 className="text-sm font-medium text-gray-300 mb-2">
                Account Information
              </h3>
              <div className="space-y-2 text-sm text-white">
                <div className="grid grid-cols-2 gap-x-4">
                  <p className="font-medium">Member Since:</p>
                  <p>
                    {userData.createdAt
                      ? new Date(userData.createdAt).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-x-4">
                  <p className="font-medium">Last Updated:</p>
                  <p>
                    {userData.updatedAt
                      ? new Date(userData.updatedAt).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div>
              <h3 className="text-sm font-medium text-gray-300 mb-2">
                Additional Information
              </h3>
              <div className="space-y-2 text-sm text-white">
                <div className="grid grid-cols-2 gap-x-4">
                  <p className="font-medium">User ID:</p>
                  <p className="truncate">{userData.id}</p>
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
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white border-0 rounded-full"
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
                onClick={() => handleModalClose(false)}
              >
                Close
              </Button>
              <Button
                variant="outline"
                className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white border-0 rounded-full"
                onClick={toggleEditMode}
              >
                Edit Profile
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserProfileModal;
