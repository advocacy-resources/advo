export interface Resource {
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
  operatingHours: {
    mondayOpen: string | number | readonly string[] | undefined;
    mondayClose: string | number | readonly string[] | undefined;
    tuesdayClose: string | number | readonly string[] | undefined;
    wednesdayOpen: string | number | readonly string[] | undefined;
    wednesdayClose: string | number | readonly string[] | undefined;
    thursdayOpen: string | number | readonly string[] | undefined;
    thursdayClose: string | number | readonly string[] | undefined;
    fridayOpen: string | number | readonly string[] | undefined;
    fridayClose: string | number | readonly string[] | undefined;
    saturdayOpen: string | number | readonly string[] | undefined;
    saturdayClose: string | number | readonly string[] | undefined;
    sundayOpen: string | number | readonly string[] | undefined;
    sundayClose: string | number | readonly string[] | undefined;
    tuesdayOpen: string | number | readonly string[] | undefined;
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
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
  createdAt: Date;
  updatedAt: Date;
}
