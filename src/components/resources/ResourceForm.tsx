"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Resource } from "&/resource";
import { Button } from "#/ui/button";
import { Input } from "#/ui/input";
import { Textarea } from "#/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "#/ui/select";

type FormData = Omit<Resource, "id" | "createdAt" | "updatedAt"> & {
  category: string[];
};

type NestedKeys =
  | "contact"
  | "address"
  | "operatingHours"
  | "ratings"
  | "geoLocation";

const ResourceForm = () => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    category: [],
    type: [],
    contact: {
      phone: "",
      email: "",
      website: "",
    },
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
      latitude: 0,
      longitude: 0,
    },
    operatingHours: {
      monday: "",
      tuesday: "",
      wednesday: "",
      thursday: "",
      friday: "",
      saturday: "",
      sunday: "",
      mondayOpen: "",
      mondayClose: "",
      tuesdayOpen: "",
      tuesdayClose: "",
      wednesdayOpen: "",
      wednesdayClose: "",
      thursdayOpen: "",
      thursdayClose: "",
      fridayOpen: "",
      fridayClose: "",
      saturdayOpen: "",
      saturdayClose: "",
      sundayOpen: "",
      sundayClose: "",
    },
    eligibilityCriteria: "",
    servicesProvided: [],
    targetAudience: [],
    accessibilityFeatures: [],
    cost: "",
    ratings: {
      averageRating: 0,
      numberOfReviews: 0,
    },
    geoLocation: {
      latitude: 0,
      longitude: 0,
    },
    policies: [],
    tags: [],
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

  const handleNestedChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    section: NestedKeys,
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

  const handleArrayChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof FormData,
  ) => {
    const { value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [field]: value.split(", "),
    }));
  };

  const handleCategoryChange = (value: string) => {
    setFormData((prevData) => ({
      ...prevData,
      category: [value],
      type: [], // Reset type when category changes
    }));
  };

  const handleTypeChange = (value: string) => {
    setFormData((prevData) => ({
      ...prevData,
      type: prevData.type.includes(value)
        ? prevData.type.filter((t) => t !== value)
        : [...prevData.type, value],
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

  const categories = ["SOCIAL", "EMOTIONAL", "PHYSICAL"];

  const typeOptions = {
    SOCIAL: [
      "FRIENDSHIPS / PEER RELATIONSHIPS",
      "ROMANTIC / SEXUAL RELATIONSHIPS",
      "FAMILY",
      "BULLYING (IN PERSON AND ONLINE)",
      "SCHOOL",
      "RACIAL & CULTURAL IDENTITY",
      "LGBTQ+ IDENTITY",
      "CHRONIC ILLNESS & DISABILITY",
      "SOCIAL MEDIA & MEDIA LITERACY",
      "COMMUNITY ENGAGEMENT",
    ],
    EMOTIONAL: [
      "MENTAL HEALTH",
      "COPING SKILLS",
      "SELF IMAGE",
      "GRIEF AND LOSS",
      "ADDICTION & SUBSTANCE ABUSE",
      "INTERNET & TECHNOLOGY",
      "ABUSE",
      "SCHOOL",
      "CHRONIC ILLNESS & DISABILITY",
    ],
    PHYSICAL: [
      "NUTRITION",
      "DISORDERED EATING",
      "FITNESS & EXERCISE",
      "SEXUAL HEALTH",
      "TRANSGENDER HEALTH",
      "SLEEP",
      "GENERAL PHYSICAL HEALTH",
      "CHRONIC ILLNESS & DISABILITY",
    ],
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-lg mx-auto p-4 bg-white shadow-md rounded-md"
    >
      <h1 className="text-2xl font-bold my-4 text-center">
        Create a new resource
      </h1>
      <Input
        className="block text-sm font-medium text-gray-700 mb-4"
        type="text"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="e.g. Advocacy Resources, Inc."
      />
      <Textarea
        name="description"
        value={formData.description}
        onChange={handleChange}
        placeholder="Description"
        className="resize-none mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
      />

      <h3 className="my-4 text-center">Category and Type</h3>
      <div className="space-y-4">
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

        {formData.category.length > 0 && (
          <Select onValueChange={handleTypeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select Type" />
            </SelectTrigger>
            <SelectContent>
              {typeOptions[
                formData.category[0] as keyof typeof typeOptions
              ].map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {formData.type.length > 0 && (
        <div className="mt-2">
          <h4 className="font-semibold">Selected Types:</h4>
          <ul className="list-disc list-inside">
            {formData.type.map((type) => (
              <li key={type}>{type}</li>
            ))}
          </ul>
        </div>
      )}

      <h3 className="my-4 text-center">Contact Information</h3>
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

      <h3 className="my-4 text-center">Address</h3>
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
        <Input
          type="text"
          name="zipCode"
          value={formData.address.zipCode}
          onChange={(e) => handleNestedChange(e, "address")}
          placeholder="Zip Code"
        />
        <Input
          type="text"
          name="country"
          value={formData.address.country}
          onChange={(e) => handleNestedChange(e, "address")}
          placeholder="Country"
        />
      </div>

      <h3 className="my-4 text-center">Operating Hours</h3>
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <h4 className="w-24 text-right">Monday</h4>
          <Input
            type="text"
            name="mondayOpen"
            value={formData.operatingHours.mondayOpen}
            onChange={(e) => handleNestedChange(e, "operatingHours")}
            placeholder="Open"
            className="w-32"
          />
          <Input
            type="text"
            name="mondayClose"
            value={formData.operatingHours.mondayClose}
            onChange={(e) => handleNestedChange(e, "operatingHours")}
            placeholder="Close"
            className="w-32"
          />
        </div>

        <div className="flex items-center gap-4">
          <h4 className="w-24 text-right">Tuesday</h4>
          <Input
            type="text"
            name="tuesdayOpen"
            value={formData.operatingHours.tuesdayOpen}
            onChange={(e) => handleNestedChange(e, "operatingHours")}
            placeholder="Open"
            className="w-32"
          />
          <Input
            type="text"
            name="tuesdayClose"
            value={formData.operatingHours.tuesdayClose}
            onChange={(e) => handleNestedChange(e, "operatingHours")}
            placeholder="Close"
            className="w-32"
          />
        </div>

        <div className="flex items-center gap-4">
          <h4 className="w-24 text-right">Wednesday</h4>
          <Input
            type="text"
            name="wednesdayOpen"
            value={formData.operatingHours.wednesdayOpen}
            onChange={(e) => handleNestedChange(e, "operatingHours")}
            placeholder="Open"
            className="w-32"
          />
          <Input
            type="text"
            name="wednesdayClose"
            value={formData.operatingHours.wednesdayClose}
            onChange={(e) => handleNestedChange(e, "operatingHours")}
            placeholder="Close"
            className="w-32"
          />
        </div>

        <div className="flex items-center gap-4">
          <h4 className="w-24 text-right">Thursday</h4>
          <Input
            type="text"
            name="thursdayOpen"
            value={formData.operatingHours.thursdayOpen}
            onChange={(e) => handleNestedChange(e, "operatingHours")}
            placeholder="Open"
            className="w-32"
          />
          <Input
            type="text"
            name="thursdayClose"
            value={formData.operatingHours.thursdayClose}
            onChange={(e) => handleNestedChange(e, "operatingHours")}
            placeholder="Close"
            className="w-32"
          />
        </div>

        <div className="flex items-center gap-4">
          <h4 className="w-24 text-right">Friday</h4>
          <Input
            type="text"
            name="fridayOpen"
            value={formData.operatingHours.fridayOpen}
            onChange={(e) => handleNestedChange(e, "operatingHours")}
            placeholder="Open"
            className="w-32"
          />
          <Input
            type="text"
            name="fridayClose"
            value={formData.operatingHours.fridayClose}
            onChange={(e) => handleNestedChange(e, "operatingHours")}
            placeholder="Close"
            className="w-32"
          />
        </div>

        <div className="flex items-center gap-4">
          <h4 className="w-24 text-right">Saturday</h4>
          <Input
            type="text"
            name="saturdayOpen"
            value={formData.operatingHours.saturdayOpen}
            onChange={(e) => handleNestedChange(e, "operatingHours")}
            placeholder="Open"
            className="w-32"
          />
          <Input
            type="text"
            name="saturdayClose"
            value={formData.operatingHours.saturdayClose}
            onChange={(e) => handleNestedChange(e, "operatingHours")}
            placeholder="Close"
            className="w-32"
          />
        </div>

        <div className="flex items-center gap-4">
          <h4 className="w-24 text-right">Sunday</h4>
          <Input
            type="text"
            name="sundayOpen"
            value={formData.operatingHours.sundayOpen}
            onChange={(e) => handleNestedChange(e, "operatingHours")}
            placeholder="Open"
            className="w-32"
          />
          <Input
            type="text"
            name="sundayClose"
            value={formData.operatingHours.sundayClose}
            onChange={(e) => handleNestedChange(e, "operatingHours")}
            placeholder="Close"
            className="w-32"
          />
        </div>
      </div>

      <h3 className="my-4 text-center">Eligibility Criteria</h3>
      <div className="mb-4">
        <Input
          type="text"
          name="eligibilityCriteria"
          value={formData.eligibilityCriteria}
          onChange={handleChange}
          placeholder="e.g. Serves individuals under 25 years old"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 text-center">
          Services Provided
        </label>
        <Input
          type="text"
          name="servicesProvided"
          value={formData.servicesProvided.join(", ")}
          onChange={(e) => handleArrayChange(e, "servicesProvided")}
          placeholder="e.g. Rental Assistance, Counseling"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 text-center">
          Target Audience
        </label>
        <Input
          type="text"
          name="targetAudience"
          value={formData.targetAudience.join(", ")}
          onChange={(e) => handleArrayChange(e, "targetAudience")}
          placeholder="e.g. Women, Homeless Youth"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 text-center">
          Accessibility Features
        </label>
        <Input
          type="text"
          name="accessibilityFeatures"
          value={formData.accessibilityFeatures.join(", ")}
          onChange={(e) => handleArrayChange(e, "accessibilityFeatures")}
          placeholder="e.g. Wheelchair Accessible, Sign Language Interpreter"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 text-center">
          Cost
        </label>
        <Input
          type="text"
          name="cost"
          value={formData.cost}
          onChange={handleChange}
          placeholder="e.g. Free, $40 / month, Sliding scale"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 text-center">
          Policies
        </label>
        <Input
          type="text"
          name="policies"
          value={formData.policies.join(", ")}
          onChange={(e) => handleArrayChange(e, "policies")}
          placeholder="e.g. Gender Affirming, Confidentiality"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 text-center">
          Tags
        </label>
        <Input
          type="text"
          name="tags"
          value={formData.tags.join(", ")}
          onChange={(e) => handleArrayChange(e, "tags")}
          placeholder="e.g. LGBTQ+, Mental Health, Housing"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      <div className="flex justify-center">
        <Button className="" type="submit">
          Create Resource
        </Button>
      </div>
    </form>
  );
};

export default ResourceForm;
