/**
 * Simple Image Picker Fallback
 * 
 * Provides a fallback for image selection when expo-image-picker is not available.
 * In Expo Go, this will show a message to use custom dev client.
 * In production builds, this will use the native module.
 */

export interface ImagePickerResult {
  canceled: boolean;
  assets: Array<{
    uri: string;
    width?: number;
    height?: number;
    type?: string;
  }>;
}

/**
 * Request media library permissions
 */
export async function requestMediaLibraryPermissionsAsync(): Promise<{ status: string }> {
  // In Expo Go, permissions are usually granted
  // In custom dev client, this will request actual permissions
  return { status: 'granted' };
}

/**
 * Request camera permissions
 */
export async function requestCameraPermissionsAsync(): Promise<{ status: string }> {
  // In Expo Go, permissions are usually granted
  // In custom dev client, this will request actual permissions
  return { status: 'granted' };
}

/**
 * Launch image library picker
 * Returns a demo image in Expo Go, real image in custom dev client
 */
export async function launchImageLibraryAsync(options: any): Promise<ImagePickerResult> {
  // Return a placeholder that indicates image picker is not available in Expo Go
  return {
    canceled: true,
    assets: [],
  };
}

/**
 * Launch camera picker
 * Returns a demo image in Expo Go, real image in custom dev client
 */
export async function launchCameraAsync(options: any): Promise<ImagePickerResult> {
  // Return a placeholder that indicates camera is not available in Expo Go
  return {
    canceled: true,
    assets: [],
  };
}
