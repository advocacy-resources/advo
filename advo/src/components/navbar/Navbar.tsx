"use client";

import Image from "next/image";
import navImage from "$/AdvoHomeHeroBanner.png";
import logo from "$/AdvoLogoWhite.png";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";

function Navbar() {
  return (
    <nav className="relative min-h-[40%] text-white">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          alt="nav-bg-image"
          src={navImage}
          quality={100}
          layout="fill"
          objectFit="cover"
        />
      </div>

      {/* Navbar Content */}
      <div className="relative z-10 ">
        {/* Top Section: Logo and Buttons */}
        <div className="min-h-[50px] flex justify-between items-center px-8 py-4">
          {/* Logo */}
          <div>
            <Image src={logo} alt="Advo Logo" height={75} />
          </div>

          {/* Right Section: Submit Button and Avatar */}
          <div className="flex flex-row gap-8">
            <Button className="text-white bg-advo-pink hover:bg-[#FDF952] hover:text-black hover:shadow-glow">
              Submit a Resource
            </Button>
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Middle Section: Input Fields and Dropdown Menus */}
        <h1 className="text-center text-6xl text-advo-pink">
          Find Support Today!
        </h1>
        <div className="flex flex-wrap justify-center gap-4 px-4 py-24">
          {/* Search Terms Input */}
          <Input
            className="text-black text-center w-[250px]"
            type="search"
            placeholder="Search Terms"
          />

          {/* Zip Code Input */}
          <Input
            className="text-black text-center w-[150px]"
            type="text"
            placeholder="Zipcode"
          />

          {/* Mental Health Dropdown */}
          <Select>
            <SelectTrigger className="w-[200px] text-black">
              <SelectValue placeholder="Mental Health" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Mental Health Resources</SelectLabel>
                <SelectItem value="resource1">Resource 1</SelectItem>
                <SelectItem value="resource2">Resource 2</SelectItem>
                <SelectItem value="resource3">Resource 3</SelectItem>
                <SelectItem value="resource4">Resource 4</SelectItem>
                <SelectItem value="resource5">Resource 5</SelectItem>
                <SelectItem value="resource6">Resource 6</SelectItem>
                <SelectItem value="resource7">Resource 7</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          {/* Physical Health Dropdown */}
          <Select>
            <SelectTrigger className="w-[200px] text-black">
              <SelectValue placeholder="Physical Health" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Physical Health Resources</SelectLabel>
                <SelectItem value="resource1">Resource 1</SelectItem>
                <SelectItem value="resource2">Resource 2</SelectItem>
                <SelectItem value="resource3">Resource 3</SelectItem>
                <SelectItem value="resource4">Resource 4</SelectItem>
                <SelectItem value="resource5">Resource 5</SelectItem>
                <SelectItem value="resource6">Resource 6</SelectItem>
                <SelectItem value="resource7">Resource 7</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          {/* Emotional Health Dropdown */}
          <Select>
            <SelectTrigger className="w-[200px] text-black">
              <SelectValue placeholder="Emotional Health" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Emotional Health Resources</SelectLabel>
                <SelectItem value="resource1">Resource 1</SelectItem>
                <SelectItem value="resource2">Resource 2</SelectItem>
                <SelectItem value="resource3">Resource 3</SelectItem>
                <SelectItem value="resource4">Resource 4</SelectItem>
                <SelectItem value="resource5">Resource 5</SelectItem>
                <SelectItem value="resource6">Resource 6</SelectItem>
                <SelectItem value="resource7">Resource 7</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Bottom Section: Search Button */}
        <div className="flex justify-center mt-4">
          <Button className="text-white bg-advo-pink hover:bg-[#FDF952] hover:text-black hover:shadow-glow">
            Search
          </Button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
