import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Image,
  ActionSheetIOS,
  Platform,
} from "react-native";
import { useAuth } from "../../contexts/authContext";
import { updateUserName, uploadImageAsBase64 } from "../../services/userService";
import { useRouter, Stack } from "expo-router";
import Colors from "../../constants/Colors";
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { doc, updateDoc } from 'firebase/firestore';
import { firestore } from '../../config/firebase';

export default function ProfileEdit() {
  const { user, updateUserData } = useAuth();
  const [name, setName] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (user?.name) setName(user.name);
    if (user?.image) setSelectedImage(user.image);
  }, [user]);

  // Request permissions
  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to change your profile picture!');
        }
      }
    })();
  }, []);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.2, // Further reduced for smaller file size
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Sorry, we need camera permissions to take a photo!');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.2, // Further reduced for smaller file size
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const showImageOptions = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take Photo', 'Choose from Library', 'Remove Photo'],
          cancelButtonIndex: 0,
          destructiveButtonIndex: 3,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            takePhoto();
          } else if (buttonIndex === 2) {
            pickImage();
          } else if (buttonIndex === 3) {
            setSelectedImage(null);
          }
        }
      );
    } else {
      Alert.alert(
        'Profile Picture',
        'Choose an option',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Take Photo', onPress: takePhoto },
          { text: 'Choose from Library', onPress: pickImage },
          { text: 'Remove Photo', onPress: () => setSelectedImage(null), style: 'destructive' },
        ]
      );
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert("Missing Info", "Name cannot be empty");
      return;
    }

    setLoading(true);
    let imageUploadSuccess = true;
    let newImageUrl = selectedImage;

    try {
      // Handle image upload/deletion if image changed
      if (selectedImage !== user?.image) {
        setImageLoading(true);
        
        if (selectedImage && selectedImage !== user?.image) {
          // Upload new image using base64 (free alternative to Firebase Storage)
          console.log('Attempting to upload image for user:', user?.uid);
          console.log('Selected image URI:', selectedImage);
          const imageResult = await uploadImageAsBase64(user?.uid as string, selectedImage);
          console.log('Upload result:', imageResult);
          if (imageResult.success) {
            newImageUrl = imageResult.imageUrl || selectedImage;
            console.log('Upload successful, new image URL length:', newImageUrl?.length);
          } else {
            imageUploadSuccess = false;
            console.error('Upload failed:', imageResult.msg);
            Alert.alert("Image Upload Failed", imageResult.msg || "Unknown error");
          }
        } else if (!selectedImage && user?.image) {
          // Remove image from user profile
          const userRef = doc(firestore, "users", user?.uid as string);
          await updateDoc(userRef, { image: null });
          newImageUrl = null;
        }
        
        setImageLoading(false);
      }

      // Update name
      const nameResult = await updateUserName(user?.uid as string, name);
      
      if (nameResult.success && imageUploadSuccess) {
        console.log('Profile update successful, refreshing user data...');
        // Update the user data in context to reflect changes immediately
        await updateUserData(user?.uid as string);
        console.log('User data refreshed, navigating back...');
        
        // Small delay to ensure the context has updated
        setTimeout(() => {
          router.back();
        }, 100);
      } else {
        Alert.alert("Update Failed", nameResult.msg || "Failed to update profile");
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert("Update Failed", "An unexpected error occurred");
    }
    
    setLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Stack.Screen 
        options={{ 
          title: "Edit Profile", 
          headerBackTitle: "Back",
          headerStyle: {
            backgroundColor: '#A3C9A8',
          },
          headerTitleStyle: {
            color: '#1a1a1a',
            fontSize: 20,
            fontWeight: '700',
          },
          headerTintColor: '#1a1a1a',
        }} 
      />

      {/* User Avatar */}
      <View style={styles.avatarContainer}>
        <TouchableOpacity 
          onPress={showImageOptions}
          style={styles.avatarTouchable}
          disabled={imageLoading}
        >
          <Image
            source={
              selectedImage
                ? { uri: selectedImage }
                : require("../../../assets/images/avatar-placeholder.png")
            }
            style={styles.avatar}
          />
          {imageLoading && (
            <View style={styles.loadingOverlay}>
              <Text style={styles.loadingText}>Uploading...</Text>
            </View>
          )}
          <View style={styles.cameraIconContainer}>
            <Ionicons name="camera" size={20} color="#fff" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Form */}
      <View style={styles.formContainer}>
        <Text style={styles.title}>Your Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter new name"
          placeholderTextColor="#666"
          value={name}
          onChangeText={setName}
        />
        <TouchableOpacity
          onPress={handleSubmit}
          style={[styles.button, loading && styles.buttonDisabled]}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Updating..." : "Save Changes"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#A3C9A8",
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
    alignItems: "center",
  },
  avatarContainer: {
    backgroundColor: '#A3C9A8',
    padding: 20,
    borderRadius: 20,
    marginBottom: 24,
    borderWidth: 0,
    borderColor: 'transparent',
    elevation: 3,
  },
  avatarTouchable: {
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#e5e5e5",
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.light.tint,
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  formContainer: {
    backgroundColor: '#A3C9A8',
    padding: 20,
    borderRadius: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#b3ccb6",
    backgroundColor: "#c3dcc6",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#1a1a1a",
    marginBottom: 32,
  },
  button: {
    backgroundColor: Colors.light.tint,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#84a791",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
