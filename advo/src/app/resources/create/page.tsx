"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Resource } from "&/resource";
import { Button } from "#/ui/button";
import { Input } from "#/ui/input";
import { Textarea } from "@/components/ui/textarea";

const ResourceForm = () => {
  const [formData, setFormData] = useState<
    Omit<Resource, "id" | "createdAt" | "updatedAt">
  >({
    name: "",
    description: "",
    type: [],
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
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleNestedChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    section: string,
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [section]: {
        ...formData[section],
        [name]: value,
      },
    });
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

  return (
    <>
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
          placeholder="e.g. Advoacy Resources, Inc."
        />
        <Textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Description"
          className="resize-none mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
        {/* Add fields for type, category, contact, address, etc. */}
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
        {/* Add fields for eligibilityCriteria, servicesProvided, targetAudience, accessibilityFeatures, cost, ratings, geoLocation, policies, tags */}
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
            onChange={(e) =>
              handleChange({
                ...e,
                target: { ...e.target, value: e.target.value.split(", ") },
              })
            }
            placeholder="e.g. Rental Assistance"
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
            onChange={(e) =>
              handleChange({
                ...e,
                target: { ...e.target, value: e.target.value.split(", ") },
              })
            }
            placeholder="e.g. Women or Homeless Youth"
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
            onChange={(e) =>
              handleChange({
                ...e,
                target: { ...e.target, value: e.target.value.split(", ") },
              })
            }
            placeholder="e.g. Website accessible via screen reader"
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
            placeholder="e.g. $40 / month"
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
            onChange={(e) =>
              handleChange({
                ...e,
                target: { ...e.target, value: e.target.value.split(", ") },
              })
            }
            placeholder="e.g. Gender Affirming"
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
            onChange={(e) =>
              handleChange({
                ...e,
                target: { ...e.target, value: e.target.value.split(", ") },
              })
            }
            placeholder="e.g. LGBTQ+"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div className="flex justify-center">
          <Button className="" type="submit">
            Create Resource
          </Button>
        </div>
      </form>
    </>
  );
};

export default ResourceForm;
