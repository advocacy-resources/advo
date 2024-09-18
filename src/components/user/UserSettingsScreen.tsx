"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "#/ui/button";
import { Input } from "#/ui/input";
import { Select } from "#/ui/select";
import { DatePicker } from "#/ui/date-picker";



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

const initialUserData: UserData = {
  name: "",
  email: "",
  dateOfBirth: null,
  gender: "",
  pronouns: "",
  primaryLanguage: "",
  secondaryLanguages: [""],
  city: "",
  state: "",
  zipCode: "",
  country: "",
  phone: "",
  preferredCommunication: "",
  interests: [""],
};

const UserSettingsScreen: React.FC = () => {
  interface SessionUser {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }

  interface Session {
    user?: SessionUser;
  }

  const { data: session } = useSession() as { data: Session | null };
  const [userData, setUserData] = useState<UserData>(initialUserData);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (session?.user?.id) {
        try {
          const response = await fetch(`/api/users/${session.user.id}`);
          const data = await response.json();

          // Convert date strings to Date objects
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
  }, [session]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
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
            name="gender"
            value={userData.gender}
            onChange={handleInputChange}
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="non-binary">Non-binary</option>
            <option value="other">Other</option>
            <option value="prefer-not-to-say">Prefer not to say</option>
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
            name="preferredCommunication"
            value={userData.preferredCommunication}
            onChange={handleInputChange}
          >
            <option value="">Select preference</option>
            <option value="email">Email</option>
            <option value="phone">Phone</option>
            <option value="text">Text Message</option>
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
};

export default UserSettingsScreen;
