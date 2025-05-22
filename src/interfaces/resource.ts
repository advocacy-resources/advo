// File: src/interfaces/resource.ts
// Purpose: Type definitions for resource-related data structures used throughout the application.
// Owner: Advo Team

/**
 * Contact information for a resource.
 * Contains methods for users to get in touch with the resource provider.
 */
export interface Contact {
  phone: string;
  email: string;
  website: string;
}

/**
 * Physical address information for a resource.
 * Used for displaying location and for geocoding on maps.
 */
export interface Address {
  street: string;
  city: string;
  state: string;
  zip?: string;
}

/**
 * Operating hours for a resource by day of the week.
 * Each day has an opening and closing time in 24-hour format.
 */
export interface OperatingHours {
  monday: { open: string; close: string };
  tuesday: { open: string; close: string };
  wednesday: { open: string; close: string };
  thursday: { open: string; close: string };
  friday: { open: string; close: string };
  saturday: { open: string; close: string };
  sunday: { open: string; close: string };
}
/**
 * User review for a resource.
 * Contains the review content and metadata about the reviewer.
 */
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

/**
 * Information about a business representative who manages a resource.
 * Used for business accounts that can update their own resource information.
 */
export interface ResourceOwner {
  id: string;
  name: string | null;
  email: string;
}

/**
 * Main resource interface representing a service or organization.
 * Contains all information about a resource including contact details,
 * location, operating hours, and metadata.
 */
export interface Resource {
  id?: string;
  _id?: {
    $oid: string;
  };
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
  verified?: boolean; // Whether the resource has been verified by an admin
  profilePhoto?: string; // Binary data in base64 format for display (legacy)
  profilePhotoType?: string; // MIME type of the profile photo
  bannerImage?: string; // Binary data in base64 format for display (legacy)
  bannerImageType?: string; // MIME type of the banner image
  profilePhotoUrl?: string; // Cloud storage URL to the profile photo
  bannerImageUrl?: string; // Cloud storage URL to the banner image
  reviews?: Review[];
  owner?: ResourceOwner | null; // Business representative who manages this resource
}
