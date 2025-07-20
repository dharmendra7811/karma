import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
  Text,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ImageCropPicker from 'react-native-image-crop-picker';
import { ImageUploadService } from '../services/ImageUploadService';

interface EnhancedAvatarPickerProps {
  currentAvatarUrl?: string;
  currentAvatarEmoji?: string;
  onUploadSuccess: (avatarUrl: string) => void;
  onUploadStart: () => void;
  onUploadEnd: () => void;
  userId?: string;
  size?: number;
}

const EnhancedAvatarPicker: React.FC<EnhancedAvatarPickerProps> = ({
  currentAvatarUrl,
  currentAvatarEmoji = '🌸',
  onUploadSuccess,
  onUploadStart,
  onUploadEnd,
  userId,
  size = 80,
}) => {
  const [isUploading, setIsUploading] = useState(false);

  // Request camera permissions for Android
  const requestCameraPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'This app needs access to camera to take photos.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn('Camera permission error:', err);
        return false;
      }
    }
    return true; // iOS handles permissions automatically
  };

  const showImagePickerOptions = () => {
    Alert.alert(
      'Change Avatar 📸',
      "Choose how you'd like to update your profile picture",
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Take Photo',
          onPress: () => takePhoto(),
        },
        {
          text: 'Choose from Gallery',
          onPress: () => pickFromGallery(),
        },
        {
          text: 'Choose Emoji',
          onPress: () => showEmojiPicker(),
        },
        ...(currentAvatarUrl
          ? [
              {
                text: 'Remove Photo',
                style: 'destructive' as const,
                onPress: () => removePhoto(),
              },
            ]
          : []),
      ],
    );
  };

  const takePhoto = async () => {
    try {
      // Request camera permission
      const hasPermission = await requestCameraPermission();
      if (!hasPermission) {
        Alert.alert(
          'Permission Required',
          'Camera permission is required to take photos. Please enable it in settings.',
        );
        return;
      }

      const image = await ImageCropPicker.openCamera({
        width: 400,
        height: 400,
        cropping: true,
        cropperCircleOverlay: true,
        compressImageQuality: 0.8,
        mediaType: 'photo',
        includeBase64: false,
        freeStyleCropEnabled: false,
        enableRotationGesture: true,
        cropperToolbarTitle: 'Crop Your Avatar',
        cropperActiveWidgetColor: '#10B981',
        cropperStatusBarColor: '#059669',
        cropperToolbarColor: '#10B981',
        cropperToolbarWidgetColor: '#FFFFFF',
      });

      await handleCroppedImage(image);
    } catch (error: any) {
      console.log('Camera error:', error);
      if (error.code === 'E_PICKER_CANCELLED') {
        // User cancelled, do nothing
        return;
      }
      
      Alert.alert(
        'Camera Error',
        'Unable to access camera. Please make sure camera permissions are enabled and try again.',
      );
    }
  };

  const pickFromGallery = async () => {
    try {
      const image = await ImageCropPicker.openPicker({
        width: 400,
        height: 400,
        cropping: true,
        cropperCircleOverlay: true,
        compressImageQuality: 0.8,
        mediaType: 'photo',
        includeBase64: false,
        freeStyleCropEnabled: false,
        enableRotationGesture: true,
        cropperToolbarTitle: 'Crop Your Avatar',
        cropperActiveWidgetColor: '#10B981',
        cropperStatusBarColor: '#059669',
        cropperToolbarColor: '#10B981',
        cropperToolbarWidgetColor: '#FFFFFF',
        smartAlbums: ['UserLibrary', 'PhotoStream', 'Panoramas', 'Videos', 'Bursts'],
      });

      await handleCroppedImage(image);
    } catch (error: any) {
      console.log('Gallery error:', error);
      if (error.code === 'E_PICKER_CANCELLED') {
        // User cancelled, do nothing
        return;
      }
      
      Alert.alert(
        'Gallery Error',
        'Unable to access photo gallery. Please try again.',
      );
    }
  };

  const handleCroppedImage = async (image: any) => {
    const imageData = {
      uri: image.path,
      type: image.mime,
      fileName: `avatar_${Date.now()}.${image.mime.split('/')[1]}`,
      size: image.size,
    };

    await uploadImage(imageData);
  };

  const uploadImage = async (image: {
    uri: string;
    type?: string;
    fileName?: string;
    size?: number;
  }) => {
    setIsUploading(true);
    onUploadStart();

    try {
      // Validate the image
      const validation = ImageUploadService.validateImage(image);
      if (!validation.valid) {
        Alert.alert(
          'Invalid Image',
          validation.error || 'Please select a valid image.',
        );
        return;
      }

      const result = await ImageUploadService.uploadImage(
        image,
        'avatar',
        userId,
      );

      if (result.success && result.url) {
        onUploadSuccess(result.url);
        Alert.alert('Success! 🎉', 'Profile photo updated successfully!');
      } else {
        Alert.alert(
          'Upload Failed',
          result.error || 'Failed to upload photo. Please try again.',
        );
      }
    } catch (error) {
      console.error('Avatar upload error:', error);
      Alert.alert(
        'Error',
        'Failed to upload photo. Please check your internet connection and try again.',
      );
    } finally {
      setIsUploading(false);
      onUploadEnd();
    }
  };

  const showEmojiPicker = () => {
    Alert.alert(
      'Choose Avatar Emoji',
      'Which emoji would you like as your avatar?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: '🌸', onPress: () => selectEmoji('🌸') },
        { text: '🌱', onPress: () => selectEmoji('🌱') },
        { text: '🌟', onPress: () => selectEmoji('🌟') },
        { text: '🔥', onPress: () => selectEmoji('🔥') },
        { text: '💚', onPress: () => selectEmoji('💚') },
        { text: '🚀', onPress: () => selectEmoji('🚀') },
        { text: '🌈', onPress: () => selectEmoji('🌈') },
        { text: '⭐', onPress: () => selectEmoji('⭐') },
        { text: '🎯', onPress: () => selectEmoji('🎯') },
        { text: '💫', onPress: () => selectEmoji('💫') },
      ],
    );
  };

  const selectEmoji = (emoji: string) => {
    onUploadSuccess(`emoji:${emoji}`);
  };

  const removePhoto = () => {
    Alert.alert(
      'Remove Photo',
      'Are you sure you want to remove your profile photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            onUploadSuccess(''); // Empty string to remove photo
          },
        },
      ],
    );
  };

  // Cleanup function to clear image cache
  const cleanupImageCache = () => {
    ImageCropPicker.clean().then(() => {
      console.log('Image cache cleaned');
    }).catch(e => {
      console.log('Error cleaning image cache:', e);
    });
  };

  const containerStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  return (
    <TouchableOpacity
      style={[styles.container, containerStyle]}
      onPress={showImagePickerOptions}
      disabled={isUploading}
    >
      {isUploading ? (
        <View style={[styles.loadingContainer, containerStyle]}>
          <ActivityIndicator size="small" color="#059669" />
          <Text style={styles.loadingText}>Uploading...</Text>
        </View>
      ) : currentAvatarUrl ? (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: currentAvatarUrl }}
            style={[styles.image, containerStyle]}
          />
          <View style={styles.editButton}>
            <Icon name="edit" size={12} color="#FFFFFF" />
          </View>
        </View>
      ) : (
        <View style={[styles.emojiContainer, containerStyle]}>
          <Text style={[styles.emoji, { fontSize: size / 2.5 }]}>
            {currentAvatarEmoji}
          </Text>
          <View style={styles.editButton}>
            <Icon name="edit" size={12} color="#FFFFFF" />
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  image: {
    backgroundColor: '#F3F4F6',
  },
  emojiContainer: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FEF3E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emoji: {
    textAlign: 'center',
  },
  loadingContainer: {
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#BBF7D0',
  },
  loadingText: {
    fontSize: 10,
    color: '#059669',
    marginTop: 4,
    textAlign: 'center',
  },
  editButton: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#10B981',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
});

export default EnhancedAvatarPicker;
