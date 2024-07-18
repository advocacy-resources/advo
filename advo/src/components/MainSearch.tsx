import React from 'react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const MainSearch = () => {
  return (
    <>
      <div className="w-full py-8 bg-gray-300">
        <div className="max-w-[80%] mx-auto py-36">
          <h3 className='text-center font-bold text-6xl'>Lorem Ipsum</h3>
          <p className='text-center my-8'>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Impedit, voluptatum pariatur possimus, adipisci iste a provident amet repellendus quia esse blanditiis perspiciatis nemo hic magni, eius consectetur molestias consequuntur assumenda!</p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 py-4">
            <Select>
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
            <Input className="w-full sm:w-1/5" placeholder="Zipcode" />
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Social Health" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="social-support">Social Support</SelectItem>
                <SelectItem value="community-engagement">Community Engagement</SelectItem>
                <SelectItem value="relationships">Relationships</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Mental Health" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="therapy">Therapy</SelectItem>
                <SelectItem value="counseling">Counseling</SelectItem>
                <SelectItem value="support-groups">Support Groups</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Physical Health" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fitness">Fitness</SelectItem>
                <SelectItem value="nutrition">Nutrition</SelectItem>
                <SelectItem value="medical">Medical</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-center mt-4">
            <Button className="">
              GET STARTED
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MainSearch;