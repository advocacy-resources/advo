import React from "react";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  handleDateChange,
}) => {
  return (
    <>
      {/* Username */}
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

      {/* Date of Birth */}
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

      {/* Gender */}
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
            } as any)
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
            <SelectItem value="other">Other</SelectItem>
            <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Pronouns */}
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
    </>
  );
};

export default PersonalInfoForm;
