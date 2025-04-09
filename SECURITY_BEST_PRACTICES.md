# Security Best Practices

This document outlines security best practices and recommendations for the Advo application. It focuses specifically on security concerns and provides concrete steps to enhance the application's security posture.

## Table of Contents

1. [Authentication Security](#authentication-security)
2. [API Security](#api-security)
3. [Database Security](#database-security)
4. [Frontend Security](#frontend-security)
5. [Infrastructure Security](#infrastructure-security)
6. [Compliance Considerations](#compliance-considerations)
7. [Security Monitoring](#security-monitoring)

## Authentication Security

### Current State

The application uses NextAuth.js for authentication but has some potential security issues:

- Debug mode is enabled in production
- Password policies may not be sufficiently robust
- Session management could be improved

### Recommendations

#### 1. Disable Debug Mode in Production

```typescript
// lib/authOptions.ts
export const authOptions: NextAuthOptions = {
  // ...
  debug: process.env.NODE_ENV === 'development',
  // ...
};
```

#### 2. Enhance Password Policies

Implement stronger password requirements:

```typescript
// utils/password.ts
export function isStrongPassword(password: string): boolean {
  // At least 8 characters
  if (password.length < 8) return false;
  
  // At least one uppercase letter
  if (!/[A-Z]/.test(password)) return false;
  
  // At least one lowercase letter
  if (!/[a-z]/.test(password)) return false;
  
  // At least one number
  if (!/[0-9]/.test(password)) return false;
  
  // At least one special character
  if (!/[^A-Za-z0-9]/.test(password)) return false;
  
  return true;
}
```

Use this in registration and password change flows:

```typescript
// app/api/auth/signup/route.ts
import { isStrongPassword } from '@/utils/password';

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json();
    
    if (!isStrongPassword(password)) {
      return NextResponse.json(
        {
          error: 'Password does not meet security requirements',
          details: 'Password must be at least 8 characters and include uppercase, lowercase, numbers, and special characters',
        },
        { status: 400 }
      );
    }
    
    // Continue with user creation
    // ...
  } catch (error) {
    // Error handling
  }
}
```

#### 3. Implement Account Lockout

Add protection against brute force attacks:

```typescript
// utils/rate-limit.ts
import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || '');

export async function checkLoginRateLimit(
  identifier: string,
  maxAttempts = 5,
  windowMs = 15 * 60 * 1000
): Promise<{ limited: boolean; attemptsLeft: number }> {
  const key = `login:${identifier}`;
  
  // Get current attempts
  const attempts = await redis.get(key);
  const currentAttempts = attempts ? parseInt(attempts, 10) : 0;
  
  if (currentAttempts >= maxAttempts) {
    return { limited: true, attemptsLeft: 0 };
  }
  
  // Increment attempts
  await redis.incr(key);
  
  // Set expiry if not already set
  if (currentAttempts === 0) {
    await redis.expire(key, Math.floor(windowMs / 1000));
  }
  
  return {
    limited: false,
    attemptsLeft: maxAttempts - (currentAttempts + 1),
  };
}

export async function resetLoginAttempts(identifier: string): Promise<void> {
  const key = `login:${identifier}`;
  await redis.del(key);
}
```

Integrate with NextAuth:

```typescript
// lib/authOptions.ts
import { checkLoginRateLimit, resetLoginAttempts } from '@/utils/rate-limit';

export const authOptions: NextAuthOptions = {
  // ...
  callbacks: {
    // ...
  },
  events: {
    async signIn({ user }) {
      // Reset login attempts on successful login
      if (user.email) {
        await resetLoginAttempts(user.email);
      }
    },
  },
  providers: [
    CredentialsProvider({
      // ...
      async authorize(credentials) {
        try {
          const { email, password } = credentials as {
            email: string;
            password: string;
          };
          
          // Check rate limiting
          const { limited, attemptsLeft } = await checkLoginRateLimit(email);
          
          if (limited) {
            throw new Error('Too many login attempts. Try again later.');
          }
          
          // Continue with authentication
          // ...
        } catch (error) {
          // Error handling
          return null;
        }
      },
    }),
    // Other providers...
  ],
};
```

#### 4. Implement Secure Session Management

Configure NextAuth for secure sessions:

```typescript
// lib/authOptions.ts
export const authOptions: NextAuthOptions = {
  // ...
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    maxAge: 24 * 60 * 60, // 24 hours
  },
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
    // Other cookies...
  },
  // ...
};
```

## API Security

### Current State

The API endpoints may be vulnerable to various attacks:

- Lack of rate limiting
- Potential for CSRF attacks
- Inconsistent input validation

### Recommendations

#### 1. Implement API Rate Limiting

Create a rate limiting middleware:

```typescript
// middleware/rate-limit.ts
import { NextRequest, NextResponse } from 'next/server';
import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || '');

export async function rateLimit(
  req: NextRequest,
  { limit = 100, windowMs = 60 * 1000 } = {}
) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  const key = `ratelimit:${ip}:${req.nextUrl.pathname}`;
  
  // Get current count
  const current = await redis.get(key);
  const count = current ? parseInt(current, 10) : 0;
  
  // Check if over limit
  if (count >= limit) {
    return NextResponse.json(
      { error: 'Too many requests', code: 'RATE_LIMIT_EXCEEDED' },
      { status: 429, headers: { 'Retry-After': String(windowMs / 1000) } }
    );
  }
  
  // Increment count
  await redis.incr(key);
  
  // Set expiry if not already set
  if (count === 0) {
    await redis.expire(key, Math.floor(windowMs / 1000));
  }
  
  // Continue with the request
  return null;
}
```

Use the middleware in API routes:

```typescript
// app/api/v1/resources/route.ts
import { rateLimit } from '@/middleware/rate-limit';

export async function GET(req: NextRequest) {
  // Check rate limit
  const rateLimitResult = await rateLimit(req, { limit: 50, windowMs: 60 * 1000 });
  
  if (rateLimitResult) {
    return rateLimitResult;
  }
  
  // Continue with the request
  // ...
}
```

#### 2. Implement CSRF Protection

Add CSRF protection to forms and API endpoints:

```typescript
// middleware/csrf.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

export async function csrfProtection(req: NextRequest) {
  // Skip for GET, HEAD, OPTIONS requests
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return null;
  }
  
  // Check CSRF token
  const csrfToken = req.headers.get('x-csrf-token');
  const session = await getServerSession(authOptions);
  
  if (!session || !csrfToken || csrfToken !== session.csrfToken) {
    return NextResponse.json(
      { error: 'Invalid CSRF token', code: 'INVALID_CSRF_TOKEN' },
      { status: 403 }
    );
  }
  
  // Continue with the request
  return null;
}
```

Generate and include CSRF tokens in forms:

```typescript
// utils/csrf.ts
import crypto from 'crypto';

export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString('hex');
}
```

```tsx
// components/forms/ResourceForm.tsx
'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';

export default function ResourceForm() {
  const { data: session } = useSession();
  const [formData, setFormData] = useState({
    // Form fields
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/v1/resources', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': session?.csrfToken || '',
        },
        body: JSON.stringify(formData),
      });
      
      // Handle response
    } catch (error) {
      // Handle error
    }
  };
  
  // Form JSX
}
```

#### 3. Implement Comprehensive Input Validation

Use Zod for input validation:

```typescript
// schemas/resource.ts
import { z } from 'zod';

export const ResourceSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().min(1, 'Description is required').max(1000),
  category: z.array(z.string()).min(1, 'At least one category is required'),
  contact: z.object({
    phone: z.string().optional(),
    email: z.string().email('Invalid email address').optional(),
    website: z.string().url('Invalid website URL').optional(),
  }).refine(data => data.phone || data.email || data.website, {
    message: 'At least one contact method is required',
  }),
  // Other fields
});

export type ResourceInput = z.infer<typeof ResourceSchema>;
```

Use the schema in API routes:

```typescript
// app/api/v1/resources/route.ts
import { ResourceSchema } from '@/schemas/resource';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate input
    const result = ResourceSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        {
          error: 'Invalid resource data',
          details: result.error.format(),
        },
        { status: 400 }
      );
    }
    
    const validatedData = result.data;
    
    // Process the validated data
    // ...
  } catch (error) {
    // Error handling
  }
}
```

## Database Security

### Current State

The database connection and queries may have security vulnerabilities:

- Potential for SQL injection (though mitigated by Prisma)
- Lack of data sanitization
- Overfetching of data

### Recommendations

#### 1. Implement Database Connection Pooling

Configure Prisma for connection pooling:

```typescript
// prisma/client.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    // Configure connection pool
    connectionLimit: 5,
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
```

#### 2. Implement Data Sanitization

Create utility functions for data sanitization:

```typescript
// utils/sanitize.ts
import DOMPurify from 'isomorphic-dompurify';

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
  });
}

export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const result = { ...obj };
  
  for (const [key, value] of Object.entries(result)) {
    if (typeof value === 'string') {
      result[key] = value.trim() as any;
    } else if (typeof value === 'object' && value !== null) {
      result[key] = sanitizeObject(value) as any;
    }
  }
  
  return result;
}
```

Use sanitization before storing data:

```typescript
// app/api/v1/resources/route.ts
import { sanitizeObject } from '@/utils/sanitize';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate input
    const result = ResourceSchema.safeParse(body);
    
    if (!result.success) {
      // Handle validation error
    }
    
    // Sanitize data
    const sanitizedData = sanitizeObject(result.data);
    
    // Store sanitized data
    const resource = await prisma.resource.create({
      data: sanitizedData,
    });
    
    // Return response
  } catch (error) {
    // Error handling
  }
}
```

#### 3. Implement Selective Data Fetching

Use Prisma's select to avoid overfetching:

```typescript
// app/api/v1/resources/route.ts
export async function GET(req: NextRequest) {
  try {
    // Get only the fields needed for the list view
    const resources = await prisma.resource.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        favoriteCount: true,
        upvoteCount: true,
        // Only select needed fields
      },
      // Other query options
    });
    
    return NextResponse.json(resources);
  } catch (error) {
    // Error handling
  }
}
```

## Frontend Security

### Current State

The frontend may have security vulnerabilities:

- Potential for XSS attacks
- Insecure handling of sensitive data
- Lack of Content Security Policy

### Recommendations

#### 1. Implement Content Security Policy

Add a Content Security Policy to the Next.js config:

```typescript
// next.config.mjs
import { headers } from 'next/headers';

const nextConfig = {
  // ...
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-inline' 'unsafe-eval';
              style-src 'self' 'unsafe-inline';
              img-src 'self' data: https:;
              font-src 'self';
              connect-src 'self' https://api.example.com;
              frame-src 'none';
              object-src 'none';
              base-uri 'self';
              form-action 'self';
              frame-ancestors 'none';
              block-all-mixed-content;
              upgrade-insecure-requests;
            `.replace(/\s+/g, ' ').trim(),
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

#### 2. Prevent XSS Attacks

Use React's built-in XSS protection and additional safeguards:

```tsx
// components/resources/ResourceDescription.tsx
import DOMPurify from 'isomorphic-dompurify';

interface ResourceDescriptionProps {
  description: string;
  allowHtml?: boolean;
}

export default function ResourceDescription({
  description,
  allowHtml = false,
}: ResourceDescriptionProps) {
  if (allowHtml) {
    // Sanitize HTML before rendering
    const sanitizedHtml = DOMPurify.sanitize(description, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
      ALLOWED_ATTR: ['href', 'target', 'rel'],
    });
    
    return (
      <div
        className="resource-description"
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      />
    );
  }
  
  // Regular text rendering (safer)
  return <div className="resource-description">{description}</div>;
}
```

#### 3. Secure Handling of Sensitive Data

Avoid storing sensitive data in localStorage or sessionStorage:

```typescript
// utils/storage.ts
import { encrypt, decrypt } from './crypto';

export function setSecureItem(key: string, value: any): void {
  if (typeof window === 'undefined') return;
  
  try {
    // Encrypt sensitive data before storing
    const encryptedValue = encrypt(JSON.stringify(value));
    sessionStorage.setItem(key, encryptedValue);
  } catch (error) {
    console.error('Error storing secure item:', error);
  }
}

export function getSecureItem<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const encryptedValue = sessionStorage.getItem(key);
    
    if (!encryptedValue) return null;
    
    // Decrypt data when retrieving
    const decryptedValue = decrypt(encryptedValue);
    return JSON.parse(decryptedValue) as T;
  } catch (error) {
    console.error('Error retrieving secure item:', error);
    return null;
  }
}
```

## Infrastructure Security

### Recommendations

#### 1. Implement HTTPS

Ensure all traffic is encrypted with HTTPS:

```typescript
// next.config.mjs
const nextConfig = {
  // ...
  poweredByHeader: false,
  // Force HTTPS in production
  async rewrites() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'header',
            key: 'x-forwarded-proto',
            value: 'http',
          },
        ],
        destination: 'https://:path*',
      },
    ];
  },
};
```

#### 2. Implement Environment Variable Security

Create a validation utility for environment variables:

```typescript
// utils/env.ts
import { z } from 'zod';

const EnvSchema = z.object({
  // Database
  DATABASE_URL: z.string().min(1),
  
  // Authentication
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  
  // API keys
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  
  // Other environment variables
});

export function validateEnv() {
  try {
    EnvSchema.parse(process.env);
    console.log('Environment variables validated successfully');
  } catch (error) {
    console.error('Invalid environment variables:', error);
    process.exit(1);
  }
}
```

Call this validation function early in the application lifecycle:

```typescript
// app/api/init.ts
import { validateEnv } from '@/utils/env';

// Validate environment variables
validateEnv();
```

## Compliance Considerations

### GDPR Compliance

#### 1. Implement Cookie Consent

Create a cookie consent component:

```tsx
// components/utils/CookieConsent.tsx
'use client';

import { useState, useEffect } from 'react';
import { getCookie, setCookie } from '@/utils/cookies';

export default function CookieConsent() {
  const [showConsent, setShowConsent] = useState(false);
  
  useEffect(() => {
    // Check if user has already consented
    const hasConsented = getCookie('cookie-consent');
    
    if (!hasConsented) {
      setShowConsent(true);
    }
  }, []);
  
  const handleAccept = () => {
    setCookie('cookie-consent', 'true', 365); // 1 year
    setShowConsent(false);
  };
  
  const handleDecline = () => {
    setCookie('cookie-consent', 'false', 365); // 1 year
    setShowConsent(false);
    
    // Disable non-essential cookies
    // ...
  };
  
  if (!showConsent) {
    return null;
  }
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 z-50">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0">
            <p className="text-sm">
              We use cookies to enhance your experience. By continuing to visit this site, you agree to our use of cookies.
              <a href="/privacy-policy" className="underline ml-1">
                Learn more
              </a>
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleDecline}
              className="px-4 py-2 bg-gray-700 rounded"
            >
              Decline
            </button>
            <button
              onClick={handleAccept}
              className="px-4 py-2 bg-blue-600 rounded"
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

#### 2. Implement Data Export and Deletion

Create API endpoints for data export and deletion:

```typescript
// app/api/v1/user/data-export/route.ts
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    
    // Fetch user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        favorites: true,
        ratings: true,
        // Include other related data
      },
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Prepare data for export
    const exportData = {
      user: {
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      },
      favorites: user.favorites,
      ratings: user.ratings,
      // Include other data
    };
    
    return NextResponse.json(exportData);
  } catch (error) {
    // Error handling
  }
}
```

```typescript
// app/api/v1/user/data-deletion/route.ts
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    
    // Delete user data
    await prisma.$transaction([
      // Delete related data first
      prisma.favorite.deleteMany({ where: { userId } }),
      prisma.rating.deleteMany({ where: { userId } }),
      // Delete user
      prisma.user.delete({ where: { id: userId } }),
    ]);
    
    // Sign out the user
    // Note: This would need to be handled on the client side
    
    return NextResponse.json({ success: true });
  } catch (error) {
    // Error handling
  }
}
```

## Security Monitoring

### Recommendations

#### 1. Implement Logging

Create a logging utility:

```typescript
// utils/logger.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'advo-app' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    // Add other transports as needed (file, external service, etc.)
  ],
});

export default logger;
```

Use the logger throughout the application:

```typescript
// app/api/v1/resources/route.ts
import logger from '@/utils/logger';

export async function GET(req: NextRequest) {
  try {
    logger.info('Fetching resources', {
      url: req.url,
      method: req.method,
      ip: req.headers.get('x-forwarded-for') || 'unknown',
    });
    
    // Process request
    // ...
    
    logger.info('Resources fetched successfully', {
      count: resources.length,
    });
    
    return NextResponse.json(resources);
  } catch (error) {
    logger.error('Error fetching resources', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    // Error handling
  }
}
```

#### 2. Implement Security Headers Monitoring

Create a utility to check security headers:

```typescript
// utils/security-headers.ts
export function checkSecurityHeaders(headers: Headers): {
  missing: string[];
  weak: { header: string; value: string; recommendation: string }[];
} {
  const requiredHeaders = [
    'Content-Security-Policy',
    'X-XSS-Protection',
    'X-Frame-Options',
    'X-Content-Type-Options',
    'Referrer-Policy',
    'Permissions-Policy',
  ];
  
  const missing = requiredHeaders.filter(header => !headers.has(header));
  
  const weak = [];
  
  // Check for weak header values
  if (headers.get('X-XSS-Protection') !== '1; mode=block') {
    weak.push({
      header: 'X-XSS-Protection',
      value: headers.get('X-XSS-Protection') || '',
      recommendation: '1; mode=block',
    });
  }
  
  if (headers.get('X-Frame-Options') !== 'DENY') {
    weak.push({
      header: 'X-Frame-Options',
      value: headers.get('X-Frame-Options') || '',
      recommendation: 'DENY',
    });
  }
  
  // Check other headers
  
  return { missing, weak };
}
```

Create a debug endpoint to check security headers:

```typescript
// app/api/v1/debug/security-headers/route.ts
import { checkSecurityHeaders } from '@/utils/security-headers';

export async function GET(req: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }
  
  const headers = req.headers;
  const result = checkSecurityHeaders(headers);
  
  return NextResponse.json(result);
}
```

## Conclusion

By implementing these security best practices, the Advo application will be more secure and resilient against common attacks. These changes should be implemented incrementally, with proper testing at each step to ensure that functionality is preserved.

Remember to regularly review and update security measures as new threats emerge and best practices evolve.