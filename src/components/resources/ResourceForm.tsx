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
      const response = await fetch("/api/v1/resources", {
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
      className="w-full max-w-5xl mx-auto p-6 md:p-8 bg-black border border-gray-700 shadow-md rounded-lg"
    >
      <div className="text-2xl font-bold my-4 text-center text-white">
        Create a new resource
      </div>

      {/* Name */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Resource Name
        </label>
        <Input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g. Advocacy Resources, Inc."
          className="bg-gray-800 border-gray-700 text-white text-base md:text-lg h-12"
        />
      </div>

      {/* Description */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Description
        </label>
        <Textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe the resource and its services"
          className="resize-none bg-gray-800 border-gray-700 text-white min-h-[120px] text-base"
        />
      </div>

      {/* Category */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Category
        </label>
        <Select onValueChange={handleCategoryChange}>
          <SelectTrigger className="bg-gray-800 border-gray-700 text-white h-12">
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
      </div>

      <hr className="h-1 bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 border-0 rounded-full my-6" />

      {/* Contact Information */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-6 text-white">
          Contact Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Phone
            </label>
            <Input
              type="text"
              name="phone"
              value={formData.contact.phone}
              onChange={(e) => handleNestedChange(e, "contact")}
              placeholder="Phone"
              className="bg-gray-800 border-gray-700 text-white h-12"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <Input
              type="email"
              name="email"
              value={formData.contact.email}
              onChange={(e) => handleNestedChange(e, "contact")}
              placeholder="Email"
              className="bg-gray-800 border-gray-700 text-white h-12"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Website
            </label>
            <Input
              type="text"
              name="website"
              value={formData.contact.website}
              onChange={(e) => handleNestedChange(e, "contact")}
              placeholder="Website"
              className="bg-gray-800 border-gray-700 text-white h-12"
            />
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-6 text-white">Address</h3>
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Street
            </label>
            <Input
              type="text"
              name="street"
              value={formData.address.street}
              onChange={(e) => handleNestedChange(e, "address")}
              placeholder="Street"
              className="bg-gray-800 border-gray-700 text-white h-12"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                City
              </label>
              <Input
                type="text"
                name="city"
                value={formData.address.city}
                onChange={(e) => handleNestedChange(e, "address")}
                placeholder="City"
                className="bg-gray-800 border-gray-700 text-white h-12"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                State
              </label>
              <Input
                type="text"
                name="state"
                value={formData.address.state}
                onChange={(e) => handleNestedChange(e, "address")}
                placeholder="State"
                className="bg-gray-800 border-gray-700 text-white h-12"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Operating Hours */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-6 text-white">
          Operating Hours
        </h3>
        <div className="bg-gray-900 p-6 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            {(
              Object.keys(
                formData.operatingHours,
              ) as (keyof FormData["operatingHours"])[]
            ).map((day) => (
              <div className="flex items-center gap-4" key={day}>
                <div className="w-28 text-right capitalize text-gray-300 font-medium">
                  {day}
                </div>
                <div className="flex-1 flex gap-2">
                  <Input
                    type="text"
                    name="open"
                    value={formData.operatingHours[day].open}
                    onChange={(e) => handleNestedChange(e, "operatingHours")}
                    placeholder="Open"
                    className="flex-1 bg-gray-800 border-gray-700 text-white h-12"
                  />
                  <Input
                    type="text"
                    name="close"
                    value={formData.operatingHours[day].close}
                    onChange={(e) => handleNestedChange(e, "operatingHours")}
                    placeholder="Close"
                    className="flex-1 bg-gray-800 border-gray-700 text-white h-12"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-center mt-10">
        <Button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-3 rounded-md text-lg font-medium w-full md:w-auto"
        >
          Create Resource
        </Button>
      </div>
    </form>
  );
};

export default ResourceForm;
