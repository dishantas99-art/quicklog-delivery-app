/**
 * Cloudinary Image Upload Service
 * 
 * Handles uploading images to Cloudinary cloud storage.
 * Requires CLOUDINARY_CLOUD_NAME and CLOUDINARY_UPLOAD_PRESET environment variables.
 */

import * as FileSystem from 'expo-file-system/legacy';

interface UploadResponse {
  success: boolean;
  url?: string;
  publicId?: string;
  error?: string;
}

/**
 * Get the base64 encoded image data from a file URI
 */
async function getBase64Image(imageUri: string): Promise<string> {
  try {
    const base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return base64;
  } catch (err) {
    console.error('Error reading image file:', err);
    throw new Error('Failed to read image file');
  }
}

/**
 * Upload a single image to Cloudinary
 * 
 * @param imageUri - Local file URI of the image
 * @param cloudName - Cloudinary cloud name
 * @param uploadPreset - Cloudinary upload preset (unsigned)
 * @returns Upload response with URL and public ID
 */
export async function uploadImageToCloudinary(
  imageUri: string,
  cloudName: string,
  uploadPreset: string,
): Promise<UploadResponse> {
  try {
    if (!cloudName || !uploadPreset) {
      return {
        success: false,
        error: 'Cloudinary credentials not configured. Set CLOUDINARY_CLOUD_NAME and CLOUDINARY_UPLOAD_PRESET.',
      };
    }

    // Get base64 encoded image
    const base64 = await getBase64Image(imageUri);

    // Create FormData for upload
    const formData = new FormData();
    formData.append('file', `data:image/jpeg;base64,${base64}`);
    formData.append('upload_preset', uploadPreset);
    formData.append('folder', 'quicklog-receipts');

    // Upload to Cloudinary
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Cloudinary upload error:', error);
      return {
        success: false,
        error: error.error?.message || 'Upload failed',
      };
    }

    const data = await response.json();
    return {
      success: true,
      url: data.secure_url,
      publicId: data.public_id,
    };
  } catch (err) {
    console.error('Error uploading to Cloudinary:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error during upload',
    };
  }
}

/**
 * Upload multiple images to Cloudinary in parallel
 * 
 * @param imageUris - Array of local file URIs
 * @param cloudName - Cloudinary cloud name
 * @param uploadPreset - Cloudinary upload preset
 * @returns Array of upload responses
 */
export async function uploadImagesToCloudinary(
  imageUris: string[],
  cloudName: string,
  uploadPreset: string,
): Promise<UploadResponse[]> {
  const uploadPromises = imageUris.map((uri) =>
    uploadImageToCloudinary(uri, cloudName, uploadPreset),
  );

  return Promise.all(uploadPromises);
}

/**
 * Delete an image from Cloudinary
 * 
 * @param publicId - Cloudinary public ID of the image
 * @param cloudName - Cloudinary cloud name
 * @param apiKey - Cloudinary API key
 * @param apiSecret - Cloudinary API secret
 * @returns Success status
 */
export async function deleteImageFromCloudinary(
  publicId: string,
  cloudName: string,
  apiKey: string,
  apiSecret: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!cloudName || !apiKey || !apiSecret) {
      return {
        success: false,
        error: 'Cloudinary credentials not configured',
      };
    }

    // Note: This requires authenticated API calls
    // For now, deletion is not implemented in unsigned mode
    // Implement this when you have server-side deletion needs
    console.warn('Image deletion requires authenticated API calls. Implement on backend.');

    return { success: false, error: 'Deletion not yet implemented' };
  } catch (err) {
    console.error('Error deleting from Cloudinary:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

/**
 * Validate Cloudinary credentials
 */
export function validateCloudinaryConfig(cloudName: string, uploadPreset: string): boolean {
  return !!(cloudName && uploadPreset);
}
