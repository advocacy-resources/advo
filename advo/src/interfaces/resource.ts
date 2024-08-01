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