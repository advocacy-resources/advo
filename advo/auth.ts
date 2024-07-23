// pages/api/auth/[...nextauth].ts
import NextAuth, { SessionStrategy, User } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
import clientPromise from './src/lib/db';
import { compare } from 'bcryptjs';

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
      authorize: async (credentials): Promise<User | null> => {
        const client = await clientPromise;
        const db = client.db();

        const user = await db.collection('users').findOne({ username: credentials?.username });
        if (user && credentials?.password) {
          const isValid = await compare(credentials.password, user.password);
          if (isValid) {
            return { id: user._id.toString(), name: user.name, email: user.email };
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
    signIn: 'api/auth/signin',
  },
};

export default NextAuth(authOptions);