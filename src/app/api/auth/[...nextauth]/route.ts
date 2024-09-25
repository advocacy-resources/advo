import NextAuth, { NextAuthOptions, Session } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { compare } from "bcryptjs";

import prisma from "@/prisma/client"; // Adjust this import to match your Prisma client location
import { IUser } from "&/user"; // Make sure this interface matches your Prisma User model

interface ISession extends Session {
  user?: {
    id?: string;
  } & Session["user"];
}

const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials): Promise<IUser | null> => {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { username: credentials.username },
        });

        if (user && user.password) {
          const isValid = await compare(credentials.password, user.password);
          if (isValid) {
            return {
              id: user.id,
              name: user.name || undefined,
              email: user.email,
              image: user.image || undefined,
              emailVerified: user.emailVerified,
            };
          }
        }
        return null;
      },
    }),
  ],
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
    newUser: "/account",
  },
  callbacks: {
    async session({ session, token }): Promise<ISession> {
      const usession: ISession = session;

      if (usession.user) {
        usession.user.id = token.sub;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
