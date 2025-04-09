"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { hash } from "bcryptjs";

export default function CreateUserPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Initialize a new empty user
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user"
  });

  const [passwordVisible, setPasswordVisible] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setNewUser({
      ...newUser,
      [field]: value
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
      
      // Redirect to the users list
      router.push("/admin/users");
    } catch (err) {
      setError("Error creating user. Please try again.");
      console.error(err);
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    router.push("/admin/users");
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Create New User</h2>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            className="bg-green-700 hover:bg-green-800 text-white border-0"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? "Creating..." : "Create User"}
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
            <h3 className="text-lg font-semibold text-white mb-4">User Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Name *</label>
                <input
                  type="text"
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded p-2"
                  value={newUser.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Email *</label>
                <input
                  type="email"
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded p-2"
                  value={newUser.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Account Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Password *</label>
                <div className="relative">
                  <input
                    type={passwordVisible ? "text" : "password"}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded p-2"
                    value={newUser.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-2 text-gray-400"
                    onClick={() => setPasswordVisible(!passwordVisible)}
                  >
                    {passwordVisible ? "Hide" : "Show"}
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1">Password must be at least 8 characters long</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Confirm Password *</label>
                <input
                  type={passwordVisible ? "text" : "password"}
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded p-2"
                  value={newUser.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Role</label>
                <select
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded p-2"
                  value={newUser.role}
                  onChange={(e) => handleInputChange("role", e.target.value)}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-blue-900 p-3 rounded text-blue-200 text-sm">
          <p>* Required fields</p>
        </div>
      </div>
    </div>
  );
}