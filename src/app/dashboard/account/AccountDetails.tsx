"use client";

import React from "react";
import { useSession } from "next-auth/react";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { useUserData } from "@/hooks/useUserData";
import ProfileImage from "@/components/profileImage";
import PersonalInfoForm from "@/components/user/PersonalInfoForm";
import ContactInfoForm from "@/components/user/ContactInfoForm";
import PreferencesForm from "@/components/user/PreferencesForm";

const AccountDetails: React.FC = () => {
  const { data: session } = useSession();

  const { userData, setUserData, isLoading, saveUserData } = useUserData(
    session?.user?.id,
  );

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

  const handleSave = async () => {
    if (!userData) return;
    await saveUserData(userData);
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
          <ProfileImage image={userData.image} />
          <PersonalInfoForm
            userData={userData}
            handleInputChange={handleInputChange}
            handleDateChange={handleDateChange}
          />
          <ContactInfoForm
            userData={userData}
            handleInputChange={handleInputChange}
          />
          <PreferencesForm
            userData={userData}
            setUserData={setUserData}
            handleInputChange={handleInputChange}
          />
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Created At: {new Date(userData.createdAt).toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">
              Last Updated: {new Date(userData.updatedAt).toLocaleString()}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AccountDetails;
