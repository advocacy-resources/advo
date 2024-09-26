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
        console.log("Authorize function called");
        if (!credentials?.email || !credentials?.password) {
          console.log("Missing email or password");
          return null;
        }

        try {
          console.log(
            `Attempting to find user with email: ${credentials.email}`,
          );
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user) {
            console.log(`No user found with email: ${credentials.email}`);
            return null;
          }

          console.log(`User found: ${user.id}`);

          if (!user.password) {
            console.log(`User ${user.id} has no password set`);
            return null;
          }

          console.log("Comparing passwords");
          const isValid = await compare(credentials.password, user.password);

          if (isValid) {
            console.log(`Password valid for user: ${user.id}`);
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              image: user.image || undefined,
            } as IUser;
          } else {
            console.log(`Invalid password for user: ${user.id}`);
          }
        } catch (error) {
          console.error("Error in authorize function:", error);
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      console.log("Session callback called");
      session.user = {
        ...session.user,
        id: token.sub as string,
      };
      return session;
    },
    async jwt({ token, user }) {
      console.log("JWT callback called");
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
  debug: true, // Enable debug messages
};

export default authOptions;
