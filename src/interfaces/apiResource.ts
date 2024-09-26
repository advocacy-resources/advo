// src/interfaces/apiResource.ts

// Define the days of the week
export type DayOfWeek =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

// Define the structure of each day's hours in the API response
export interface ApiDayHours {
  day: DayOfWeek;
  open: string;
  close: string;
}

// Define the API response resource interface
export interface ApiResource {
  id: string;
  name: string;
  description: string;
  type: string[];
  category: string[];
  contact: {
    phone: string;
    email: string;
    website: string;
  };
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    latitude: number;
    longitude: number;
  };
  operatingHours: ApiDayHours[]; // Operating hours as an array
  eligibilityCriteria: string;
  servicesProvided: string[];
  targetAudience: string[];
  accessibilityFeatures: string[];
  cost: string;
  ratings: {
    averageRating: number;
    numberOfReviews: number;
  };
  geoLocation: {
    latitude: number;
    longitude: number;
  };
  policies: string[];
  tags: string[];
  createdAt: string; // Adjust to string if dates are strings in the API response
  updatedAt: string;
}
