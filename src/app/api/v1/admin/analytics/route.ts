import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import prisma from "@/prisma/client";
import { authOptions } from "@/lib/authOptions";

export const dynamic = "force-dynamic";

// Helper function to check admin role
async function checkAdminRole() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    return false;
  }

  return true;
}

// Helper function to check if user is admin or business representative
async function checkAdminOrBusinessRepRole() {
  const session = await getServerSession(authOptions);

  if (
    !session ||
    (session.user.role !== "admin" && session.user.role !== "business_rep")
  ) {
    return false;
  }

  return true;
}

// GET handler for fetching analytics data
export async function GET(request: NextRequest) {
  try {
    // Check if user is admin or business representative
    const isAuthorized = await checkAdminOrBusinessRepRole();
    if (!isAuthorized) {
      return NextResponse.json(
        {
          error:
            "Unauthorized. Admin or Business Representative access required.",
        },
        { status: 403 },
      );
    }

    // Fetch counts and demographic data
    const [
      userCount,
      resourceCount,
      activeUserCount,
      frozenUserCount,
      ageGroupData,
      genderData,
      raceEthnicityData,
      sexualOrientationData,
      resourceInterestsData,
      stateDistributionData,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.resource.count(),
      prisma.user.count({
        where: { isActive: true },
      }),
      prisma.user.count({
        where: { isActive: false },
      }),
      // Age group breakdown - get all users with age group
      prisma.user.findMany({
        where: {
          ageGroup: { not: null },
        },
        select: {
          ageGroup: true,
        },
      }),
      // Gender breakdown - get all users with gender
      prisma.user.findMany({
        where: {
          gender: { not: null },
        },
        select: {
          gender: true,
        },
      }),
      // Race/ethnicity breakdown - get all users with race/ethnicity
      prisma.user.findMany({
        where: {
          raceEthnicity: { not: null },
        },
        select: {
          raceEthnicity: true,
        },
      }),
      // Sexual orientation breakdown - get all users with sexual orientation
      prisma.user.findMany({
        where: {
          sexualOrientation: { not: null },
        },
        select: {
          sexualOrientation: true,
        },
      }),
      // Resource interests - get all users with resource interests
      prisma.user.findMany({
        where: {
          resourceInterests: {
            isEmpty: false,
          },
        },
        select: {
          resourceInterests: true,
        },
      }),
      // Get users with zipcode data and demographic information
      prisma.user.findMany({
        where: {
          zipcode: {
            not: null,
          },
        },
        select: {
          zipcode: true,
          state: true,
          ageGroup: true,
          gender: true,
          raceEthnicity: true,
          sexualOrientation: true,
          resourceInterests: true,
        },
      }),
    ]);

    // Process demographic data to get counts
    // Process state distribution data
    // Map of first digit of zipcode to state (simplified mapping)
    const zipcodeToState: Record<string, string> = {
      "0": "NY",
      "1": "NY",
      "2": "VA",
      "3": "FL",
      "4": "MI",
      "5": "TX",
      "6": "IL",
      "7": "TX",
      "8": "CO",
      "9": "CA",
    };

    // Initialize state distribution with demographic data
    interface StateDemographics {
      count: number;
      demographics: {
        ageGroups: Record<string, number>;
        genders: Record<string, number>;
        raceEthnicity: Record<string, number>;
        sexualOrientation: Record<string, number>;
        resourceInterests: Record<string, number>;
      };
    }

    const stateDistribution: Record<string, StateDemographics> = {
      CA: {
        count: 0,
        demographics: {
          ageGroups: {},
          genders: {},
          raceEthnicity: {},
          sexualOrientation: {},
          resourceInterests: {},
        },
      },
      TX: {
        count: 0,
        demographics: {
          ageGroups: {},
          genders: {},
          raceEthnicity: {},
          sexualOrientation: {},
          resourceInterests: {},
        },
      },
      NY: {
        count: 0,
        demographics: {
          ageGroups: {},
          genders: {},
          raceEthnicity: {},
          sexualOrientation: {},
          resourceInterests: {},
        },
      },
      FL: {
        count: 0,
        demographics: {
          ageGroups: {},
          genders: {},
          raceEthnicity: {},
          sexualOrientation: {},
          resourceInterests: {},
        },
      },
      IL: {
        count: 0,
        demographics: {
          ageGroups: {},
          genders: {},
          raceEthnicity: {},
          sexualOrientation: {},
          resourceInterests: {},
        },
      },
      WA: {
        count: 0,
        demographics: {
          ageGroups: {},
          genders: {},
          raceEthnicity: {},
          sexualOrientation: {},
          resourceInterests: {},
        },
      },
      CO: {
        count: 0,
        demographics: {
          ageGroups: {},
          genders: {},
          raceEthnicity: {},
          sexualOrientation: {},
          resourceInterests: {},
        },
      },
      GA: {
        count: 0,
        demographics: {
          ageGroups: {},
          genders: {},
          raceEthnicity: {},
          sexualOrientation: {},
          resourceInterests: {},
        },
      },
      MI: {
        count: 0,
        demographics: {
          ageGroups: {},
          genders: {},
          raceEthnicity: {},
          sexualOrientation: {},
          resourceInterests: {},
        },
      },
      OH: {
        count: 0,
        demographics: {
          ageGroups: {},
          genders: {},
          raceEthnicity: {},
          sexualOrientation: {},
          resourceInterests: {},
        },
      },
      VA: {
        count: 0,
        demographics: {
          ageGroups: {},
          genders: {},
          raceEthnicity: {},
          sexualOrientation: {},
          resourceInterests: {},
        },
      },
    };

    stateDistributionData.forEach((user: any) => {
      if (user.zipcode) {
        // Determine the state code
        let stateCode: string;

        // If we have a state directly, use it
        if (user.state) {
          stateCode = user.state;
        }
        // Otherwise try to derive state from zipcode
        else {
          const firstDigit = user.zipcode.charAt(0);
          stateCode = zipcodeToState[firstDigit] || "IL";
        }

        // Initialize state if it doesn't exist
        if (!stateDistribution[stateCode]) {
          stateDistribution[stateCode] = {
            count: 0,
            demographics: {
              ageGroups: {},
              genders: {},
              raceEthnicity: {},
              sexualOrientation: {},
              resourceInterests: {},
            },
          };
        }

        // Increment count
        stateDistribution[stateCode].count += 1;

        // Add demographic data
        if (user.ageGroup) {
          stateDistribution[stateCode].demographics.ageGroups[user.ageGroup] =
            (stateDistribution[stateCode].demographics.ageGroups[
              user.ageGroup
            ] || 0) + 1;
        }

        if (user.gender) {
          stateDistribution[stateCode].demographics.genders[user.gender] =
            (stateDistribution[stateCode].demographics.genders[user.gender] ||
              0) + 1;
        }

        if (user.raceEthnicity) {
          stateDistribution[stateCode].demographics.raceEthnicity[
            user.raceEthnicity
          ] =
            (stateDistribution[stateCode].demographics.raceEthnicity[
              user.raceEthnicity
            ] || 0) + 1;
        }

        if (user.sexualOrientation) {
          stateDistribution[stateCode].demographics.sexualOrientation[
            user.sexualOrientation
          ] =
            (stateDistribution[stateCode].demographics.sexualOrientation[
              user.sexualOrientation
            ] || 0) + 1;
        }

        if (user.resourceInterests && user.resourceInterests.length > 0) {
          user.resourceInterests.forEach((interest: string) => {
            stateDistribution[stateCode].demographics.resourceInterests[
              interest
            ] =
              (stateDistribution[stateCode].demographics.resourceInterests[
                interest
              ] || 0) + 1;
          });
        }
      }
    });

    // No random data - only use real data from the database
    const stateDistributionChartData = Object.entries(stateDistribution)
      .filter(([_, data]) => data.count > 0) // Only include states with data
      .map(([state, data]) => ({
        state,
        count: data.count,
        demographics: data.demographics,
      }))
      .sort((a, b) => b.count - a.count);

    // Age groups
    const ageGroupCounts: Record<string, number> = {};
    ageGroupData.forEach((user: any) => {
      if (user.ageGroup) {
        const group = user.ageGroup;
        ageGroupCounts[group] = (ageGroupCounts[group] || 0) + 1;
      }
    });

    // Gender
    const genderCounts: Record<string, number> = {};
    genderData.forEach((user: any) => {
      if (user.gender) {
        const gender = user.gender;
        genderCounts[gender] = (genderCounts[gender] || 0) + 1;
      }
    });

    // Race/ethnicity
    const raceEthnicityCounts: Record<string, number> = {};
    raceEthnicityData.forEach((user: any) => {
      if (user.raceEthnicity) {
        const group = user.raceEthnicity;
        raceEthnicityCounts[group] = (raceEthnicityCounts[group] || 0) + 1;
      }
    });

    // Sexual orientation
    const sexualOrientationCounts: Record<string, number> = {};
    sexualOrientationData.forEach((user: any) => {
      if (user.sexualOrientation) {
        const orientation = user.sexualOrientation;
        sexualOrientationCounts[orientation] =
          (sexualOrientationCounts[orientation] || 0) + 1;
      }
    });

    // Resource interests
    const interestCounts: Record<string, number> = {};
    resourceInterestsData.forEach((user: any) => {
      if (user.resourceInterests) {
        user.resourceInterests.forEach((interest: string) => {
          interestCounts[interest] = (interestCounts[interest] || 0) + 1;
        });
      }
    });

    // Convert to arrays for charts
    const ageGroupChartData = Object.entries(ageGroupCounts)
      .map(([group, count]) => ({ group, count }))
      .sort((a, b) => b.count - a.count);

    const genderChartData = Object.entries(genderCounts)
      .map(([gender, count]) => ({ gender, count }))
      .sort((a, b) => b.count - a.count);

    const raceEthnicityChartData = Object.entries(raceEthnicityCounts)
      .map(([group, count]) => ({ group, count }))
      .sort((a, b) => b.count - a.count);

    const sexualOrientationChartData = Object.entries(sexualOrientationCounts)
      .map(([orientation, count]) => ({ orientation, count }))
      .sort((a, b) => b.count - a.count);

    const resourceInterestsChartData = Object.entries(interestCounts)
      .map(([interest, count]) => ({ interest, count }))
      .sort((a, b) => b.count - a.count);

    // Return analytics data
    return NextResponse.json({
      users: {
        total: userCount,
        active: activeUserCount,
        frozen: frozenUserCount,
      },
      resources: {
        total: resourceCount,
      },
      demographics: {
        ageGroups: ageGroupChartData,
        genders: genderChartData,
        raceEthnicity: raceEthnicityChartData,
        sexualOrientation: sexualOrientationChartData,
        resourceInterests: resourceInterestsChartData,
        geographicDistribution: stateDistributionChartData,
      },
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics data" },
      { status: 500 },
    );
  }
}
