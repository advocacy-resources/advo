"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Resource } from "@/interfaces/resource"; // Adjust the import path accordingly
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

type FormData = Omit<
  Resource,
  "id" | "createdAt" | "updatedAt" | "favoriteCount"
>;

const ResourceForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    category: [],
    contact: {
      phone: "",
      email: "",
      website: "",
    },
    address: {
      street: "",
      city: "",
      state: "",
    },
    operatingHours: {
      monday: { open: "", close: "" },
      tuesday: { open: "", close: "" },
      wednesday: { open: "", close: "" },
      thursday: { open: "", close: "" },
      friday: { open: "", close: "" },
      saturday: { open: "", close: "" },
      sunday: { open: "", close: "" },
    },
  });

  const router = useRouter();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  type NestedSections = "contact" | "address" | "operatingHours";

  const handleNestedChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    section: NestedSections,
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [section]: {
        ...prevData[section],
        [name]: value,
      },
    }));
  };

  const handleCategoryChange = (value: string) => {
    setFormData((prevData) => ({
      ...prevData,
      category: [value],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/resources", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        router.push("/resources");
      } else {
        console.error("Failed to create resource");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const categories = ["SOCIAL", "MENTAL", "PHYSICAL"];

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-lg mx-auto p-4 bg-white shadow-md rounded-md"
    >
      <div className="text-2xl font-bold my-4 text-center">
        Create a new resource
      </div>

      {/* Name */}
      <Input
        className="block text-sm font-medium text-gray-700 mb-4"
        type="text"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="e.g. Advocacy Resources, Inc."
      />

      {/* Description */}
      <Textarea
        name="description"
        value={formData.description}
        onChange={handleChange}
        placeholder="Description"
        className="resize-none mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
      />

      {/* Category */}
      <div className="my-4 text-center">Category</div>
      <Select onValueChange={handleCategoryChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select Category" />
        </SelectTrigger>
        <SelectContent>
          {categories.map((category) => (
            <SelectItem key={category} value={category}>
              {category}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Contact Information */}
      <div className="my-4 text-center">Contact Information</div>
      <div className="flex flex-col gap-4">
        <Input
          type="text"
          name="phone"
          value={formData.contact.phone}
          onChange={(e) => handleNestedChange(e, "contact")}
          placeholder="Phone"
        />
        <Input
          type="email"
          name="email"
          value={formData.contact.email}
          onChange={(e) => handleNestedChange(e, "contact")}
          placeholder="Email"
        />
        <Input
          type="text"
          name="website"
          value={formData.contact.website}
          onChange={(e) => handleNestedChange(e, "contact")}
          placeholder="Website"
        />
      </div>

      {/* Address */}
      <div className="my-4 text-center">Address</div>
      <div className="flex flex-col gap-4">
        <Input
          type="text"
          name="street"
          value={formData.address.street}
          onChange={(e) => handleNestedChange(e, "address")}
          placeholder="Street"
        />
        <Input
          type="text"
          name="city"
          value={formData.address.city}
          onChange={(e) => handleNestedChange(e, "address")}
          placeholder="City"
        />
        <Input
          type="text"
          name="state"
          value={formData.address.state}
          onChange={(e) => handleNestedChange(e, "address")}
          placeholder="State"
        />
      </div>

      {/* Operating Hours */}
      <div className="my-4 text-center">Operating Hours</div>
      <div className="space-y-4">
        {(
          Object.keys(
            formData.operatingHours,
          ) as (keyof FormData["operatingHours"])[]
        ).map((day) => (
          <div className="flex items-center gap-4" key={day}>
            <div className="w-24 text-right capitalize">{day}</div>
            <Input
              type="text"
              name="open"
              value={formData.operatingHours[day].open}
              onChange={(e) => handleNestedChange(e, "operatingHours")}
              placeholder="Open"
              className="w-32"
            />
            <Input
              type="text"
              name="close"
              value={formData.operatingHours[day].close}
              onChange={(e) => handleNestedChange(e, "operatingHours")}
              placeholder="Close"
              className="w-32"
            />
          </div>
        ))}
      </div>

      {/* Submit Button */}
      <div className="flex justify-center">
        <Button type="submit">Create Resource</Button>
      </div>
    </form>
  );
};

export default ResourceForm;
