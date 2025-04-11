"use client";

import React, { useState } from "react";
import Image from "next/image";
import { IUser } from "@/interfaces/user";
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

interface UserCreateModalProps {
  isOpen: boolean;
  onClose: (value: boolean) => void;
  onUserCreated?: (createdUser: IUser) => void;
}

const UserCreateModal: React.FC<UserCreateModalProps> = ({
  isOpen,
  onClose,
  onUserCreated,
}) => {
  const [isEditing, setIsEditing] = useState(true); // Start in editing mode
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordVisible, setPasswordVisible] = useState(false);

  // Initialize a new empty user
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user",
    isActive: true,
    image: "",
  });

  const handleInputChange = (field: string, value: any) => {
    setNewUser({
      ...newUser,
      [field]: value,
    });
  };

  const validateForm = () => {
    if (!newUser.name.trim()) {
      setError("Name is required");
      return false;
    }

    if (!newUser.email.trim()) {
      setError("Email is required");
      return false;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUser.email)) {
      setError("Please enter a valid email address");
      return false;
    }

    if (!newUser.password) {
      setError("Password is required");
      return false;
    }

    if (newUser.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }

    if (newUser.password !== newUser.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    try {
      if (!validateForm()) {
        return;
      }

      setIsSaving(true);
      setError(null);

      // Create user data without confirmPassword
      const { confirmPassword, ...userData } = newUser;

      const response = await fetch(`/api/v1/admin/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create user");
      }

      const createdUser = await response.json();

      // Call the callback with the created user
      if (onUserCreated) {
        onUserCreated(createdUser);
      }

      // Reset form and close modal
      resetForm();
      onClose(false);
    } catch (err) {
      setError("Error creating user. Please try again.");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setNewUser({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "user",
      isActive: true,
      image: "",
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
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
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
                value={newUser.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="User Name"
                required
              />
            ) : (
              newUser.name || "New User"
            )}
          </DialogTitle>
          <DialogDescription className="text-gray-300 mt-2">
            {isEditing ? "Create New User" : "User Details"}
          </DialogDescription>
        </DialogHeader>
        {error && (
          <div className="bg-red-900 p-4 mb-4 text-white rounded">{error}</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-4">
          {/* Left Column */}
          <div className="space-y-4">
            {/* User Profile Image */}
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-400 mb-2">
                Profile Picture
              </h3>
              <FileUpload
                label="Profile Picture"
                type="profile"
                onUploadComplete={(imageData) => {
                  if (imageData.filePath) {
                    handleInputChange("image", imageData.filePath);
                  }
                }}
                currentImage={newUser.image}
              />
            </div>

            {/* Basic Info */}
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">
                Basic Information
              </h3>
              <div className="space-y-2 text-sm text-white">
                <div className="grid grid-cols-2 gap-x-4 items-center">
                  <p className="font-medium">Name:</p>
                  <input
                    type="text"
                    className="bg-gray-700 text-white border border-gray-600 rounded p-1"
                    value={newUser.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter name"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-x-4 items-center">
                  <p className="font-medium">Email:</p>
                  <input
                    type="email"
                    className="bg-gray-700 text-white border border-gray-600 rounded p-1"
                    value={newUser.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="Enter email"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-x-4 items-center">
                  <p className="font-medium">Role:</p>
                  <select
                    className="bg-gray-700 text-white border border-gray-600 rounded p-1"
                    value={newUser.role}
                    onChange={(e) => handleInputChange("role", e.target.value)}
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
                      checked={newUser.isActive}
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
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Password Section */}
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">
                Password
              </h3>
              <div className="space-y-2 text-sm text-white">
                <div>
                  <p className="font-medium mb-1">Password:</p>
                  <div className="relative">
                    <input
                      type={passwordVisible ? "text" : "password"}
                      className="w-full bg-gray-700 text-white border border-gray-600 rounded p-1"
                      value={newUser.password}
                      onChange={(e) =>
                        handleInputChange("password", e.target.value)
                      }
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-1.5 text-xs px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-white rounded-full"
                      onClick={() => setPasswordVisible(!passwordVisible)}
                    >
                      {passwordVisible ? "Hide" : "Show"}
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Password must be at least 8 characters long
                  </p>
                </div>
                <div>
                  <p className="font-medium mb-1">Confirm Password:</p>
                  <input
                    type={passwordVisible ? "text" : "password"}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded p-1"
                    value={newUser.confirmPassword}
                    onChange={(e) =>
                      handleInputChange("confirmPassword", e.target.value)
                    }
                    required
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3 bg-blue-900 p-2 rounded text-blue-200 text-xs">
          <p>* All fields except profile picture are required</p>
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
            {isSaving ? "Creating..." : "Create User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserCreateModal;
