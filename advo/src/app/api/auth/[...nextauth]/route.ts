// app/api/auth/[...nextauth]/route.ts
import NextAuth, { SessionStrategy } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
import { compare } from 'bcryptjs';

import clientPromise from '@/lib/db';
import { IUser, IUserLogin } from "&/user";

const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials): Promise<IUser | null> => {
        const client = await clientPromise;
        const db = client.db();

        const user: IUserLogin | null = await db.collection('users').findOne({ username: credentials?.username }) as unknown as IUserLogin | null;
        if (user && credentials?.password) {
          const isValid = await compare(credentials.password, user.password);
          if (isValid) {
            return {
              id: user._id.toString(),
              name: user.name,
              email: user.email,
              image: user.image,
              emailVerified: user.emailVerified,
            };
          }
        }
        return null;
      },
    }),
  ],
  adapter: MongoDBAdapter(Promise.resolve(clientPromise)),
  secret: process.env.SECRET,
  session: {
    strategy: 'jwt' as SessionStrategy,
  },
  pages: {
    signIn: '/auth/signin',
    newUser: '/account',
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };