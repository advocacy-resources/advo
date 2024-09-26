import { compare } from "bcryptjs";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/prisma/client"; // Adjust to your client location
import { IUser } from "@/interfaces/user"; // Import your IUser interface

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
          return null;
        }

        // Find user in the database using the email
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        // If user is found and user.password exists and is valid
        if (user && user.password && credentials.password) {
          const isValid = await compare(credentials.password, user.password);
          if (isValid) {
            // Return the user object adhering to the IUser interface
            return {
              id: user.id, // Assuming Prisma uses string id
              name: user.name,
              email: user.email,
              image: user.image || undefined,
            } as IUser;
          }
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      // Ensure the session user includes the id
      session.user = {
        ...session.user,
        id: token.sub as string, // Add the id to session.user
      };
      return session;
    },
    async jwt({ token, user }) {
      // Add the user id to the JWT token
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
};

export default authOptions;
