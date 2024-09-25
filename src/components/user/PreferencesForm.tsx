import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserData } from "@/hooks/useUserData";

interface PreferencesFormProps {
  userData: UserData;
  setUserData: React.Dispatch<React.SetStateAction<UserData | null>>;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
}

const PreferencesForm: React.FC<PreferencesFormProps> = ({
  userData,
  setUserData,
  handleInputChange,
}) => {
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

  return (
    <>
      {/* Primary Language */}
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

      {/* Secondary Languages */}
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
              onClick={() => handleRemoveArrayItem("secondaryLanguages", index)}
            >
              Remove
            </Button>
          </div>
        ))}
        <Button onClick={() => handleAddArrayItem("secondaryLanguages")}>
          Add Language
        </Button>
      </div>

      {/* Preferred Communication */}
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
            } as any)
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

      {/* Interests */}
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
            <Button onClick={() => handleRemoveArrayItem("interests", index)}>
              Remove
            </Button>
          </div>
        ))}
        <Button onClick={() => handleAddArrayItem("interests")}>
          Add Interest
        </Button>
      </div>
    </>
  );
};

export default PreferencesForm;
