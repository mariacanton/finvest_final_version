import { doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { firestore, storage } from "../config/firebase";

export const updateUserName = async (uid: string, newName: string) => {
  try {
    const userRef = doc(firestore, "users", uid);
    await updateDoc(userRef, { name: newName });
    return { success: true };
  } catch (error: any) {
    console.error("Error updating user name:", error);
    return { success: false, msg: error.message || "Update failed." };
  }
};

export const uploadUserImage = async (uid: string, imageUri: string) => {
  try {
    console.log('Starting image upload for user:', uid);
    console.log('Image URI:', imageUri);
    
    // Validate inputs
    if (!uid || !imageUri) {
      throw new Error('Missing uid or imageUri');
    }

    // Create a reference to the user's profile image with timestamp to avoid caching issues
    const timestamp = Date.now();
    const imageRef = ref(storage, `profile-images/${uid}_${timestamp}.jpg`);
    
    console.log('Created storage reference:', imageRef.fullPath);
    
    // Fetch the image data
    console.log('Fetching image data...');
    const response = await fetch(imageUri);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }
    
    const blob = await response.blob();
    console.log('Image blob size:', blob.size, 'bytes');
    
    if (blob.size === 0) {
      throw new Error('Image blob is empty');
    }
    
    // Upload the image
    console.log('Uploading to Firebase Storage...');
    const uploadResult = await uploadBytes(imageRef, blob);
    console.log('Upload successful:', uploadResult.metadata.fullPath);
    
    // Get the download URL
    console.log('Getting download URL...');
    const downloadURL = await getDownloadURL(imageRef);
    console.log('Download URL obtained:', downloadURL);
    
    // Update user document with the image URL
    console.log('Updating user document...');
    const userRef = doc(firestore, "users", uid);
    await updateDoc(userRef, { image: downloadURL });
    console.log('User document updated successfully');
    
    return { success: true, imageUrl: downloadURL };
  } catch (error: any) {
    console.error("Error uploading image:", error);
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);
    console.error("Full error:", JSON.stringify(error, null, 2));
    
    let userFriendlyMessage = "Image upload failed.";
    
    if (error.code === 'storage/unauthorized') {
      userFriendlyMessage = "You don't have permission to upload images. Please check your account.";
    } else if (error.code === 'storage/canceled') {
      userFriendlyMessage = "Upload was canceled.";
    } else if (error.code === 'storage/unknown') {
      userFriendlyMessage = "Unknown upload error. Please check your internet connection and try again.";
    } else if (error.code === 'storage/quota-exceeded') {
      userFriendlyMessage = "Storage quota exceeded. Please contact support.";
    } else if (error.message.includes('fetch')) {
      userFriendlyMessage = "Failed to process the selected image. Please try a different image.";
    }
    
    return { success: false, msg: userFriendlyMessage };
  }
};

export const deleteUserImage = async (uid: string) => {
  try {
    // Create a reference to the user's profile image
    const imageRef = ref(storage, `profile-images/${uid}.jpg`);
    
    // Delete the image from storage
    await deleteObject(imageRef);
    
    // Update user document to remove the image URL
    const userRef = doc(firestore, "users", uid);
    await updateDoc(userRef, { image: null });
    
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting image:", error);
    return { success: false, msg: error.message || "Image deletion failed." };
  }
};

export const updateUserProfile = async (uid: string, updates: { name?: string; image?: string }) => {
  try {
    const userRef = doc(firestore, "users", uid);
    await updateDoc(userRef, updates);
    return { success: true };
  } catch (error: any) {
    console.error("Error updating user profile:", error);
    return { success: false, msg: error.message || "Profile update failed." };
  }
};

// Test function to check Firebase Storage connectivity
export const testStorageConnection = async () => {
  try {
    console.log('Testing Firebase Storage connection...');
    
    // Try to create a simple reference
    const testRef = ref(storage, 'test/connection-test.txt');
    console.log('Storage reference created:', testRef.fullPath);
    
    // Try to upload a simple text blob
    const testBlob = new Blob(['test'], { type: 'text/plain' });
    await uploadBytes(testRef, testBlob);
    console.log('Test upload successful');
    
    // Try to get download URL
    const url = await getDownloadURL(testRef);
    console.log('Test download URL:', url);
    
    // Clean up test file
    await deleteObject(testRef);
    console.log('Test cleanup successful');
    
    return { success: true, msg: 'Storage connection successful' };
  } catch (error: any) {
    console.error('Storage connection test failed:', error);
    return { success: false, msg: error.message, code: error.code };
  }
};

// Alternative: Store image as base64 in Firestore (for small images only)
export const uploadImageAsBase64 = async (uid: string, imageUri: string): Promise<{ success: boolean; imageUrl?: string; msg?: string }> => {
  try {
    console.log('Converting image to base64 for user:', uid);
    console.log('Image URI:', imageUri);
    
    // Validate inputs
    if (!uid || !imageUri) {
      throw new Error('Missing uid or imageUri');
    }

    // Read the image as base64
    const response = await fetch(imageUri);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }
    
    const blob = await response.blob();
    console.log('Original image blob size:', blob.size, 'bytes');
    
    if (blob.size === 0) {
      throw new Error('Image blob is empty');
    }
    
    // Convert blob to base64
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = () => {
        reject(new Error('Failed to read image'));
      };
      reader.readAsDataURL(blob);
    });
    
    console.log('Base64 conversion complete, size:', base64.length, 'characters');
    console.log('Base64 size in KB:', Math.round(base64.length / 1024), 'KB');
    
    // Check size (Firestore has 1MB document limit, but we want to be conservative)
    if (base64.length > 400000) { // ~400KB limit
      return { 
        success: false, 
        msg: `Image is too large (${Math.round(base64.length / 1024)}KB). Please choose a smaller image or reduce photo quality to under 400KB.` 
      };
    }
    
    // Update user document with base64 image
    console.log('Updating user document with base64 image...');
    const userRef = doc(firestore, "users", uid);
    await updateDoc(userRef, { image: base64 });
    console.log('User document updated successfully');
    
    return { success: true, imageUrl: base64 };
  } catch (error: any) {
    console.error("Error uploading base64 image:", error);
    
    let userFriendlyMessage = "Image upload failed.";
    
    if (error.message.includes('fetch')) {
      userFriendlyMessage = "Failed to process the selected image. Please try a different image.";
    } else if (error.message.includes('read')) {
      userFriendlyMessage = "Failed to read the image file. Please try again.";
    } else if (error.message.includes('Missing')) {
      userFriendlyMessage = "Invalid image or user data. Please try again.";
    } else if (error.message.includes('large')) {
      userFriendlyMessage = error.message; // Show the specific size info
    }
    
    return { success: false, msg: userFriendlyMessage };
  }
};
