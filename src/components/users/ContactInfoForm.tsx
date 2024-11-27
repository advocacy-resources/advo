import React from "react";
import { Input } from "@/components/ui/input";
import { UserData } from "@/hooks/useUserData";

interface ContactInfoFormProps {
  userData: UserData;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
}

const ContactInfoForm: React.FC<ContactInfoFormProps> = ({
  userData,
  handleInputChange,
}) => {
  return (
    <>
      {/* Email */}
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

      {/* Phone */}
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

      {/* Address */}
      <div className="mb-4">
        {/* City */}
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
        {/* State */}
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
        {/* Zip Code */}
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
    </>
  );
};

export default ContactInfoForm;
