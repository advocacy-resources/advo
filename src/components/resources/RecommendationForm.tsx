"use client";

import React, { useState } from "react";
import { ResourceRecommendationFormData } from "@/interfaces/resourceRecommendation";
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

// Resource interest categories
const relationshipResources = [
  "Romantic/Sexual Relationships",
  "Family",
  "Abuse",
  "Bullying",
  "Racial Identity",
  "Cultural Identity",
  "LGBTQ Identity",
  "Legal Issues",
  "Social Groups (General)",
];

const mentalHealthResources = [
  "Mental Health (General)",
  "Coping Skills",
  "Self Image",
  "Grief and Loss",
  "Addiction/Substance Abuse",
  "Internet/Tech/Social Media",
];

const physicalHealthResources = [
  "Nutrition",
  "Disordered Eating",
  "Fitness & Exercise",
  "Sexual Health",
  "Transgender Health",
  "Reproductive Health",
  "Sleep",
  "Physical Health (General)",
  "Chronic Illness/Disability",
  "Accessibility",
  "Housing",
];

const RecommendationForm: React.FC = () => {
  const [formData, setFormData] = useState<ResourceRecommendationFormData>({
    name: "",
    type: "state",
    state: "",
    description: "",
    category: [],
    note: "",
    contact: {
      phone: "",
      email: "",
      website: "",
    },
    address: {
      street: "",
      city: "",
      state: "",
      zip: "",
    },
    submittedBy: "",
    email: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    // Handle nested objects (contact and address)
    if (name.includes(".")) {
      const [parent, child] = name.split(".");

      if (parent === "contact") {
        setFormData((prevData) => ({
          ...prevData,
          contact: {
            ...prevData.contact,
            [child]: value,
          },
        }));
      } else if (parent === "address") {
        setFormData((prevData) => ({
          ...prevData,
          address: {
            ...prevData.address,
            [child]: value,
          },
        }));
      }
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleCategoryToggle = (category: string) => {
    setFormData((prevData) => {
      const currentCategories = [...prevData.category];

      // If category is already selected, remove it
      if (currentCategories.includes(category)) {
        return {
          ...prevData,
          category: currentCategories.filter((cat) => cat !== category),
        };
      }
      // Otherwise, add it
      else {
        return {
          ...prevData,
          category: [...currentCategories, category],
        };
      }
    });
  };

  const handleTypeChange = (value: "state" | "national") => {
    setFormData((prevData) => ({
      ...prevData,
      type: value,
      // Clear state value if switching to national
      ...(value === "national" && { state: undefined }),
    }));
  };

  const handleStateChange = (value: string) => {
    setFormData((prevData) => ({
      ...prevData,
      state: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    // Validate that at least one category is selected
    if (formData.category.length === 0) {
      setSubmitError("Please select at least one category");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/v1/recommendations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitSuccess(true);
        setFormData({
          name: "",
          type: "state",
          state: "",
          description: "",
          category: [],
          note: "",
          contact: {
            phone: "",
            email: "",
            website: "",
          },
          address: {
            street: "",
            city: "",
            state: "",
            zip: "",
          },
          submittedBy: "",
          email: "",
        });
      } else {
        const errorData = await response.json();
        setSubmitError(errorData.message || "Failed to submit recommendation");
      }
    } catch (error) {
      console.error("Error:", error);
      setSubmitError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-3xl mx-auto p-6 md:p-8 bg-black border border-gray-700 shadow-md rounded-lg"
    >
      <div className="text-2xl font-bold my-4 text-center text-white">
        Recommend a Resource
      </div>

      <p className="text-gray-300 text-center mb-8">
        Help us grow our database by recommending resources that have been
        helpful to you or others.
      </p>

      {submitSuccess && (
        <div className="mb-8 p-4 bg-green-800 text-white rounded-md">
          Thank you for your recommendation! Our team will review it soon.
        </div>
      )}

      {submitError && (
        <div className="mb-8 p-4 bg-red-800 text-white rounded-md">
          {submitError}
        </div>
      )}

      {/* Resource Name */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Resource Name*
        </label>
        <Input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g. Advocacy Resources, Inc."
          className="bg-gray-800 border-gray-700 text-white text-base md:text-lg h-12"
          required
        />
      </div>

      {/* Resource Description */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Resource Description*
        </label>
        <Textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe what this resource offers and who it serves"
          className="resize-none bg-gray-800 border-gray-700 text-white min-h-[120px] text-base"
          required
        />
      </div>

      {/* Resource Categories */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Categories* (select all that apply)
        </label>

        <div className="mb-4">
          <div className="mb-2 font-medium text-pink-400">
            Relationships & Identity
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {relationshipResources.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => handleCategoryToggle(category)}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                  formData.category.includes(category)
                    ? "bg-gradient-to-r from-pink-500 to-orange-400 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <div className="mb-2 font-medium text-pink-400">Mental Health</div>
          <div className="flex flex-wrap gap-2 mb-4">
            {mentalHealthResources.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => handleCategoryToggle(category)}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                  formData.category.includes(category)
                    ? "bg-gradient-to-r from-pink-500 to-orange-400 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <div className="mb-2 font-medium text-pink-400">Physical Health</div>
          <div className="flex flex-wrap gap-2 mb-4">
            {physicalHealthResources.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => handleCategoryToggle(category)}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                  formData.category.includes(category)
                    ? "bg-gradient-to-r from-pink-500 to-orange-400 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {formData.category.length === 0 && (
          <p className="text-red-400 text-sm mt-2">
            Please select at least one category
          </p>
        )}
      </div>

      {/* Resource Type */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Resource Type*
        </label>
        <Select
          onValueChange={(value) =>
            handleTypeChange(value as "state" | "national")
          }
          value={formData.type}
        >
          <SelectTrigger className="bg-gray-800 border-gray-700 text-white h-12">
            <SelectValue placeholder="Select Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="state">State</SelectItem>
            <SelectItem value="national">National</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* State Selection - Only shown when type is "state" */}
      {formData.type === "state" && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            State*
          </label>
          <Select onValueChange={handleStateChange} value={formData.state}>
            <SelectTrigger className="bg-gray-800 border-gray-700 text-white h-12">
              <SelectValue placeholder="Select State" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              <SelectItem value="Alabama">Alabama</SelectItem>
              <SelectItem value="Alaska">Alaska</SelectItem>
              <SelectItem value="Arizona">Arizona</SelectItem>
              <SelectItem value="Arkansas">Arkansas</SelectItem>
              <SelectItem value="California">California</SelectItem>
              <SelectItem value="Colorado">Colorado</SelectItem>
              <SelectItem value="Connecticut">Connecticut</SelectItem>
              <SelectItem value="Delaware">Delaware</SelectItem>
              <SelectItem value="Florida">Florida</SelectItem>
              <SelectItem value="Georgia">Georgia</SelectItem>
              <SelectItem value="Hawaii">Hawaii</SelectItem>
              <SelectItem value="Idaho">Idaho</SelectItem>
              <SelectItem value="Illinois">Illinois</SelectItem>
              <SelectItem value="Indiana">Indiana</SelectItem>
              <SelectItem value="Iowa">Iowa</SelectItem>
              <SelectItem value="Kansas">Kansas</SelectItem>
              <SelectItem value="Kentucky">Kentucky</SelectItem>
              <SelectItem value="Louisiana">Louisiana</SelectItem>
              <SelectItem value="Maine">Maine</SelectItem>
              <SelectItem value="Maryland">Maryland</SelectItem>
              <SelectItem value="Massachusetts">Massachusetts</SelectItem>
              <SelectItem value="Michigan">Michigan</SelectItem>
              <SelectItem value="Minnesota">Minnesota</SelectItem>
              <SelectItem value="Mississippi">Mississippi</SelectItem>
              <SelectItem value="Missouri">Missouri</SelectItem>
              <SelectItem value="Montana">Montana</SelectItem>
              <SelectItem value="Nebraska">Nebraska</SelectItem>
              <SelectItem value="Nevada">Nevada</SelectItem>
              <SelectItem value="New Hampshire">New Hampshire</SelectItem>
              <SelectItem value="New Jersey">New Jersey</SelectItem>
              <SelectItem value="New Mexico">New Mexico</SelectItem>
              <SelectItem value="New York">New York</SelectItem>
              <SelectItem value="North Carolina">North Carolina</SelectItem>
              <SelectItem value="North Dakota">North Dakota</SelectItem>
              <SelectItem value="Ohio">Ohio</SelectItem>
              <SelectItem value="Oklahoma">Oklahoma</SelectItem>
              <SelectItem value="Oregon">Oregon</SelectItem>
              <SelectItem value="Pennsylvania">Pennsylvania</SelectItem>
              <SelectItem value="Rhode Island">Rhode Island</SelectItem>
              <SelectItem value="South Carolina">South Carolina</SelectItem>
              <SelectItem value="South Dakota">South Dakota</SelectItem>
              <SelectItem value="Tennessee">Tennessee</SelectItem>
              <SelectItem value="Texas">Texas</SelectItem>
              <SelectItem value="Utah">Utah</SelectItem>
              <SelectItem value="Vermont">Vermont</SelectItem>
              <SelectItem value="Virginia">Virginia</SelectItem>
              <SelectItem value="Washington">Washington</SelectItem>
              <SelectItem value="West Virginia">West Virginia</SelectItem>
              <SelectItem value="Wisconsin">Wisconsin</SelectItem>
              <SelectItem value="Wyoming">Wyoming</SelectItem>
              <SelectItem value="District of Columbia">
                District of Columbia
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Contact Information */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4 text-white">
          Resource Contact Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Phone Number
            </label>
            <Input
              type="tel"
              name="contact.phone"
              value={formData.contact.phone}
              onChange={handleChange}
              placeholder="(555) 555-5555"
              className="bg-gray-800 border-gray-700 text-white h-12"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <Input
              type="email"
              name="contact.email"
              value={formData.contact.email}
              onChange={handleChange}
              placeholder="contact@resource.org"
              className="bg-gray-800 border-gray-700 text-white h-12"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Website
            </label>
            <Input
              type="url"
              name="contact.website"
              value={formData.contact.website}
              onChange={handleChange}
              placeholder="https://www.resource.org"
              className="bg-gray-800 border-gray-700 text-white h-12"
            />
          </div>
        </div>
      </div>

      {/* Address Information */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4 text-white">
          Resource Address Information
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Street Address
            </label>
            <Input
              type="text"
              name="address.street"
              value={formData.address.street}
              onChange={handleChange}
              placeholder="123 Main St"
              className="bg-gray-800 border-gray-700 text-white h-12"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                City
              </label>
              <Input
                type="text"
                name="address.city"
                value={formData.address.city}
                onChange={handleChange}
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
                name="address.state"
                value={formData.address.state}
                onChange={handleChange}
                placeholder="State"
                className="bg-gray-800 border-gray-700 text-white h-12"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              ZIP Code
            </label>
            <Input
              type="text"
              name="address.zip"
              value={formData.address.zip}
              onChange={handleChange}
              placeholder="12345"
              className="bg-gray-800 border-gray-700 text-white h-12 w-1/3"
            />
          </div>
        </div>
      </div>

      {/* Note */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Why are you recommending this resource?*
        </label>
        <Textarea
          name="note"
          value={formData.note}
          onChange={handleChange}
          placeholder="Please share why you think this resource would be valuable to include"
          className="resize-none bg-gray-800 border-gray-700 text-white min-h-[120px] text-base"
          required
        />
      </div>

      <hr className="h-1 bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 border-0 rounded-full my-6" />

      {/* Contact Information (Optional) */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-4 text-white">
          Your Information (Optional)
        </h3>
        <p className="text-gray-400 text-sm mb-4">
          This information helps us follow up if we need more details about your
          recommendation.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Your Name
            </label>
            <Input
              type="text"
              name="submittedBy"
              value={formData.submittedBy}
              onChange={handleChange}
              placeholder="Your Name"
              className="bg-gray-800 border-gray-700 text-white h-12"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Your Email
            </label>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Your Email"
              className="bg-gray-800 border-gray-700 text-white h-12"
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-center mt-8">
        <Button
          type="submit"
          className="w-full md:w-auto"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit Recommendation"}
        </Button>
      </div>
    </form>
  );
};

export default RecommendationForm;
