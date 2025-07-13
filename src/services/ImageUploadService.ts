import { supabase } from '../lib/supabase';

interface UploadResponse {
  success: boolean;
  url?: string;
  error?: string;
}

interface ImageFile {
  uri: string;
  type?: string;
  fileName?: string;
  size?: number;
}

export class ImageUploadService {
  // Upload single image to Supabase Storage
  static async uploadImage(
    image: ImageFile,
    uploadType: 'avatar' | 'deed' | 'activity' = 'avatar',
    userId?: string
  ): Promise<UploadResponse> {
    try {
      // Validate the image first
      const validation = this.validateImage(image);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error,
        };
      }

      // Generate unique filename
      const fileExt = this.getFileExtension(image.fileName || image.type || 'jpg');
      const fileName = `${uploadType}_${userId || Date.now()}_${Date.now()}.${fileExt}`;
      
      let bucketName: string;
      let filePath: string;

      // Determine bucket and path based on upload type
      switch (uploadType) {
        case 'avatar':
          bucketName = 'avatars';
          filePath = `${userId}/${fileName}`;
          break;
        case 'deed':
          bucketName = 'deeds';
          filePath = `${userId}/${fileName}`;
          break;
        case 'activity':
          bucketName = 'activities';
          filePath = `${userId}/${fileName}`;
          break;
        default:
          bucketName = 'avatars';
          filePath = fileName;
      }

      // Convert image URI to blob for React Native
      const response = await fetch(image.uri);
      const blob = await response.blob();

      console.log('Uploading to Supabase:', {
        bucket: bucketName,
        path: filePath,
        fileName,
        size: blob.size,
      });

      // Try alternative upload method for React Native
      let uploadResult;
      
      try {
        // Method 1: Direct blob upload
        console.log('Trying blob upload...');
        uploadResult = await supabase.storage
          .from(bucketName)
          .upload(filePath, blob, {
            cacheControl: '3600',
            upsert: false,
            contentType: image.type || 'image/jpeg',
          });
      } catch (blobError) {
        console.log('Blob upload failed, trying FormData method...');
        
        // Method 2: FormData upload (fallback)
        const formData = new FormData();
        formData.append('file', {
          uri: image.uri,
          type: image.type || 'image/jpeg',
          name: fileName,
        } as any);
        
        uploadResult = await supabase.storage
          .from(bucketName)
          .upload(filePath, formData, {
            cacheControl: '3600',
            upsert: false,
          });
      }

      const { data, error } = uploadResult;
      console.log('Upload response:', { data, error });

      if (error) {
        console.error('Supabase upload error:', error);
        return {
          success: false,
          error: error.message || 'Upload failed',
        };
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      if (!urlData?.publicUrl) {
        return {
          success: false,
          error: 'Failed to get public URL',
        };
      }

      console.log('Upload successful:', urlData.publicUrl);

      return {
        success: true,
        url: urlData.publicUrl,
      };

    } catch (error) {
      console.error('Image upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }

  // Delete image from Supabase Storage
  static async deleteImage(
    imageUrl: string,
    bucketName: string = 'avatars'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Extract file path from URL
      const url = new URL(imageUrl);
      const pathSegments = url.pathname.split('/');
      const bucketIndex = pathSegments.findIndex(segment => segment === bucketName);
      
      if (bucketIndex === -1) {
        return {
          success: false,
          error: 'Invalid image URL format',
        };
      }

      const filePath = pathSegments.slice(bucketIndex + 1).join('/');

      console.log('Deleting from Supabase:', {
        bucket: bucketName,
        path: filePath,
      });

      const { error } = await supabase.storage
        .from(bucketName)
        .remove([filePath]);

      if (error) {
        console.error('Supabase delete error:', error);
        return {
          success: false,
          error: error.message,
        };
      }

      return { success: true };

    } catch (error) {
      console.error('Image delete error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Delete failed',
      };
    }
  }

  // Upload multiple images
  static async uploadMultipleImages(
    images: ImageFile[],
    uploadType: 'deed' | 'activity' = 'deed',
    userId?: string,
    onProgress?: (progress: number) => void
  ): Promise<{ success: boolean; urls: string[]; errors: string[] }> {
    const urls: string[] = [];
    const errors: string[] = [];
    
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      const result = await this.uploadImage(image, uploadType, userId);
      
      if (result.success && result.url) {
        urls.push(result.url);
      } else {
        errors.push(result.error || `Failed to upload image ${i + 1}`);
      }
      
      // Report progress
      if (onProgress) {
        onProgress((i + 1) / images.length);
      }
    }

    return {
      success: errors.length === 0,
      urls,
      errors,
    };
  }

  // Helper method to get file extension
  private static getFileExtension(input: string): string {
    if (input.includes('/')) {
      // Handle MIME type like 'image/jpeg'
      const mimeToExt: { [key: string]: string } = {
        'image/jpeg': 'jpg',
        'image/jpg': 'jpg',
        'image/png': 'png',
        'image/webp': 'webp',
        'image/gif': 'gif',
      };
      return mimeToExt[input] || 'jpg';
    } else if (input.includes('.')) {
      // Handle filename like 'image.jpg'
      return input.split('.').pop()?.toLowerCase() || 'jpg';
    } else {
      // Default extension
      return 'jpg';
    }
  }

  // Compress image before upload (placeholder for future implementation)
  static async compressImage(imageUri: string, quality: number = 0.7): Promise<string> {
    // For now, return the original URI
    // In a real implementation, you might use react-native-image-resizer
    return imageUri;
  }

  // Get optimized image size for upload
  static getOptimizedDimensions(
    originalWidth: number,
    originalHeight: number,
    maxSize: number = 1024
  ): { width: number; height: number } {
    if (originalWidth <= maxSize && originalHeight <= maxSize) {
      return { width: originalWidth, height: originalHeight };
    }

    const aspectRatio = originalWidth / originalHeight;
    
    if (originalWidth > originalHeight) {
      return {
        width: maxSize,
        height: Math.round(maxSize / aspectRatio),
      };
    } else {
      return {
        width: Math.round(maxSize * aspectRatio),
        height: maxSize,
      };
    }
  }

  // Validate image before upload
  static validateImage(image: ImageFile): { valid: boolean; error?: string } {
    // Check file size (limit to 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (image.size && image.size > maxSize) {
      return {
        valid: false,
        error: 'Image size must be less than 10MB',
      };
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (image.type && !allowedTypes.includes(image.type)) {
      return {
        valid: false,
        error: 'Only JPEG, PNG, and WebP images are allowed',
      };
    }

    return { valid: true };
  }
}