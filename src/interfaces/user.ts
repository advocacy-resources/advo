import { ObjectId } from "mongodb";
import { User as NextAuthUser } from "next-auth";

// Defining the image type
type ImageType = string;

// Interface for the MongoDB user object (stored in your database)
export interface IUserLogin {
  _id: ObjectId; // MongoDB uses ObjectId
  email: string;
  phone?: string;
  password: string;
  name?: string;
  image?: ImageType;
  emailVerified?: boolean;
  role?: string; // Added role field
  isActive?: boolean; // Added isActive field
}

// Interface for the user in NextAuth, extending NextAuth's User and adapting from MongoDB
export interface IUser extends NextAuthUser {
  password(currentPassword: string, password: string): unknown;
  id: string; // NextAuth expects a string ID, not ObjectId
  name?: string;
  email: string;
  image?: ImageType;
  emailVerified?: boolean;
  role?: string; // Can be "user", "admin", or "business_rep"
  managedResourceId?: string; // Resource ID that a business representative manages
  isActive?: boolean; // Added isActive field
  createdAt?: Date | string; // Added createdAt field
  updatedAt?: Date | string; // Added updatedAt field
  // Demographic information
  ageGroup?: string;
  raceEthnicity?: string;
  gender?: string;
  pronoun1?: string;
  pronoun2?: string;
  sexualOrientation?: string;
  incomeBracket?: string;
  livingSituation?: string;
  livingArrangement?: string;
  zipcode?: string;
  state?: string;
  resourceInterests?: string[];
  // Add any other custom properties that are specific to your app
}
