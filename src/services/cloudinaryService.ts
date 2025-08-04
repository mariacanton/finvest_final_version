// Cloudinary service for image uploads
const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload';
const CLOUDINARY_UPLOAD_PRESET = 'YOUR_UPLOAD_PRESET'; // Create this in Cloudinary dashboard

export interface CloudinaryResponse {
  success: boolean;
  imageUrl?: string;
  msg?: string;
}

export const uploadImageToCloudinary = async (imageUri: string, userId: string): Promise<CloudinaryResponse> => {
  try {
    console.log('Starting Cloudinary upload for user:', userId);
    
    // Create form data
    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      type: 'image/jpeg',
      name: `profile_${userId}_${Date.now()}.jpg`,
    } as any);
    
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('public_id', `profile_images/${userId}`); // This will overwrite previous image
    formData.append('folder', 'finvest_profiles');
    
    const response = await fetch(CLOUDINARY_URL, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    const result = await response.json();
    
    if (response.ok && result.secure_url) {
      console.log('Cloudinary upload successful:', result.secure_url);
      return {
        success: true,
        imageUrl: result.secure_url,
      };
    } else {
      console.error('Cloudinary upload failed:', result);
      return {
        success: false,
        msg: result.error?.message || 'Upload failed',
      };
    }
  } catch (error: any) {
    console.error('Cloudinary upload error:', error);
    return {
      success: false,
      msg: error.message || 'Upload failed',
    };
  }
};

export const deleteImageFromCloudinary = async (userId: string): Promise<CloudinaryResponse> => {
  // For delete operations, you'd need to implement server-side deletion
  // or use Cloudinary's Admin API (requires API secret, should be server-side)
  console.log('Note: Cloudinary deletion should be implemented server-side for security');
  return { success: true };
};
