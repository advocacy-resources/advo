// src/types/next-auth.d.ts
import NextAuth from "next-auth";

// Extend the default Session and User types with the custom properties (e.g., `id`)
declare module "next-auth" {
  interface Session {
    user: {
      id: string; // Add the id property to the Session user object
      name?: string;
      email?: string;
      image?: string;
      role?: string; // Add the role property to the Session user object
      isActive?: boolean; // Add the isActive property to the Session user object
      managedResourceId?: string | null; // Add the managedResourceId property for business representatives
    };
  }

  interface User {
    id: string; // Add the id property to the User object
    name?: string;
    email?: string;
    image?: string;
    role?: string; // Add the role property to the User object
    isActive?: boolean; // Add the isActive property to the User object
    managedResourceId?: string | null; // Add the managedResourceId property for business representatives
  }
}
