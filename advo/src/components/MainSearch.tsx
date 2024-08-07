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

const MainSearch = () => {
  // State variables to manage form input values
  const [ageRange, setAgeRange] = useState("");
  const [zipcode, setZipcode] = useState("");
  const [socialHealth, setSocialHealth] = useState("");
  const [mentalHealth, setMentalHealth] = useState("");
  const [physicalHealth, setPhysicalHealth] = useState("");

  // Handle form submission
  const handleOnSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // Log the form values to the console
    console.log("Age Range:", ageRange);
    console.log("Zipcode:", zipcode);
    console.log("Social Health:", socialHealth);
    console.log("Mental Health:", mentalHealth);
    console.log("Physical Health:", physicalHealth);

    // Reset the form values
    setAgeRange("");
    setZipcode("");
    setSocialHealth("");
    setMentalHealth("");
    setPhysicalHealth("");
  };

  return (
    <>
      <div className="w-full py-8 bg-gray-300">
        <div className="max-w-[80%] mx-auto py-36">
          <h3 className="text-center font-bold text-6xl">Lorem Ipsum</h3>
          <p className="text-center my-8">
            Lorem ipsum dolor sit amet consectetur, adipisicing elit. Impedit,
            voluptatum pariatur possimus, adipisci iste a provident amet
            repellendus quia esse blanditiis perspiciatis nemo hic magni, eius
            consectetur molestias consequuntur assumenda!
          </p>
          <form
            onSubmit={handleOnSubmit}
            className="flex flex-col sm:flex-row justify-center items-center gap-4 py-4"
          >
            {/* Age Range Select */}
            <Select value={ageRange} onValueChange={setAgeRange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Age Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="18-25">18-25</SelectItem>
                <SelectItem value="26-35">26-35</SelectItem>
                <SelectItem value="36-45">36-45</SelectItem>
                <SelectItem value="46-55">46-55</SelectItem>
                <SelectItem value="56+">56+</SelectItem>
              </SelectContent>
            </Select>

            {/* Zipcode Input */}
            <Input
              className="w-full sm:min-w-1/5"
              placeholder="Zipcode"
              value={zipcode}
              onChange={(e) => setZipcode(e.target.value)}
            />

            {/* Social Health Select */}
            <Select value={socialHealth} onValueChange={setSocialHealth}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Social Health" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="social-support">Social Support</SelectItem>
                <SelectItem value="community-engagement">
                  Community Engagement
                </SelectItem>
                <SelectItem value="relationships">Relationships</SelectItem>
              </SelectContent>
            </Select>

            {/* Mental Health Select */}
            <Select value={mentalHealth} onValueChange={setMentalHealth}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Mental Health" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="therapy">Therapy</SelectItem>
                <SelectItem value="counseling">Counseling</SelectItem>
                <SelectItem value="support-groups">Support Groups</SelectItem>
              </SelectContent>
            </Select>

            {/* Physical Health Select */}
            <Select value={physicalHealth} onValueChange={setPhysicalHealth}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Physical Health" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fitness">Fitness</SelectItem>
                <SelectItem value="nutrition">Nutrition</SelectItem>
                <SelectItem value="medical">Medical</SelectItem>
              </SelectContent>
            </Select>

            {/* Submit Button */}
            <div className="flex justify-center mt-4">
              <Button type="submit">GET STARTED</Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default MainSearch;
