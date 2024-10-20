"use client";

import React from "react";
import { parseISO, format } from "date-fns";
import { useSession } from "next-auth/react";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { useUserData } from "@/hooks/useUserData";
import PersonalInfoForm from "@/components/user/PersonalInfoForm";
import ContactInfoForm from "@/components/user/ContactInfoForm";

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
        <div className="text-2xl font-bold mb-6">Account Settings</div>
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <PersonalInfoForm
            userData={userData}
            handleInputChange={handleInputChange}
            handleDateChange={handleDateChange}
          />
          <ContactInfoForm
            userData={userData}
            handleInputChange={handleInputChange}
          />
          <div className="mb-4">
            <div className="text-sm text-gray-600">
              Created At:{" "}
              <time dateTime={userData.createdAt}>
                {format(parseISO(userData.createdAt), "LLLL d, yyyy")}
              </time>
            </div>
            <div className="text-sm text-gray-600">
              Last Updated:{" "}
              <time dateTime={userData.updatedAt}>
                {format(parseISO(userData.updatedAt), "LLLL d, yyyy")}
              </time>
            </div>
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
