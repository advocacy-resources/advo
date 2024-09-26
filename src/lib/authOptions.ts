import { compare } from "bcryptjs";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/prisma/client";
import { IUser } from "@/interfaces/user";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials): Promise<IUser | null> => {
        console.log("Authorization attempt started.");

        if (!credentials?.email || !credentials?.password) {
          console.log("Authorization failed: Missing email or password.");
          return null;
        }

        try {
          // Test database connection
          await prisma.user.count();
          console.log("Database connection successful.");

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

          if (isValid) {
            console.log("Authorization successful.");
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              image: user.image || undefined,
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
      console.log("Session creation process started.");
      session.user = {
        ...session.user,
        id: token.sub as string,
      };
      return session;
    },
    async jwt({ token, user }) {
      console.log("JWT creation process started.");
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
  debug: process.env.NODE_ENV === "development", // Enable debug only in development
};

export default authOptions;
