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

interface SearchParams {
  ageRange: string;
  zipCode: string;
  category: Category;
  // social: string;
  // emotional: string;
  // physical: string;
}

const MainSearch: React.FC = () => {
  const [searchParams, setSearchParams] = useState<SearchParams>({
    ageRange: "",
    zipCode: "",
    category: Category.MENTAL,
    // social: "",
    // emotional: "",
    // physical: "",
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

  const ageRangeOptions = [
    "0-12",
    "13-17",
    "18-24",
    "25-34",
    "35-44",
    "45-54",
    "55+",
  ];

  const socialOptions = [
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
  ];

  const emotionalOptions = [
    "MENTAL HEALTH",
    "COPING SKILLS",
    "SELF IMAGE",
    "GRIEF AND LOSS",
    "ADDICTION & SUBSTANCE ABUSE",
    "INTERNET & TECHNOLOGY",
    "ABUSE",
    "SCHOOL",
    "CHRONIC ILLNESS & DISABILITY",
  ];

  const physicalOptions = [
    "NUTRITION",
    "DISORDERED EATING",
    "FITNESS & EXERCISE",
    "SEXUAL HEALTH",
    "TRANSGENDER HEALTH",
    "SLEEP",
    "GENERAL PHYSICAL HEALTH",
    "CHRONIC ILLNESS & DISABILITY",
  ];

  return (
    <form onSubmit={handleSearch} className="space-y-4">
      <Select onValueChange={(value) => handleInputChange("ageRange", value)}>
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

      <Select
        onValueChange={(value) =>
          handleInputChange("category", Category.SOCIAL)
        }
      >
        <SelectTrigger>
          <SelectValue placeholder="Social" />
        </SelectTrigger>
        <SelectContent>
          {socialOptions.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        onValueChange={(value) =>
          handleInputChange("category", Category.MENTAL)
        }
      >
        <SelectTrigger>
          <SelectValue placeholder="Mental" />
        </SelectTrigger>
        <SelectContent>
          {emotionalOptions.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        onValueChange={(value) =>
          handleInputChange("category", Category.PHYSICAL)
        }
      >
        <SelectTrigger>
          <SelectValue placeholder="Physical" />
        </SelectTrigger>
        <SelectContent>
          {physicalOptions.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

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
