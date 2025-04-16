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

// Resource interest categories
const relationshipResources = [
  "Romantic/Sexual Relationships",
  "Family",
  "Abuse",
  "Bullying",
  "Racial Identity",
  "Cultural Identity",
  "LGBTQ Identity",
  "Legal Issues",
  "Social Groups (General)",
];

const mentalHealthResources = [
  "Mental Health (General)",
  "Coping Skills",
  "Self Image",
  "Grief and Loss",
  "Addiction/Substance Abuse",
  "Internet/Tech/Social Media",
];

const physicalHealthResources = [
  "Nutrition",
  "Disordered Eating",
  "Fitness & Exercise",
  "Sexual Health",
  "Transgender Health",
  "Reproductive Health",
  "Sleep",
  "Physical Health (General)",
  "Chronic Illness/Disability",
  "Accessibility",
  "Housing",
];

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
  const [resources, setResources] = useState<any[]>([]);
  const [loadingResources, setLoadingResources] = useState(false);

  useEffect(() => {
    if (user) {
      setEditedUser(JSON.parse(JSON.stringify(user))); // Deep copy
    }
  }, [user]);

  // Fetch resources when the modal is opened and the user is a business representative
  useEffect(() => {
    if (
      isOpen &&
      (user?.role === "business_rep" ||
        editedUser?.role === "business_rep" ||
        isEditing)
    ) {
      fetchResources();
    }
  }, [isOpen, user?.role, editedUser?.role, isEditing]);

  // Function to fetch resources
  const fetchResources = async () => {
    try {
      setLoadingResources(true);
      const response = await fetch("/api/v1/resources");
      if (!response.ok) {
        throw new Error("Failed to fetch resources");
      }
      const data = await response.json();
      setResources(data);
    } catch (err) {
      console.error("Error fetching resources:", err);
      setError("Error fetching resources. Please try again.");
    } finally {
      setLoadingResources(false);
    }
  };

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

  const handleResourceInterestToggle = (interest: string) => {
    if (!editedUser) return;

    const currentInterests = [...(editedUser.resourceInterests || [])];

    if (currentInterests.includes(interest)) {
      // Remove interest if already selected
      const updatedInterests = currentInterests.filter(
        (item) => item !== interest,
      );
      handleInputChange("resourceInterests", updatedInterests);
    } else {
      // Add interest if not already selected
      const updatedInterests = [...currentInterests, interest];
      handleInputChange("resourceInterests", updatedInterests);
    }
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
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
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

        <div className="overflow-y-auto pr-2 flex-grow pb-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6">
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
                        onChange={(e) => {
                          handleInputChange("role", e.target.value);
                          // If changing to business_rep and resources haven't been loaded yet, fetch them
                          if (
                            e.target.value === "business_rep" &&
                            resources.length === 0
                          ) {
                            fetchResources();
                          }
                          // If changing away from business_rep, clear the managedResourceId
                          if (e.target.value !== "business_rep") {
                            handleInputChange("managedResourceId", undefined);
                          }
                        }}
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                        <option value="business_rep">
                          Business Representative
                        </option>
                      </select>
                    </div>

                    {/* Resource selection for Business Representative */}
                    {editedUser.role === "business_rep" && (
                      <div className="grid grid-cols-2 gap-x-4 items-center mt-2">
                        <p className="font-medium">Managed Resource:</p>
                        <select
                          className="bg-gray-700 text-white border border-gray-600 rounded p-1"
                          value={editedUser.managedResourceId || ""}
                          onChange={(e) =>
                            handleInputChange(
                              "managedResourceId",
                              e.target.value,
                            )
                          }
                          disabled={loadingResources}
                        >
                          <option value="">Select a resource</option>
                          {resources.map((resource) => (
                            <option key={resource.id} value={resource.id}>
                              {resource.name}
                            </option>
                          ))}
                        </select>
                        {loadingResources && (
                          <div className="col-span-2 text-center text-gray-400 mt-1">
                            Loading resources...
                          </div>
                        )}
                      </div>
                    )}

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

                    {/* Display managed resource for Business Representative */}
                    {user.role === "business_rep" && (
                      <div className="grid grid-cols-2 gap-x-4">
                        <p className="font-medium">Managed Resource:</p>
                        <p>
                          {user.managedResourceId
                            ? resources.find(
                                (r) => r.id === user.managedResourceId,
                              )?.name || "Loading..."
                            : "None assigned"}
                        </p>
                      </div>
                    )}
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
              {/* Second Column */}
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

              {/* Third Column - Demographic Information */}
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-2">
                  Demographic Information
                </h3>
                {isEditing ? (
                  <div className="space-y-2 text-sm text-white">
                    <div className="grid grid-cols-2 gap-x-4 items-center">
                      <p className="font-medium">Age Group:</p>
                      <select
                        className="bg-gray-700 text-white border border-gray-600 rounded p-1 w-full"
                        value={editedUser.ageGroup || ""}
                        onChange={(e) =>
                          handleInputChange("ageGroup", e.target.value)
                        }
                      >
                        <option value="">Select Age Group</option>
                        <option value="16-18">16-18</option>
                        <option value="18-24">18-24</option>
                        <option value="25-30">25-30</option>
                        <option value="30-45">30-45</option>
                        <option value="45+">45+</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 items-center">
                      <p className="font-medium">Race/Ethnicity:</p>
                      <select
                        className="bg-gray-700 text-white border border-gray-600 rounded p-1 w-full"
                        value={editedUser.raceEthnicity || ""}
                        onChange={(e) =>
                          handleInputChange("raceEthnicity", e.target.value)
                        }
                      >
                        <option value="">Select Race/Ethnicity</option>
                        <option value="Hispanic">Hispanic</option>
                        <option value="Black">Black</option>
                        <option value="Latine">Latine</option>
                        <option value="Pacific Islander">
                          Pacific Islander
                        </option>
                        <option value="East Asian">East Asian</option>
                        <option value="South Asian">South Asian</option>
                        <option value="Middle Eastern">Middle Eastern</option>
                        <option value="White">White</option>
                        <option value="Indigenous">Indigenous</option>
                        <option value="Not Listed">Not Listed</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 items-center">
                      <p className="font-medium">Gender:</p>
                      <select
                        className="bg-gray-700 text-white border border-gray-600 rounded p-1 w-full"
                        value={editedUser.gender || ""}
                        onChange={(e) =>
                          handleInputChange("gender", e.target.value)
                        }
                      >
                        <option value="">Select Gender</option>
                        <option value="Cis Female">Cis Female</option>
                        <option value="Cis Male">Cis Male</option>
                        <option value="Trans Female">Trans Female</option>
                        <option value="Trans Male">Trans Male</option>
                        <option value="Non-Binary">Non-Binary</option>
                        <option value="Not Listed">Not Listed</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 items-center">
                      <p className="font-medium">Pronouns:</p>
                      <div className="flex gap-2">
                        <select
                          className="bg-gray-700 text-white border border-gray-600 rounded p-1 w-full"
                          value={editedUser.pronoun1 || ""}
                          onChange={(e) =>
                            handleInputChange("pronoun1", e.target.value)
                          }
                        >
                          <option value="">Select</option>
                          <option value="he">he</option>
                          <option value="she">she</option>
                          <option value="they">they</option>
                          <option value="ze">ze</option>
                          <option value="xe">xe</option>
                        </select>
                        <span>/</span>
                        <select
                          className="bg-gray-700 text-white border border-gray-600 rounded p-1 w-full"
                          value={editedUser.pronoun2 || ""}
                          onChange={(e) =>
                            handleInputChange("pronoun2", e.target.value)
                          }
                        >
                          <option value="">Select</option>
                          <option value="him">him</option>
                          <option value="her">her</option>
                          <option value="them">them</option>
                          <option value="zir">zir</option>
                          <option value="xem">xem</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 items-center">
                      <p className="font-medium">Sexual Orientation:</p>
                      <select
                        className="bg-gray-700 text-white border border-gray-600 rounded p-1 w-full"
                        value={editedUser.sexualOrientation || ""}
                        onChange={(e) =>
                          handleInputChange("sexualOrientation", e.target.value)
                        }
                      >
                        <option value="">Select Sexual Orientation</option>
                        <option value="Questioning">Questioning</option>
                        <option value="Lesbian">Lesbian</option>
                        <option value="Gay">Gay</option>
                        <option value="Pan">Pan</option>
                        <option value="Bi">Bi</option>
                        <option value="Straight">Straight</option>
                        <option value="Demi">Demi</option>
                        <option value="Asexual">Asexual</option>
                        <option value="Not Listed">Not Listed</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 items-center">
                      <p className="font-medium">Income Bracket:</p>
                      <select
                        className="bg-gray-700 text-white border border-gray-600 rounded p-1 w-full"
                        value={editedUser.incomeBracket || ""}
                        onChange={(e) =>
                          handleInputChange("incomeBracket", e.target.value)
                        }
                      >
                        <option value="">Select Income Bracket</option>
                        <option value="Under $10,000">Under $10,000</option>
                        <option value="$10,000 - $25,000">
                          $10,000 - $25,000
                        </option>
                        <option value="$25,000 - $50,000">
                          $25,000 - $50,000
                        </option>
                        <option value="$50,000 - $75,000">
                          $50,000 - $75,000
                        </option>
                        <option value="$75,000 - $100,000">
                          $75,000 - $100,000
                        </option>
                        <option value="$100,000 - $150,000">
                          $100,000 - $150,000
                        </option>
                        <option value="Over $150,000">Over $150,000</option>
                        <option value="Prefer not to say">
                          Prefer not to say
                        </option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 items-center">
                      <p className="font-medium">Living Situation:</p>
                      <select
                        className="bg-gray-700 text-white border border-gray-600 rounded p-1 w-full"
                        value={editedUser.livingSituation || ""}
                        onChange={(e) =>
                          handleInputChange("livingSituation", e.target.value)
                        }
                      >
                        <option value="">Select Living Situation</option>
                        <option value="Apartment">Apartment</option>
                        <option value="House">House</option>
                        <option value="Homeless">Homeless</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 items-center">
                      <p className="font-medium">Living Arrangement:</p>
                      <select
                        className="bg-gray-700 text-white border border-gray-600 rounded p-1 w-full"
                        value={editedUser.livingArrangement || ""}
                        onChange={(e) =>
                          handleInputChange("livingArrangement", e.target.value)
                        }
                      >
                        <option value="">Select Living Arrangement</option>
                        <option value="With Family">With Family</option>
                        <option value="Alone">Alone</option>
                        <option value="With Roommates">With Roommates</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 items-center">
                      <p className="font-medium">Zipcode:</p>
                      <input
                        type="text"
                        className="bg-gray-700 text-white border border-gray-600 rounded p-1 w-full"
                        value={editedUser.zipcode || ""}
                        onChange={(e) =>
                          handleInputChange("zipcode", e.target.value)
                        }
                        placeholder="Enter zipcode"
                        maxLength={5}
                        pattern="[0-9]{5}"
                      />
                    </div>

                    {/* Resource Interests */}
                    <div className="grid grid-cols-1 gap-x-4 items-start mt-4">
                      <p className="font-medium mb-2">Resource Interests:</p>
                      <div className="space-y-4">
                        <div>
                          <div className="mb-2 font-medium text-pink-400">
                            Relationships & Identity
                          </div>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {relationshipResources.map((interest) => (
                              <button
                                key={interest}
                                type="button"
                                onClick={() =>
                                  handleResourceInterestToggle(interest)
                                }
                                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                                  editedUser.resourceInterests?.includes(
                                    interest,
                                  )
                                    ? "bg-gradient-to-r from-pink-500 to-orange-400 text-white"
                                    : "bg-neutral-800 text-gray-300 hover:bg-neutral-700"
                                }`}
                              >
                                {interest}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <div className="mb-2 font-medium text-pink-400">
                            Mental Health
                          </div>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {mentalHealthResources.map((interest) => (
                              <button
                                key={interest}
                                type="button"
                                onClick={() =>
                                  handleResourceInterestToggle(interest)
                                }
                                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                                  editedUser.resourceInterests?.includes(
                                    interest,
                                  )
                                    ? "bg-gradient-to-r from-pink-500 to-orange-400 text-white"
                                    : "bg-neutral-800 text-gray-300 hover:bg-neutral-700"
                                }`}
                              >
                                {interest}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <div className="mb-2 font-medium text-pink-400">
                            Physical Health
                          </div>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {physicalHealthResources.map((interest) => (
                              <button
                                key={interest}
                                type="button"
                                onClick={() =>
                                  handleResourceInterestToggle(interest)
                                }
                                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                                  editedUser.resourceInterests?.includes(
                                    interest,
                                  )
                                    ? "bg-gradient-to-r from-pink-500 to-orange-400 text-white"
                                    : "bg-neutral-800 text-gray-300 hover:bg-neutral-700"
                                }`}
                              >
                                {interest}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 text-sm text-white">
                    <div className="grid grid-cols-2 gap-x-4">
                      <p className="font-medium">Age Group:</p>
                      <p>{user.ageGroup || "Not specified"}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4">
                      <p className="font-medium">Race/Ethnicity:</p>
                      <p>{user.raceEthnicity || "Not specified"}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4">
                      <p className="font-medium">Gender:</p>
                      <p>{user.gender || "Not specified"}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4">
                      <p className="font-medium">Pronouns:</p>
                      <p>
                        {user.pronoun1 && user.pronoun2
                          ? `${user.pronoun1}/${user.pronoun2}`
                          : "Not specified"}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4">
                      <p className="font-medium">Sexual Orientation:</p>
                      <p>{user.sexualOrientation || "Not specified"}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4">
                      <p className="font-medium">Income Bracket:</p>
                      <p>{user.incomeBracket || "Not specified"}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4">
                      <p className="font-medium">Living Situation:</p>
                      <p>{user.livingSituation || "Not specified"}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4">
                      <p className="font-medium">Living Arrangement:</p>
                      <p>{user.livingArrangement || "Not specified"}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4">
                      <p className="font-medium">Zipcode:</p>
                      <p>{user.zipcode || "Not specified"}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4">
                      <p className="font-medium">State:</p>
                      <p>{user.state || "Not specified"}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4">
                      <p className="font-medium">Resource Interests:</p>
                      <p>
                        {user.resourceInterests &&
                        user.resourceInterests.length > 0
                          ? user.resourceInterests.join(", ")
                          : "Not specified"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="absolute bottom-0 left-0 right-0 bg-gray-900 py-6 px-8 border-t border-gray-700 z-10 flex justify-end space-x-4">
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
