import { ObjectId } from "mongodb"
import { User } from "next-auth"

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
