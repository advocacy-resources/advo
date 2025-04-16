"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ChartData {
  group?: string;
  gender?: string;
  orientation?: string;
  interest?: string;
  count: number;
}

interface DemographicsData {
  ageGroups: ChartData[];
  genders: ChartData[];
  raceEthnicity: ChartData[];
  sexualOrientation: ChartData[];
  resourceInterests: ChartData[];
}

interface DemographicsChartsProps {
  data: DemographicsData;
  loading: boolean;
}

const DemographicsCharts: React.FC<DemographicsChartsProps> = ({
  data,
  loading,
}) => {
  const [activeTab, setActiveTab] = useState("age");

  // Function to calculate percentage
  const calculatePercentage = (count: number, total: number) => {
    return total > 0 ? Math.round((count / total) * 100) : 0;
  };

  // Calculate totals for each category
  const totalAge =
    data?.ageGroups?.reduce((sum, item) => sum + item.count, 0) || 0;
  const totalGender =
    data?.genders?.reduce((sum, item) => sum + item.count, 0) || 0;
  const totalRace =
    data?.raceEthnicity?.reduce((sum, item) => sum + item.count, 0) || 0;
  const totalOrientation =
    data?.sexualOrientation?.reduce((sum, item) => sum + item.count, 0) || 0;

  // Get top 10 resource interests
  const topInterests = data?.resourceInterests?.slice(0, 10) || [];

  return (
    <Card className="p-6 bg-gray-800 border-0 shadow-md">
      <h2 className="text-xl font-bold text-white mb-4">User Demographics</h2>

      <Tabs defaultValue="age" onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5 mb-6">
          <TabsTrigger value="age">Age Groups</TabsTrigger>
          <TabsTrigger value="gender">Gender</TabsTrigger>
          <TabsTrigger value="race">Race/Ethnicity</TabsTrigger>
          <TabsTrigger value="orientation">Sexual Orientation</TabsTrigger>
          <TabsTrigger value="interests">Resource Interests</TabsTrigger>
        </TabsList>

        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <p className="text-gray-400">Loading demographic data...</p>
          </div>
        ) : (
          <>
            <TabsContent value="age" className="mt-0">
              <div className="h-64 overflow-y-auto">
                {data?.ageGroups?.map((item, index) => (
                  <div key={index} className="mb-3">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-300">
                        {item.group}
                      </span>
                      <span className="text-sm text-gray-300">
                        {item.count} (
                        {calculatePercentage(item.count, totalAge)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                      <div
                        className="bg-gradient-to-r from-pink-500 to-orange-400 h-2.5 rounded-full"
                        style={{
                          width: `${calculatePercentage(item.count, totalAge)}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="gender" className="mt-0">
              <div className="h-64 overflow-y-auto">
                {data?.genders?.map((item, index) => (
                  <div key={index} className="mb-3">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-300">
                        {item.gender}
                      </span>
                      <span className="text-sm text-gray-300">
                        {item.count} (
                        {calculatePercentage(item.count, totalGender)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-400 h-2.5 rounded-full"
                        style={{
                          width: `${calculatePercentage(item.count, totalGender)}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="race" className="mt-0">
              <div className="h-64 overflow-y-auto">
                {data?.raceEthnicity?.map((item, index) => (
                  <div key={index} className="mb-3">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-300">
                        {item.group}
                      </span>
                      <span className="text-sm text-gray-300">
                        {item.count} (
                        {calculatePercentage(item.count, totalRace)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                      <div
                        className="bg-gradient-to-r from-green-500 to-teal-400 h-2.5 rounded-full"
                        style={{
                          width: `${calculatePercentage(item.count, totalRace)}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="orientation" className="mt-0">
              <div className="h-64 overflow-y-auto">
                {data?.sexualOrientation?.map((item, index) => (
                  <div key={index} className="mb-3">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-300">
                        {item.orientation}
                      </span>
                      <span className="text-sm text-gray-300">
                        {item.count} (
                        {calculatePercentage(item.count, totalOrientation)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-pink-400 h-2.5 rounded-full"
                        style={{
                          width: `${calculatePercentage(item.count, totalOrientation)}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="interests" className="mt-0">
              <div className="h-64 overflow-y-auto">
                <h3 className="text-sm font-medium text-gray-400 mb-3">
                  Top Resource Interests
                </h3>
                {topInterests.map((item, index) => (
                  <div key={index} className="mb-3">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-300">
                        {item.interest}
                      </span>
                      <span className="text-sm text-gray-300">
                        {item.count}
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                      <div
                        className="bg-gradient-to-r from-yellow-500 to-red-400 h-2.5 rounded-full"
                        style={{
                          width: `${calculatePercentage(item.count, topInterests[0]?.count || 1) * 0.8 + 20}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </>
        )}
      </Tabs>
    </Card>
  );
};

export default DemographicsCharts;
