import { Storage } from "@google-cloud/storage";
import { v4 as uuidv4 } from "uuid";

// Initialize storage with credentials
// In production, you should use environment variables for these credentials
// For local development, you can use a service account key file
let storage: Storage;

// Initialize the storage client
export const initStorage = () => {
  try {
    // Check if storage is already initialized
    if (storage) return storage;

    // For production, use environment variables
    if (
      process.env.GCP_PROJECT_ID &&
      process.env.GCP_CLIENT_EMAIL &&
      process.env.GCP_PRIVATE_KEY
    ) {
      storage = new Storage({
        projectId: process.env.GCP_PROJECT_ID,
        credentials: {
          client_email: process.env.GCP_CLIENT_EMAIL,
          private_key: process.env.GCP_PRIVATE_KEY.replace(/\\n/g, "\n"),
        },
      });
    } else {
      // For local development, you can use a service account key file
      // Make sure to add this file to .gitignore
      storage = new Storage({
        keyFilename: process.env.GCP_KEY_FILE || "./service-account-key.json",
      });
    }

    return storage;
  } catch (error) {
    console.error("Error initializing Google Cloud Storage:", error);
    throw error;
  }
};

// Get bucket name from environment variable or use a default
const getBucketName = () => {
  return process.env.GCP_BUCKET_NAME || "advo-profile-images";
};

/**
 * Upload a file to Google Cloud Storage
 * @param file The file buffer to upload
 * @param originalFilename The original filename
 * @param mimeType The MIME type of the file
 * @returns The public URL of the uploaded file
 */
export const uploadToCloudStorage = async (
  file: Buffer,
  originalFilename: string,
  mimeType: string,
): Promise<string> => {
  try {
    const storage = initStorage();
    const bucketName = getBucketName();
    const bucket = storage.bucket(bucketName);

    // Generate a unique filename
    const fileExt = originalFilename.split(".").pop();
    const fileName = `${uuidv4()}.${fileExt}`;

    // Create a reference to the file in the bucket
    const blob = bucket.file(`uploads/${fileName}`);
    // Upload the file
    await blob.save(file, {
      metadata: {
        contentType: mimeType,
      },
      public: true, // Make the file publicly accessible
    });

    // Get the public URL
    const publicUrl = `https://storage.googleapis.com/${bucketName}/uploads/${fileName}`;

    console.log(`File uploaded to Google Cloud Storage: ${publicUrl}`);
    return publicUrl;
  } catch (error) {
    console.error("Error uploading to Google Cloud Storage:", error);
    throw error;
  }
};

/**
 * Delete a file from Google Cloud Storage
 * @param fileUrl The public URL of the file to delete
 */
export const deleteFromCloudStorage = async (
  fileUrl: string,
): Promise<void> => {
  try {
    // Extract the file path from the URL
    const storage = initStorage();
    const bucketName = getBucketName();
    const bucket = storage.bucket(bucketName);
    // Extract the file path from the URL
    // URL format: https://storage.googleapis.com/bucket-name/uploads/filename
    const urlParts = fileUrl.split(`${bucketName}/`);
    if (urlParts.length < 2) {
      throw new Error(`Invalid file URL: ${fileUrl}`);
    }

    const filePath = urlParts[1]; // 'uploads/filename'
    // Delete the file
    await bucket.file(filePath).delete();
    console.log(`File deleted from Google Cloud Storage: ${fileUrl}`);
  } catch (error) {
    console.error("Error deleting from Google Cloud Storage:", error);
    throw error;
  }
};
