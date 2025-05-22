// File: src/app/admin/config.ts
// Purpose: Configuration settings for the admin section of the application.
// Owner: Advo Team

// Force dynamic rendering for all admin pages to ensure fresh data on each request
// This prevents Next.js from statically generating or caching admin pages
export const dynamic = "force-dynamic";
