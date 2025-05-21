// File: src/app/api/auth/[...nextauth]/route.ts
// Purpose: NextAuth.js API route handler for authentication
// Owner: Advo Team

import NextAuth from "next-auth";
import { authOptions } from "@/lib/authOptions";

/**
 * NextAuth.js handler configured with the application's auth options
 * This handles all authentication-related API requests
 */
const handler = NextAuth(authOptions);

// Export the handler for both GET and POST methods
export { handler as GET, handler as POST };
