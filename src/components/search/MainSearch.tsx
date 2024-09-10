"use client";

import React, { useState } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchParams {
  ageRange: string;
  zipCode: string;
  social: string;
  emotional: string;
  physical: string;
}

interface SearchResult {
  id: string;
  name: string;
  description: string;
  type: string[];
  category: string[];
  contact: any;
  address: any;
  operatingHours: any;
  eligibilityCriteria: string;
  servicesProvided: string[];
  targetAudience: string[];
  accessibilityFeatures: string[];
  cost: string;
  ratings: any;
  geoLocation: any;
  policies: string[];
  tags: string[];
}

const MainSearch: React.FC = () => {
  const [searchParams, setSearchParams] = useState<SearchParams>({
    ageRange: "",
    zipCode: "",
    social: "",
    emotional: "",
    physical: "",
  });
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: keyof SearchParams, value: string) => {
    setSearchParams((prev) => ({ ...prev, [field]: value }));
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    console.log("Submitting search with params:", searchParams);

    try {
      const response = await fetch("/api/resources/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(searchParams),
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Received data:", data);
      setResults(data);
    } catch (error) {
      console.error("Search error:", error);
      // Handle error (e.g., show error message to user)
    } finally {
      setIsLoading(false);
    }
  };

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
          <SelectItem value="0-12">0-12</SelectItem>
          <SelectItem value="13-17">13-17</SelectItem>
          <SelectItem value="18-24">18-24</SelectItem>
          <SelectItem value="25-34">25-34</SelectItem>
          <SelectItem value="35-44">35-44</SelectItem>
          <SelectItem value="45-54">45-54</SelectItem>
          <SelectItem value="55+">55+</SelectItem>
        </SelectContent>
      </Select>

      <Input
        placeholder="Zip Code"
        value={searchParams.zipCode}
        onChange={(e) => handleInputChange("zipCode", e.target.value)}
      />

      <Select onValueChange={(value) => handleInputChange("social", value)}>
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

      <Select onValueChange={(value) => handleInputChange("emotional", value)}>
        <SelectTrigger>
          <SelectValue placeholder="Emotional" />
        </SelectTrigger>
        <SelectContent>
          {emotionalOptions.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select onValueChange={(value) => handleInputChange("physical", value)}>
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

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Searching..." : "Search"}
      </Button>

      {results.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mt-8 mb-4">Search Results:</h2>
          <ul className="space-y-8">
            {results.map((result) => (
              <li key={result.id} className="border p-4 rounded-lg">
                <h3 className="text-xl font-semibold">{result.name}</h3>
                <p className="mt-2">{result.description}</p>
                {result.type.length > 0 && (
                  <p className="mt-1">
                    <strong>Type:</strong> {result.type.join(", ")}
                  </p>
                )}
                {result.category.length > 0 && (
                  <p>
                    <strong>Category:</strong> {result.category.join(", ")}
                  </p>
                )}
                {result.targetAudience.length > 0 && (
                  <p>
                    <strong>Target Audience:</strong>{" "}
                    {result.targetAudience.join(", ")}
                  </p>
                )}
                {result.address && "zipCode" in result.address && (
                  <p>
                    <strong>Zip Code:</strong> {result.address.zipCode}
                  </p>
                )}
                <p>
                  <strong>Cost:</strong> {result.cost}
                </p>
                {result.servicesProvided.length > 0 && (
                  <p>
                    <strong>Services Provided:</strong>{" "}
                    {result.servicesProvided.join(", ")}
                  </p>
                )}
                <p>
                  <strong>Eligibility Criteria:</strong>{" "}
                  {result.eligibilityCriteria}
                </p>
                {result.accessibilityFeatures.length > 0 && (
                  <p>
                    <strong>Accessibility Features:</strong>{" "}
                    {result.accessibilityFeatures.join(", ")}
                  </p>
                )}
                {result.policies.length > 0 && (
                  <p>
                    <strong>Policies:</strong> {result.policies.join(", ")}
                  </p>
                )}
                {result.tags.length > 0 && (
                  <p>
                    <strong>Tags:</strong> {result.tags.join(", ")}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </form>
  );
};

export default MainSearch;
