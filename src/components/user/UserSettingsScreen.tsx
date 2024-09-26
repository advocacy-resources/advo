"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "#/ui/button";
import { Input } from "#/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#/ui/select";
import { DatePicker } from "#/ui/date-picker";

interface UserSettingsScreenProps {
  userData: UserData;
  setUserData: React.Dispatch<React.SetStateAction<UserData>>;
}

interface UserData {
  name: string;
  email: string;
  dateOfBirth: Date | null;
  gender: string;
  pronouns: string;
  primaryLanguage: string;
  secondaryLanguages: string[];
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  preferredCommunication: string;
  interests: string[];
}

interface Session {
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export function UserSettingsScreen({
  userData,
  setUserData,
}: UserSettingsScreenProps) {
  const { data: session } = useSession() as { data: Session | null };
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (session?.user?.id) {
        try {
          const response = await fetch(`/api/users/${session.user.id}`);
          if (!response.ok) {
            throw new Error("Failed to fetch user data");
          }
          const data = await response.json();

          if (data.dateOfBirth) {
            data.dateOfBirth = new Date(data.dateOfBirth);
          }

          setUserData(data);
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchUserData();
  }, [session, setUserData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: keyof UserData) => (value: string) => {
    setUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleArrayInputChange = (
    name: keyof UserData,
    index: number,
    value: string,
  ) => {
    setUserData((prevData) => {
      const array = [...(prevData[name] as string[])];
      array[index] = value;
      return { ...prevData, [name]: array };
    });
  };

  const handleAddArrayItem = (name: keyof UserData) => {
    setUserData((prevData) => ({
      ...prevData,
      [name]: [...(prevData[name] as string[]), ""],
    }));
  };

  const handleRemoveArrayItem = (name: keyof UserData, index: number) => {
    setUserData((prevData) => {
      const array = (prevData[name] as string[]).filter((_, i) => i !== index);
      return { ...prevData, [name]: array };
    });
  };

  const handleDateChange = (date: Date | null) => {
    setUserData((prevData) => ({ ...prevData, dateOfBirth: date }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/users/${session?.user?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...userData,
          dateOfBirth: userData.dateOfBirth
            ? userData.dateOfBirth.toISOString()
            : null,
        }),
      });
      if (!response.ok) throw new Error("Failed to save user data");
      // Optionally, show a success message
    } catch (error) {
      console.error("Error saving user data:", error);
      // Optionally, show an error message
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">User Settings</h1>

      <div className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <Input
            name="name"
            value={userData.name}
            onChange={handleInputChange}
            placeholder="Enter your name"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <Input
            name="email"
            value={userData.email}
            onChange={handleInputChange}
            type="email"
            placeholder="Enter your email"
          />
        </div>

        {/* Date of Birth */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Date of Birth
          </label>
          <DatePicker date={userData.dateOfBirth} onChange={handleDateChange} />
        </div>

        {/* Gender */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Gender
          </label>
          <Select
            onValueChange={handleSelectChange("gender")}
            value={userData.gender}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Select gender</SelectItem>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="non-binary">Non-binary</SelectItem>
              <SelectItem value="other">Other</SelectItem>
              <SelectItem value="prefer-not-to-say">
                Prefer not to say
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Pronouns */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Pronouns
          </label>
          <Input
            name="pronouns"
            value={userData.pronouns}
            onChange={handleInputChange}
            placeholder="e.g., she/her, he/him"
          />
        </div>

        {/* Primary Language */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Primary Language
          </label>
          <Input
            name="primaryLanguage"
            value={userData.primaryLanguage}
            onChange={handleInputChange}
            placeholder="Enter your primary language"
          />
        </div>

        {/* Secondary Languages */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Secondary Languages
          </label>
          {userData.secondaryLanguages.map((lang, index) => (
            <div key={index} className="flex items-center space-x-2 mt-2">
              <Input
                value={lang}
                onChange={(e) =>
                  handleArrayInputChange(
                    "secondaryLanguages",
                    index,
                    e.target.value,
                  )
                }
                placeholder="Enter a secondary language"
              />
              <Button
                onClick={() =>
                  handleRemoveArrayItem("secondaryLanguages", index)
                }
              >
                Remove
              </Button>
            </div>
          ))}
          <Button
            onClick={() => handleAddArrayItem("secondaryLanguages")}
            className="mt-2"
          >
            Add Language
          </Button>
        </div>

        {/* City */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            City
          </label>
          <Input
            name="city"
            value={userData.city}
            onChange={handleInputChange}
            placeholder="Enter your city"
          />
        </div>

        {/* State */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            State
          </label>
          <Input
            name="state"
            value={userData.state}
            onChange={handleInputChange}
            placeholder="Enter your state"
          />
        </div>

        {/* Zip Code */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Zip Code
          </label>
          <Input
            name="zipCode"
            value={userData.zipCode}
            onChange={handleInputChange}
            placeholder="Enter your zip code"
          />
        </div>

        {/* Country */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Country
          </label>
          <Input
            name="country"
            value={userData.country}
            onChange={handleInputChange}
            placeholder="Enter your country"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Phone
          </label>
          <Input
            name="phone"
            value={userData.phone}
            onChange={handleInputChange}
            placeholder="Enter your phone number"
          />
        </div>

        {/* Preferred Communication Method */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Preferred Communication Method
          </label>
          <Select
            onValueChange={handleSelectChange("preferredCommunication")}
            value={userData.preferredCommunication}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select preference" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Select preference</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="phone">Phone</SelectItem>
              <SelectItem value="text">Text Message</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Interests */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Interests
          </label>
          {userData.interests.map((interest, index) => (
            <div key={index} className="flex items-center space-x-2 mt-2">
              <Input
                value={interest}
                onChange={(e) =>
                  handleArrayInputChange("interests", index, e.target.value)
                }
                placeholder="Enter an interest"
              />
              <Button onClick={() => handleRemoveArrayItem("interests", index)}>
                Remove
              </Button>
            </div>
          ))}
          <Button
            onClick={() => handleAddArrayItem("interests")}
            className="mt-2"
          >
            Add Interest
          </Button>
        </div>

        {/* Save Button */}
        <div>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default UserSettingsScreen;
