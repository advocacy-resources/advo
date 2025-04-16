#!/bin/bash

# Navigate to the project root
cd "$(dirname "$0")/../.."

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Push schema changes to the database
echo "Pushing schema changes to the database..."
npx prisma db push

echo "Prisma migration completed successfully!"