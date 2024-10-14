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
import { Category } from "@prisma/client";
import {
  ageRangeOptions,
  categoryToOptions,
} from "@/lib/options/searchOptions";

interface SearchParams {
  description: string;
  ageRange: string;
  zipCode: string;
  category: Category;
  categoryOption: string;
}

const MainSearch: React.FC<{}> = () => {
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  const [searchType, setSearchType] = useState<Category>(
    Object.values(Category)[0],
  );

  const [searchParams, setSearchParams] = useState<SearchParams>({
    description: "",
    ageRange: "",
    zipCode: "",
    category: searchType,
    categoryOption: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleInputChange = (field: keyof SearchParams, value: string) => {
    setSearchParams((prev) => ({ ...prev, [field]: value }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Filter out empty values
    const filteredParams = Object.entries(searchParams).reduce(
      (acc, [key, value]) => {
        if (value !== "") {
          acc[key] = value;
        }
        return acc;
      },
      {} as Record<string, string>,
    );

    const queryString = new URLSearchParams(filteredParams).toString();
    router.push(`/search-results?${queryString}`);
  };

  return (
    <form onSubmit={handleSearch} className="flex flex-col gap-4">
      <div className="text-center text-lg text-gray-600">Pick a category.</div>
      <div className="flex flex-row gap-2 justify-evenly">
        {/* Iterate over the categories */}
        {Object.values(Category).map((category) => (
          <Button
            type="button"
            key={category}
            className={`${searchType === category && "bg-slate-800"}`}
            variant="mobile-menu"
            onClick={() => {
              handleInputChange("categoryOption", "");
              setSearchType(category);
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
          onSubmit={(e) => {
            e.preventDefault();
          }}
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
        className={`${showMoreFilters ? "max-h-96" : "max-h-0"} transition-all duration-300 ease-in-out overflow-hidden`}
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
              {categoryToOptions[searchType].map((option) => (
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
          />
        </div>
      </div>

      {/* Center the search button */}
      <div className="flex justify-center">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Searching..." : "Search"}
        </Button>
      </div>
    </form>
  );
};

export default MainSearch;
