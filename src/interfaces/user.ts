import { ObjectId } from "mongodb";
import { User as NextAuthUser } from "next-auth";

type ImageType = string;

export interface IUser extends User {
  id: string;
  name?: string;
  email: string;
  image?: ImageType;
  emailVerified?: boolean;
}

export interface IUserLogin {
  _id: ObjectId;
  email: string;
  password: string;
  name?: string;
  image?: ImageType;
  emailVerified?: boolean;
}

export interface User extends NextAuthUser {
  id: string;
  // Add any other custom properties your user object might have
}
