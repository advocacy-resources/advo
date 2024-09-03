import { User as NextAuthUser } from "next-auth";

export interface User extends NextAuthUser {
  id: string;
  // Add any other custom properties your user object might have
}
