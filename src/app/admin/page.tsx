"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Card } from "@/components/ui/card";

// Dynamically import all components that use browser-specific APIs with no SSR
const DemographicsCharts = dynamic(
  () => import("@/components/admin/DemographicsCharts"),
  { ssr: false },
);

const GeographicDistribution = dynamic(
  () => import("@/components/admin/GeographicDistribution"),
  { ssr: false },
);

const ResourceInterestsPieChart = dynamic(
  () => import("@/components/admin/ResourceInterestsPieChart"),
  { ssr: false },
);

const ResourceLocationsMapCard = dynamic(
  () => import("@/components/admin/ResourceLocationsMapCard"),
  { ssr: false },
);

interface AnalyticsData {
  users: {
    total: number;
    active: number;
    frozen: number;
  };
  resources: {
    total: number;
  };
  demographics?: {
    ageGroups: { group: string; count: number }[];
    genders: { gender: string; count: number }[];
    raceEthnicity: { group: string; count: number }[];
    sexualOrientation: { orientation: string; count: number }[];
    resourceInterests: { interest: string; count: number }[];
    geographicDistribution: { state: string; count: number }[];
  };
}

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/v1/admin/analytics");

        if (!response.ok) {
          throw new Error("Failed to fetch analytics data");
        }

        const data = await response.json();
        setAnalytics(data);
        setError(null);
      } catch (err) {
        setError("Error loading analytics data. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  return (
    <div className="space-y-8">
      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 bg-gray-800 border-0 shadow-md">
          <h3 className="text-lg font-medium text-gray-400 mb-2">
            Total Users
          </h3>
          <div className="text-3xl font-bold text-white">
            {loading ? "..." : analytics?.users.total || 0}
          </div>
        </Card>

        <Card className="p-6 bg-gray-800 border-0 shadow-md">
          <h3 className="text-lg font-medium text-gray-400 mb-2">
            Active Users
          </h3>
          <div className="text-3xl font-bold text-green-500">
            {loading ? "..." : analytics?.users.active || 0}
          </div>
        </Card>

        <Card className="p-6 bg-gray-800 border-0 shadow-md">
          <h3 className="text-lg font-medium text-gray-400 mb-2">
            Frozen Users
          </h3>
          <div className="text-3xl font-bold text-red-500">
            {loading ? "..." : analytics?.users.frozen || 0}
          </div>
        </Card>

        <Card className="p-6 bg-gray-800 border-0 shadow-md">
          <h3 className="text-lg font-medium text-gray-400 mb-2">
            Total Resources
          </h3>
          <div className="text-3xl font-bold text-blue-500">
            {loading ? "..." : analytics?.resources.total || 0}
          </div>
        </Card>
      </div>

      {/* Demographics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {analytics?.demographics && (
          <>
            <DemographicsCharts
              data={analytics.demographics}
              loading={loading}
            />
            <ResourceInterestsPieChart
              data={analytics.demographics.resourceInterests}
              loading={loading}
            />
            <GeographicDistribution
              data={analytics.demographics.geographicDistribution}
              loading={loading}
            />
            <ResourceLocationsMapCard loading={loading} />
          </>
        )}
      </div>

      {/* Management Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/admin/resources">
          <Card className="p-6 bg-gray-800 hover:bg-gray-700 transition cursor-pointer border-0 shadow-md">
            <h2 className="text-2xl font-semibold mb-2 text-white">
              Resources Management
            </h2>
            <p className="text-gray-300">
              View, create, edit, and delete resources
            </p>
          </Card>
        </Link>

        <Link href="/admin/users">
          <Card className="p-6 bg-gray-800 hover:bg-gray-700 transition cursor-pointer border-0 shadow-md">
            <h2 className="text-2xl font-semibold mb-2 text-white">
              Users Management
            </h2>
            <p className="text-gray-300">
              View, edit, and manage user accounts
            </p>
          </Card>
        </Link>

        <Link href="/admin/recommendations">
          <Card className="p-6 bg-gray-800 hover:bg-gray-700 transition cursor-pointer border-0 shadow-md">
            <h2 className="text-2xl font-semibold mb-2 text-white">
              Recommendations
            </h2>
            <p className="text-gray-300">
              Review and manage resource recommendations
            </p>
          </Card>
        </Link>
      </div>

      {error && (
        <div className="bg-red-900 p-4 rounded text-white">{error}</div>
      )}
    </div>
  );
}
