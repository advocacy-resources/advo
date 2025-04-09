export interface Contact {
  phone: string;
  email: string;
  website: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zip?: string;
}

export interface OperatingHours {
  monday: { open: string; close: string };
  tuesday: { open: string; close: string };
  wednesday: { open: string; close: string };
  thursday: { open: string; close: string };
  friday: { open: string; close: string };
  saturday: { open: string; close: string };
  sunday: { open: string; close: string };
}
export interface Review {
  id: string;
  userId: string;
  resourceId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  User?: {
    name: string;
  };
}

export interface Resource {
  id: string;
  name: string;
  description: string;
  category: string[];
  contact: Contact;
  address: Address;
  operatingHours: OperatingHours;
  createdAt: Date;
  updatedAt: Date;
  favoriteCount: number;
  upvoteCount?: number;
  profilePhoto?: any; // Binary data in base64 format for display (legacy)
  profilePhotoType?: string; // MIME type
  bannerImage?: any; // Binary data in base64 format for display (legacy)
  bannerImageType?: string; // MIME type
  profilePhotoUrl?: string; // URL to the profile photo
  bannerImageUrl?: string; // URL to the banner image
  reviews?: Review[];
}
