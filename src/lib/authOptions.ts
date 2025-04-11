import { compare } from "bcryptjs";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/prisma/client";
import { IUser } from "@/interfaces/user";
import { isOtpVerificationEnabled } from "./feature-flags";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials): Promise<IUser | null> => {
        if (!credentials?.email || !credentials?.password) {
          console.log("Authorization failed: Missing email or password.");
          return null;
        }

        try {
          // Test database connection
          await prisma.user.count();

          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user) {
            console.log("Authorization failed: User not found.");
            return null;
          }

          if (!user.password) {
            console.log("Authorization failed: No password set for user.");
            return null;
          }

          const isValid = await compare(credentials.password, user.password);

          // Check if user account is active
          if (!user.isActive) {
            console.log("Authorization failed: User account is frozen.");
            return null;
          }
          
          // Check if email is verified (only if OTP verification is enabled)
          if (isOtpVerificationEnabled() && !user.isEmailVerified) {
            console.log("Authorization failed: Email not verified.");
            throw new Error("Please verify your email before signing in.");
          }

          if (isValid) {
            console.log("Authorization successful.");
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
              isActive: user.isActive,
            } as IUser;
          } else {
            console.log("Authorization failed: Invalid password.");
          }
        } catch (error) {
          console.error(
            "Authorization failed: Error during authorization.",
            error,
          );
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      // Fetch the user to get the role and active status
      const user = await prisma.user.findUnique({
        where: { id: token.sub as string },
        select: { id: true, role: true, isActive: true },
      });

      session.user = {
        ...session.user,
        id: token.sub as string,
        role: user?.role || "user",
        isActive: user?.isActive ?? true,
      };
      return session;
    },
    async jwt({ token }) {
      return token;
    },
  },
  debug: process.env.NODE_ENV === "development", // Enable debug only in development
};

export default authOptions;
