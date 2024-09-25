"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
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
import Navbar from "@/components/layout/Navbar";
import { useToast } from "@/components/ui/use-toast";

const placeholderUrl = "https://via.placeholder.com/100";

interface UserData {
  id: string;
  username: string | null;
  email: string;
  name: string | null;
  image: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  pronouns: string | null;
  primaryLanguage: string | null;
  secondaryLanguages: string[];
  city: string | null;
  state: string | null;
  zipCode: string | null;
  phone: string | null;
  preferredCommunication: string | null;
  interests: string[];
  createdAt: string;
  updatedAt: string;
}

const AccountPage: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (session?.user?.id) {
        try {
          const response = await fetch(`/api/users/${session.user.id}`);
          if (!response.ok) {
            throw new Error("Failed to fetch user data");
          }
          const data = await response.json();
          setUserData(data);
        } catch (error) {
          console.error("Error fetching user data:", error);
          toast({
            title: "Error",
            description: "Failed to load user data. Please try again.",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      }
    };

    if (session?.user?.id) {
      fetchUserData();
    }
  }, [session, toast]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setUserData((prevData) =>
      prevData ? { ...prevData, [name]: value } : null,
    );
  };

  const handleDateChange = (date: Date | null) => {
    setUserData((prevData) =>
      prevData
        ? { ...prevData, dateOfBirth: date ? date.toISOString() : null }
        : null,
    );
  };

  const handleArrayInputChange = (
    name: string,
    index: number,
    value: string,
  ) => {
    setUserData((prevData) => {
      if (!prevData) return null;
      const newArray = [...(prevData[name as keyof UserData] as string[])];
      newArray[index] = value;
      return { ...prevData, [name]: newArray };
    });
  };

  const handleAddArrayItem = (name: string) => {
    setUserData((prevData) => {
      if (!prevData) return null;
      return {
        ...prevData,
        [name]: [...(prevData[name as keyof UserData] as string[]), ""],
      };
    });
  };

  const handleRemoveArrayItem = (name: string, index: number) => {
    setUserData((prevData) => {
      if (!prevData) return null;
      const newArray = (prevData[name as keyof UserData] as string[]).filter(
        (_, i) => i !== index,
      );
      return { ...prevData, [name]: newArray };
    });
  };

  const handleSave = async () => {
    if (!userData) return;
    setIsSaving(true);
    try {
      const response = await fetch(`/api/users/${userData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      if (!response.ok) throw new Error("Failed to save user data");

      toast({
        title: "Success",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      console.error("Error saving user data:", error);
      toast({
        title: "Error",
        description: "Failed to save user data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!userData) {
    return <div>Error loading user data</div>;
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Account Settings</h1>
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div className="mb-4">
            <Image
              src={userData.image || placeholderUrl}
              alt="User Profile Image"
              width={100}
              height={100}
              className="rounded-full mx-auto"
            />
          </div>

          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="username"
            >
              Username
            </label>
            <Input
              id="username"
              name="username"
              value={userData.username || ""}
              onChange={handleInputChange}
              placeholder="Username"
            />
          </div>

          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="email"
            >
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              value={userData.email}
              onChange={handleInputChange}
              placeholder="Email"
            />
          </div>

          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="name"
            >
              Name
            </label>
            <Input
              id="name"
              name="name"
              value={userData.name || ""}
              onChange={handleInputChange}
              placeholder="Name"
            />
          </div>

          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="dateOfBirth"
            >
              Date of Birth
            </label>
            <DatePicker
              id="dateOfBirth"
              selected={
                userData.dateOfBirth ? new Date(userData.dateOfBirth) : null
              }
              onChange={handleDateChange}
              placeholderText="Select date of birth"
            />
          </div>

          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="gender"
            >
              Gender
            </label>
            <Select
              onValueChange={(value) =>
                handleInputChange({
                  target: { name: "gender", value },
                })
              }
              value={userData.gender || undefined}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="non-binary">Non-binary</SelectItem>
                {/* TODO: Add field to specify what other gender is. */}
                <SelectItem value="other">Other</SelectItem>
                <SelectItem value="prefer-not-to-say">
                  Prefer not to say
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="pronouns"
            >
              Pronouns
            </label>
            <Input
              id="pronouns"
              name="pronouns"
              value={userData.pronouns || ""}
              onChange={handleInputChange}
              placeholder="Pronouns"
            />
          </div>

          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="primaryLanguage"
            >
              Primary Language
            </label>
            <Input
              id="primaryLanguage"
              name="primaryLanguage"
              value={userData.primaryLanguage || ""}
              onChange={handleInputChange}
              placeholder="Primary Language"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Secondary Languages
            </label>
            {userData.secondaryLanguages.map((lang, index) => (
              <div key={index} className="flex mb-2">
                <Input
                  value={lang}
                  onChange={(e) =>
                    handleArrayInputChange(
                      "secondaryLanguages",
                      index,
                      e.target.value,
                    )
                  }
                  placeholder="Secondary Language"
                  className="mr-2"
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
            <Button onClick={() => handleAddArrayItem("secondaryLanguages")}>
              Add Language
            </Button>
          </div>

          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="city"
            >
              City
            </label>
            <Input
              id="city"
              name="city"
              value={userData.city || ""}
              onChange={handleInputChange}
              placeholder="City"
            />
          </div>

          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="state"
            >
              State
            </label>
            <Input
              id="state"
              name="state"
              value={userData.state || ""}
              onChange={handleInputChange}
              placeholder="State"
            />
          </div>

          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="zipCode"
            >
              Zip Code
            </label>
            <Input
              id="zipCode"
              name="zipCode"
              value={userData.zipCode || ""}
              onChange={handleInputChange}
              placeholder="Zip Code"
            />
          </div>

          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="phone"
            >
              Phone
            </label>
            <Input
              id="phone"
              name="phone"
              value={userData.phone || ""}
              onChange={handleInputChange}
              placeholder="Phone"
            />
          </div>

          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="preferredCommunication"
            >
              Preferred Communication
            </label>
            <Select
              onValueChange={(value) =>
                handleInputChange({
                  target: { name: "preferredCommunication", value },
                })
              }
              value={userData.preferredCommunication || undefined}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select preferred communication" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="phone">Phone</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Interests
            </label>
            {userData.interests.map((interest, index) => (
              <div key={index} className="flex mb-2">
                <Input
                  value={interest}
                  onChange={(e) =>
                    handleArrayInputChange("interests", index, e.target.value)
                  }
                  placeholder="Interest"
                  className="mr-2"
                />
                <Button
                  onClick={() => handleRemoveArrayItem("interests", index)}
                >
                  Remove
                </Button>
              </div>
            ))}
            <Button onClick={() => handleAddArrayItem("interests")}>
              Add Interest
            </Button>
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Created At: {new Date(userData.createdAt).toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">
              Last Updated: {new Date(userData.updatedAt).toLocaleString()}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AccountPage;
