import { User } from 'next-auth';
import { IUser } from '../interfaces/user'; // Make sure to define and import the User interface accordingly

export interface Account extends User {
  id: string;
  userId: string;
  type: string;
  provider: string;
  providerAccountId: string;
  refreshToken?: string;
  accessToken?: string;
  expiresAt?: number;
  tokenType?: string;
  scope?: string;
  idToken?: string;
  sessionState?: string;
  user: User;
}