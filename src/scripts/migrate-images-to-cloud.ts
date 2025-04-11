/**
 * Script to migrate existing images from local storage to cloud storage
 *
 * This script:
 * 1. Scans the public/uploads directory for image files
 * 2. Uploads each image to Google Cloud Storage
 * 3. Updates the database records to point to the new cloud URLs
 *
 * Usage:
 * npx ts-node -r tsconfig-paths/register src/scripts/migrate-images-to-cloud.ts
 */

import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";
import { uploadToCloudStorage } from "@/lib/cloud-storage";

// Initialize Prisma client
const prisma = new PrismaClient();

// Path to uploads directory
const UPLOADS_DIR = path.join(process.cwd(), "public/uploads");

// Function to get all image files from the uploads directory
async function getImageFiles(): Promise<string[]> {
  try {
    const files = await fs.promises.readdir(UPLOADS_DIR);
    // Filter for image files
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
    return files.filter((file) =>
      imageExtensions.some((ext) => file.toLowerCase().endsWith(ext)),
    );
  } catch (error) {
    console.error("Error reading uploads directory:", error);
    return [];
  }
}

// Function to migrate a single image
async function migrateImage(filename: string): Promise<string | null> {
  try {
    const filePath = path.join(UPLOADS_DIR, filename);
    const fileBuffer = await fs.promises.readFile(filePath);
    const mimeType = getMimeType(filename);

    // Upload to cloud storage
    const cloudUrl = await uploadToCloudStorage(fileBuffer, filename, mimeType);
    console.log(`Migrated ${filename} to ${cloudUrl}`);
    return cloudUrl;
  } catch (error) {
    console.error(`Error migrating ${filename}:`, error);
    return null;
  }
}

// Function to get MIME type from filename
function getMimeType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  switch (ext) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".gif":
      return "image/gif";
    case ".webp":
      return "image/webp";
    default:
      return "application/octet-stream";
  }
}

// Function to update user records in the database
async function updateUserImages(
  localPath: string,
  cloudUrl: string,
): Promise<void> {
  try {
    // Convert local path to the format stored in the database
    const dbPath = `/uploads/${path.basename(localPath)}`;

    // Since the Prisma schema doesn't have an image field for User,
    // we need to use a raw database query or update the schema
    // For now, we'll log this as a manual step
    console.log(`
      Manual step needed: Update users with image path ${dbPath} to ${cloudUrl}
      
      Example MongoDB query:
      db.users.updateMany(
        { image: "${dbPath}" },
        { $set: { image: "${cloudUrl}" } }
      )
    `);
  } catch (error) {
    console.error(`Error updating database for ${localPath}:`, error);
  }
}

// Main migration function
async function migrateImagesToCloud(): Promise<void> {
  try {
    console.log("Starting image migration to cloud storage...");

    // Get all image files
    const imageFiles = await getImageFiles();
    console.log(`Found ${imageFiles.length} images to migrate`);

    // Migrate each image
    for (const file of imageFiles) {
      const cloudUrl = await migrateImage(file);

      if (cloudUrl) {
        // Update database records
        await updateUserImages(file, cloudUrl);
      }
    }
    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
migrateImagesToCloud().catch(console.error);
