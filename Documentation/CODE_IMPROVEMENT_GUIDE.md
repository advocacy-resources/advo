# Code Improvement Guide

This document provides specific code examples and implementation details for improving the Advo application. It complements the `ARCHITECTURE_REVIEW.md` with concrete examples and technical recommendations.

## Table of Contents

1. [MongoDB ObjectID Handling](#mongodb-objectid-handling)
2. [API Error Handling](#api-error-handling)
3. [Authentication Improvements](#authentication-improvements)
4. [Performance Optimizations](#performance-optimizations)
5. [TypeScript Enhancements](#typescript-enhancements)
6. [React Component Best Practices](#react-component-best-practices)
7. [Testing Strategy](#testing-strategy)

## MongoDB ObjectID Handling

### Current Issues

The application has inconsistent handling of MongoDB ObjectIDs, sometimes converting them to numbers or attempting to pad them:

```typescript
// Problematic code in HomeResourceGrid.tsx
<ResourceCard
  key={resource.id}
  id={parseInt(resource.id)} // Converting ObjectID to number
  // ...
/>
```

### Recommended Solution

1. Create a utility function for ObjectID validation:

```typescript
// utils/mongodb.ts
import { ObjectId } from 'mongodb';

export const isValidObjectId = (id: string): boolean => {
  try {
    return ObjectId.isValid(id);
  } catch (e) {
    return false;
  }
};

export const formatObjectId = (id: string): string => {
  return id.toString();
};
```

2. Use the utility function consistently:

```typescript
// Example API route
import { isValidObjectId } from '@/utils/mongodb';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  
  if (!isValidObjectId(id)) {
    return NextResponse.json(
      { error: "Invalid resource ID format" },
      { status: 400 }
    );
  }
  
  const resource = await prisma.resource.findUnique({
    where: { id },
  });
  
  // ...
}
```

3. Update interfaces to clearly specify ID types:

```typescript
// interfaces/resource.ts
export interface Resource {
  id: string; // MongoDB ObjectID as string
  // ...
}
```

## API Error Handling

### Current Issues

Error handling is inconsistent across API routes:

```typescript
// Inconsistent error handling
try {
  // ...
} catch (error) {
  console.error("Error in GET /api/resources/[id]/rating:", error);
  return NextResponse.json(
    {
      error: "Internal Server Error",
      details: error instanceof Error ? error.message : "Unknown error",
    },
    { status: 500 }
  );
}
```

### Recommended Solution

1. Create a standardized error handling utility:

```typescript
// utils/api-error.ts
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  
  constructor(message: string, statusCode: number, code: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.name = 'ApiError';
  }
  
  static badRequest(message: string, code = 'BAD_REQUEST') {
    return new ApiError(message, 400, code);
  }
  
  static unauthorized(message: string, code = 'UNAUTHORIZED') {
    return new ApiError(message, 401, code);
  }
  
  static forbidden(message: string, code = 'FORBIDDEN') {
    return new ApiError(message, 403, code);
  }
  
  static notFound(message: string, code = 'NOT_FOUND') {
    return new ApiError(message, 404, code);
  }
  
  static internal(message: string, code = 'INTERNAL_ERROR') {
    return new ApiError(message, 500, code);
  }
}

export function handleApiError(error: unknown) {
  console.error(error);
  
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
      },
      { status: error.statusCode }
    );
  }
  
  // Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return NextResponse.json(
      {
        error: 'Database error',
        code: error.code,
        details: error.message,
      },
      { status: 500 }
    );
  }
  
  // Default error
  return NextResponse.json(
    {
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
      details: error instanceof Error ? error.message : 'Unknown error',
    },
    { status: 500 }
  );
}
```

2. Use the error handling utility in API routes:

```typescript
// Example API route with improved error handling
import { ApiError, handleApiError } from '@/utils/api-error';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!isValidObjectId(id)) {
      throw ApiError.badRequest('Invalid resource ID format');
    }
    
    const resource = await prisma.resource.findUnique({
      where: { id },
    });
    
    if (!resource) {
      throw ApiError.notFound('Resource not found');
    }
    
    return NextResponse.json(resource);
  } catch (error) {
    return handleApiError(error);
  }
}
```

## Authentication Improvements

### Current Issues

NextAuth is in debug mode and there's potential for unauthorized access:

```typescript
// Warning in logs
[next-auth][warn][DEBUG_ENABLED] 
https://next-auth.js.org/warnings#debug_enabled
```

### Recommended Solution

1. Disable debug mode in production:

```typescript
// lib/authOptions.ts
export const authOptions: NextAuthOptions = {
  // ...
  debug: process.env.NODE_ENV === 'development',
  // ...
};
```

2. Create a middleware for role-based access control:

```typescript
// middleware/auth.ts
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/authOptions";
import { ApiError } from "@/utils/api-error";

export async function withAuth(
  handler: (req: NextRequest, session: Session) => Promise<NextResponse>,
  req: NextRequest
) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    throw ApiError.unauthorized('You must be logged in to access this resource');
  }
  
  return handler(req, session);
}

export async function withAdminAuth(
  handler: (req: NextRequest, session: Session) => Promise<NextResponse>,
  req: NextRequest
) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    throw ApiError.unauthorized('You must be logged in to access this resource');
  }
  
  if (session.user.role !== 'admin') {
    throw ApiError.forbidden('You do not have permission to access this resource');
  }
  
  return handler(req, session);
}
```

3. Use the middleware in API routes:

```typescript
// Example admin API route
import { withAdminAuth } from '@/middleware/auth';
import { handleApiError } from '@/utils/api-error';

export async function GET(req: NextRequest) {
  try {
    return withAdminAuth(async (req, session) => {
      const users = await prisma.user.findMany();
      return NextResponse.json(users);
    }, req);
  } catch (error) {
    return handleApiError(error);
  }
}
```

## Performance Optimizations

### Current Issues

Potential for N+1 query problems and inefficient data fetching:

```typescript
// Inefficient querying in resource fetching
const resources = await prisma.resource.findMany();
// Then separately fetching ratings for each resource
for (const resource of resources) {
  const ratings = await prisma.rating.findMany({
    where: { resourceId: resource.id },
  });
  // ...
}
```

### Recommended Solution

1. Use Prisma's include for related data:

```typescript
// Efficient querying with includes
const resources = await prisma.resource.findMany({
  include: {
    Rating: true,
    // Include other related data as needed
  },
});
```

2. Implement caching for frequently accessed data:

```typescript
// utils/cache.ts
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 300 }); // 5 minutes default TTL

export async function getCachedData<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl?: number
): Promise<T> {
  const cachedData = cache.get<T>(key);
  
  if (cachedData !== undefined) {
    return cachedData;
  }
  
  const freshData = await fetchFn();
  cache.set(key, freshData, ttl);
  
  return freshData;
}
```

3. Use the caching utility:

```typescript
// Example API route with caching
export async function GET(req: NextRequest) {
  try {
    const resources = await getCachedData(
      'all-resources',
      async () => {
        return prisma.resource.findMany({
          include: {
            Rating: true,
          },
        });
      },
      600 // 10 minutes TTL
    );
    
    return NextResponse.json(resources);
  } catch (error) {
    return handleApiError(error);
  }
}
```

## TypeScript Enhancements

### Current Issues

Type definitions could be more comprehensive:

```typescript
// Loose typing
interface ResourceCardProps {
  id: string | number; // Ambiguous type
  // ...
}
```

### Recommended Solution

1. Create more specific types:

```typescript
// types/mongodb.ts
export type ObjectId = string;

// interfaces/resource.ts
import { ObjectId } from '@/types/mongodb';

export interface Resource {
  id: ObjectId;
  name: string;
  description: string;
  // ...
}

// components/resources/ResourceCard.tsx
interface ResourceCardProps {
  id: ObjectId;
  name: string;
  // ...
}
```

2. Use Zod for runtime validation:

```typescript
// schemas/resource.ts
import { z } from 'zod';
import { isValidObjectId } from '@/utils/mongodb';

export const ObjectIdSchema = z.string().refine(isValidObjectId, {
  message: 'Invalid ObjectId format',
});

export const ResourceSchema = z.object({
  id: ObjectIdSchema,
  name: z.string().min(1, 'Name is required'),
  description: z.string(),
  category: z.array(z.string()),
  // ...
});

export type ResourceInput = z.infer<typeof ResourceSchema>;
```

3. Use the schemas for validation:

```typescript
// Example API route with Zod validation
import { ResourceSchema } from '@/schemas/resource';
import { ApiError, handleApiError } from '@/utils/api-error';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate input
    const result = ResourceSchema.safeParse(body);
    
    if (!result.success) {
      throw ApiError.badRequest('Invalid resource data', 'VALIDATION_ERROR');
    }
    
    const validatedData = result.data;
    
    // Process the validated data
    const resource = await prisma.resource.create({
      data: validatedData,
    });
    
    return NextResponse.json(resource);
  } catch (error) {
    return handleApiError(error);
  }
}
```

## React Component Best Practices

### Current Issues

Component responsibilities not always clearly defined:

```typescript
// Large component with multiple responsibilities
const ResourceCard: React.FC<ResourceCardProps> = ({
  id,
  name,
  description,
  // ...many props
}) => {
  // ...many state variables
  // ...many side effects
  // ...many handlers
  
  return (
    // ...complex JSX
  );
};
```

### Recommended Solution

1. Break down components into smaller, focused components:

```typescript
// components/resources/ResourceRating.tsx
interface ResourceRatingProps {
  resourceId: ObjectId;
  initialRating: Rating;
}

const ResourceRating: React.FC<ResourceRatingProps> = ({
  resourceId,
  initialRating,
}) => {
  const [currentRating, setCurrentRating] = useState<Rating>(initialRating);
  // ...rating-specific logic
  
  return (
    <div className="flex gap-2">
      <button onClick={handleRatingUp}>👍</button>
      <button onClick={handleRatingDown}>👎</button>
    </div>
  );
};

// components/resources/ResourceCard.tsx (simplified)
const ResourceCard: React.FC<ResourceCardProps> = ({
  id,
  name,
  description,
  // ...fewer props
}) => {
  return (
    <div className="card">
      <ResourceHeader name={name} />
      <ResourceDescription description={description} />
      <ResourceRating resourceId={id} initialRating={rating} />
      <ResourceFavorite resourceId={id} initialFavored={favored} />
    </div>
  );
};
```

2. Use custom hooks for logic separation:

```typescript
// hooks/useResourceRating.ts
export function useResourceRating(resourceId: ObjectId, initialRating: Rating) {
  const { data: session } = useSession();
  const [currentRating, setCurrentRating] = useState<Rating>(initialRating);
  const [approvalPercentage, setApprovalPercentage] = useState<number>(0);
  const [totalVotes, setTotalVotes] = useState<number>(0);
  
  // ...rating logic
  
  return {
    currentRating,
    approvalPercentage,
    totalVotes,
    handleRatingUp,
    handleRatingDown,
  };
}

// components/resources/ResourceRating.tsx (with custom hook)
const ResourceRating: React.FC<ResourceRatingProps> = ({
  resourceId,
  initialRating,
}) => {
  const {
    currentRating,
    approvalPercentage,
    totalVotes,
    handleRatingUp,
    handleRatingDown,
  } = useResourceRating(resourceId, initialRating);
  
  return (
    // ...JSX
  );
};
```

## Testing Strategy

### Recommended Approach

1. Unit tests for utility functions:

```typescript
// utils/mongodb.test.ts
import { isValidObjectId } from './mongodb';

describe('MongoDB utilities', () => {
  describe('isValidObjectId', () => {
    it('should return true for valid ObjectIds', () => {
      expect(isValidObjectId('507f1f77bcf86cd799439011')).toBe(true);
    });
    
    it('should return false for invalid ObjectIds', () => {
      expect(isValidObjectId('invalid-id')).toBe(false);
      expect(isValidObjectId('123')).toBe(false);
    });
  });
});
```

2. Integration tests for API routes:

```typescript
// __tests__/api/resources.test.ts
import { createMocks } from 'node-mocks-http';
import { GET } from '@/app/api/v1/resources/[id]/route';

// Mock Prisma
jest.mock('@/prisma/client', () => ({
  resource: {
    findUnique: jest.fn(),
  },
}));

describe('Resource API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('should return 404 for non-existent resource', async () => {
    const prisma = require('@/prisma/client');
    prisma.resource.findUnique.mockResolvedValue(null);
    
    const { req, res } = createMocks({
      method: 'GET',
      params: { id: '507f1f77bcf86cd799439011' },
    });
    
    const response = await GET(req, { params: { id: '507f1f77bcf86cd799439011' } });
    const data = await response.json();
    
    expect(response.status).toBe(404);
    expect(data.error).toBe('Resource not found');
  });
});
```

3. Component tests with React Testing Library:

```typescript
// __tests__/components/ResourceCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import ResourceCard from '@/components/resources/ResourceCard';
import { Rating } from '@/enums/rating.enum';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: () => ({
    data: { user: { id: 'user-id' } },
  }),
}));

describe('ResourceCard', () => {
  it('renders resource information correctly', () => {
    render(
      <ResourceCard
        id="507f1f77bcf86cd799439011"
        name="Test Resource"
        description="Test Description"
        category="Test Category"
        type={['Type 1', 'Type 2']}
        rating={Rating.NULL}
        favored={false}
      />
    );
    
    expect(screen.getByText('Test Resource')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText(/Test Category/)).toBeInTheDocument();
  });
});
```

## Conclusion

By implementing these specific code improvements, the Advo application will be more robust, maintainable, and efficient. These changes should be implemented incrementally, with proper testing at each step to ensure that functionality is preserved.

Remember to update documentation as changes are made, and consider creating a style guide to ensure consistency across the codebase.