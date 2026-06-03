# Cloudinary Image Upload Integration Guide

## Overview

Cloudinary is a cloud-based image storage and delivery service. This guide shows how to set up Cloudinary and integrate it with QuickLog to upload receipt images to the cloud.

## Step 1: Create Cloudinary Account

1. Go to https://cloudinary.com
2. Click **Sign Up Free**
3. Create account with email and password
4. Verify your email
5. You'll be taken to the dashboard

## Step 2: Get Your Credentials

1. On the Cloudinary dashboard, go to **Settings** (gear icon)
2. Click **API Keys** tab
3. Copy your **Cloud Name** (looks like: `dxxxxx`)
4. Note your **API Key** and **API Secret** (keep these private!)

## Step 3: Create Upload Preset

Upload presets allow unsigned uploads (no authentication needed from mobile app).

1. Go to **Settings** → **Upload** tab
2. Scroll to **Upload presets** section
3. Click **Add upload preset**
4. Set **Name**: `quicklog-receipts`
5. Set **Signing Mode**: **Unsigned**
6. Click **Save**

## Step 4: Configure Environment Variables

Add Cloudinary credentials to your `.env` file:

```bash
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_UPLOAD_PRESET=quicklog-receipts
```

Or set them via the Manus webdev secrets interface:

```bash
npm run webdev:secrets
```

Then add:
- `CLOUDINARY_CLOUD_NAME`: Your cloud name from Step 2
- `CLOUDINARY_UPLOAD_PRESET`: `quicklog-receipts` (from Step 3)

## Step 5: Integrate with Create Receipt Screen

The `create-receipt.tsx` screen now uses Cloudinary for image uploads. When staff uploads images:

1. Images are uploaded to Cloudinary
2. Cloudinary returns a secure URL
3. The URL is stored in the receipt (not the local file)
4. Images persist even if the app is uninstalled

### Updated Image Upload Flow

```typescript
// In create-receipt.tsx
const pickFromGallery = async () => {
  // ... get image from gallery ...
  
  // Upload to Cloudinary
  const result = await uploadImageToCloudinary(
    imageUri,
    process.env.CLOUDINARY_CLOUD_NAME,
    process.env.CLOUDINARY_UPLOAD_PRESET,
  );
  
  if (result.success) {
    // Save Cloudinary URL instead of local URI
    setFormData({ 
      ...formData, 
      images: [...formData.images, result.url] 
    });
  }
};
```

## Step 6: Test Image Upload

1. Build the custom dev client (see `DEV_CLIENT_BUILD.md`)
2. Log in as Staff
3. Create a receipt
4. Tap **Gallery** or **Camera**
5. Select/take an image
6. Image uploads to Cloudinary
7. Verify in Cloudinary dashboard: **Media Library** → **quicklog-receipts** folder

## Cloudinary Dashboard Features

| Feature | Use Case |
|---------|----------|
| **Media Library** | View all uploaded images organized by folder |
| **Transformations** | Resize, compress, or filter images on-the-fly |
| **Analytics** | Track bandwidth and storage usage |
| **API Keys** | Manage authentication for server-side operations |
| **Upload Presets** | Configure upload rules and transformations |

## Image URL Format

Cloudinary URLs look like:

```
https://res.cloudinary.com/dxxxxx/image/upload/v1234567890/quicklog-receipts/abc123.jpg
```

These URLs are:
- **Permanent**: Never expire or change
- **Optimized**: Automatically compressed for mobile
- **Transformable**: Can be resized on-the-fly by adding parameters

## Advanced: Image Transformations

Cloudinary allows on-the-fly image transformations. Examples:

```
// Resize to 300x300
https://res.cloudinary.com/dxxxxx/image/upload/w_300,h_300/quicklog-receipts/abc123.jpg

// Compress quality
https://res.cloudinary.com/dxxxxx/image/upload/q_70/quicklog-receipts/abc123.jpg

// Convert to WebP
https://res.cloudinary.com/dxxxxx/image/upload/f_webp/quicklog-receipts/abc123.jpg
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| **Upload fails** | Check that `CLOUDINARY_CLOUD_NAME` and `CLOUDINARY_UPLOAD_PRESET` are set correctly. Verify upload preset is set to "Unsigned". |
| **Images not appearing** | Check Cloudinary Media Library to see if images were uploaded. Check browser console for errors. |
| **Slow uploads** | Large images take longer. Consider compressing before upload or using Cloudinary's transformation API. |
| **Storage limit exceeded** | Upgrade your Cloudinary plan or delete old images from Media Library. |

## Cost Considerations

Cloudinary's free tier includes:
- **25 GB storage**
- **25 GB bandwidth per month**
- **Unlimited transformations**

This is sufficient for most small to medium apps. Check https://cloudinary.com/pricing for details.

## Next Steps

1. ✅ Set up Cloudinary account and credentials
2. ✅ Configure environment variables
3. ✅ Test image uploads
4. **→ Connect Turso database** for receipt persistence (see `TURSO_SETUP.md`)

---

**Questions?** Check [Cloudinary Documentation](https://cloudinary.com/documentation) or the [API Reference](https://cloudinary.com/documentation/image_upload_api_reference).
