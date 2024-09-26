import { ObjectId } from "mongodb";
import { User as NextAuthUser } from "next-auth";

// Defining the image type
type ImageType = string;

// Interface for the MongoDB user object (stored in your database)
export interface IUserLogin {
  _id: ObjectId; // MongoDB uses ObjectId
  email: string;
  password: string;
  name?: string;
  image?: ImageType;
  emailVerified?: boolean;
}

// Interface for the user in NextAuth, extending NextAuth's User and adapting from MongoDB
export interface IUser extends NextAuthUser {
  password(currentPassword: string, password: string): unknown;
  id: string; // NextAuth expects a string ID, not ObjectId
  name?: string;
  email: string;
  image?: ImageType;
  emailVerified?: boolean;
  // Add any other custom properties that are specific to your app
}
