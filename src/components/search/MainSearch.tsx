"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ageRangeOptions } from "@/lib/options/searchOptions";

// Define category options
const categories = ["PHYSICAL", "MENTAL", "SOCIAL"];
const categoryOptions: Record<string, string[]> = {
  PHYSICAL: ["Gym", "Clinic", "Hospital"],
  MENTAL: ["Therapist", "Counseling", "Psychiatrist"],
  SOCIAL: ["Community Center", "Support Group", "Events"],
};

const MainSearch: React.FC = () => {
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [searchType, setSearchType] = useState(categories[0]); // Default to the first category
  const [searchParams, setSearchParams] = useState({
    description: "",
    ageRange: "",
    zipCode: "",
    category: searchType,
    categoryOption: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleInputChange = (
    field: keyof typeof searchParams,
    value: string,
  ) => {
    setSearchParams((prev) => ({ ...prev, [field]: value }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate zipcode if provided
    if (searchParams.zipCode && !/^\d{5}$/.test(searchParams.zipCode)) {
      alert("Please enter a valid 5-digit US zipcode");
      return;
    }

    setIsLoading(true);

    // Filter out invalid or empty parameters
    const filteredParams = Object.entries(searchParams).reduce(
      (acc, [key, value]) => {
        if (value && value.trim() !== "") {
          acc[key] = value.trim(); // Trim whitespace
        }
        return acc;
      },
      {} as Record<string, string>,
    );

    console.log("Filtered search parameters:", filteredParams);

    // Create a search object with the parameters
    const searchObject = {
      zipCode: filteredParams.zipCode || "",
      distance: "25", // Default to 25 miles
      category: filteredParams.category ? [filteredParams.category] : [],
      type: filteredParams.categoryOption
        ? [filteredParams.categoryOption]
        : [],
      description: filteredParams.description || "",
    };

    // Encode the search object as a JSON string in the URL
    const searchParam = encodeURIComponent(JSON.stringify(searchObject));
    router.push(`/resources?search=${searchParam}`);
  };

  return (
    <form onSubmit={handleSearch} className="flex flex-col gap-4">
      <div className="text-center text-lg text-gray-600">Pick a category.</div>
      <div className="flex flex-row gap-2 justify-evenly">
        {categories.map((category) => (
          <Button
            type="button"
            key={category}
            className={`${searchType === category && "bg-slate-800"}`}
            variant="outline"
            onClick={() => {
              handleInputChange("categoryOption", "");
              setSearchType(category);
              handleInputChange("category", category); // Update category in searchParams
            }}
          >
            <span className="inline-block -skew-x-6">{category}</span>
          </Button>
        ))}
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Short description"
          value={searchParams.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
        />
        <Button
          type="button"
          variant="outline"
          className={`${!showMoreFilters && "transform rotate-180"}`}
          onClick={() => setShowMoreFilters((prev) => !prev)}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6 15L12 9L18 15"
              stroke="#000000"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Button>
      </div>

      <div
        className={`${
          showMoreFilters ? "max-h-96" : "max-h-0"
        } transition-all duration-300 ease-in-out overflow-hidden`}
      >
        <div className="flex flex-col gap-2 p-2">
          <Select
            onValueChange={(value) =>
              handleInputChange("categoryOption", value)
            }
            value={searchParams.categoryOption}
          >
            <SelectTrigger>
              <SelectValue placeholder="Category Options" />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions[searchType]?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            onValueChange={(value) => handleInputChange("ageRange", value)}
            value={searchParams.ageRange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Age Range" />
            </SelectTrigger>
            <SelectContent>
              {ageRangeOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            placeholder="Zip Code"
            value={searchParams.zipCode}
            onChange={(e) => handleInputChange("zipCode", e.target.value)}
            pattern="[0-9]{5}"
            maxLength={5}
            title="Please enter a valid 5-digit US zipcode"
            className={
              searchParams.zipCode && !/^\d{5}$/.test(searchParams.zipCode)
                ? "border-red-500"
                : ""
            }
          />
          {searchParams.zipCode && !/^\d{5}$/.test(searchParams.zipCode) && (
            <p className="text-red-500 text-xs mt-1">
              Please enter a valid 5-digit US zipcode
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-center">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Searching..." : "Search"}
        </Button>
      </div>
    </form>
  );
};

export default MainSearch;
