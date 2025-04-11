# Cloud Storage Setup for Profile Photos

This document provides instructions for setting up Google Cloud Storage for profile photos in the Advo application.

## Overview

Previously, profile photos were stored locally in the `public/uploads` directory. This approach has several limitations:

- Limited scalability
- Increased server load
- Potential disk space issues
- No redundancy or backup

By migrating to Google Cloud Storage, we gain:

- Improved scalability
- Better performance
- Reduced server load
- Built-in redundancy and reliability
- CDN capabilities for faster global access

## Setup Instructions

### 1. Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable billing for the project

### 2. Create a Storage Bucket

1. Navigate to Cloud Storage > Buckets
2. Click "Create Bucket"
3. Name your bucket (e.g., `advo-profile-images`)
4. Choose a region (preferably close to your user base)
5. Set the default storage class (Standard is recommended for frequently accessed images)
6. Set access control to "Fine-grained" (recommended for more control)
7. Create the bucket

### 3. Configure Bucket Permissions

1. Go to your bucket's "Permissions" tab
2. Add a new member with the "Storage Object Viewer" role to make objects publicly accessible:
   - Member: `allUsers`
   - Role: Storage > Storage Object Viewer
3. This allows anyone to view the images, which is necessary for profile photos

### 4. Create a Service Account

1. Navigate to IAM & Admin > Service Accounts
2. Click "Create Service Account"
3. Name your service account (e.g., `advo-storage-service-account`)
4. Grant the service account the "Storage Admin" role
5. Create and download a JSON key file
6. Keep this file secure - it provides access to your cloud storage

### 5. Configure Environment Variables

Add the following environment variables to your `.env.local` file:

```
# Google Cloud Storage Configuration
GCP_PROJECT_ID=your-project-id
GCP_CLIENT_EMAIL=your-service-account-email@your-project-id.iam.gserviceaccount.com
GCP_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
GCP_BUCKET_NAME=advo-profile-images

# Enable local storage fallback (optional)
ENABLE_LOCAL_STORAGE=true
```

Alternatively, you can use a service account key file:

```
# Google Cloud Storage Configuration
GCP_KEY_FILE=./service-account-key.json
GCP_BUCKET_NAME=advo-profile-images
```

### 6. Deploy the Code Changes

1. Deploy the updated code with cloud storage support
2. The application will now upload new profile photos to Google Cloud Storage

### 7. Migrate Existing Images (Optional)

To migrate existing images from local storage to cloud storage:

1. Run the migration script:
   ```
   npx ts-node -r tsconfig-paths/register src/scripts/migrate-images-to-cloud.ts
   ```
2. Follow the manual steps provided by the script to update database records

## Usage

The application now automatically handles both local and cloud storage URLs:

- New uploads will be stored in Google Cloud Storage
- The ProfileImage component can handle both local paths and cloud URLs
- If cloud storage upload fails, the system can optionally fall back to local storage

## Troubleshooting

### Common Issues

1. **403 Forbidden errors**: Check bucket permissions and ensure public access is enabled
2. **Authentication errors**: Verify your service account credentials are correct
3. **CORS issues**: Configure CORS settings in your bucket if needed:
   ```
   gsutil cors set cors-config.json gs://advo-profile-images
   ```

### Monitoring

Monitor your storage usage and costs in the Google Cloud Console to ensure they remain within expected ranges.

## Security Considerations

- The bucket is configured for public read access, which is necessary for profile photos
- Write access is restricted to authenticated users with admin privileges
- Consider implementing signed URLs for more sensitive content