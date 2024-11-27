import React from "react";
import { Input } from "@/components/ui/input";
import { UserData } from "@/hooks/useUserData";

interface PersonalInfoFormProps {
  userData: UserData;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  handleDateChange: (date: Date | null) => void;
}

const PersonalInfoForm: React.FC<PersonalInfoFormProps> = ({
  userData,
  handleInputChange,
}) => {
  return (
    <>
      {/* Name */}
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
    </>
  );
};

export default PersonalInfoForm;
