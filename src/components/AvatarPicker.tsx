import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
  Text,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  launchCamera,
  launchImageLibrary,
  ImagePickerResponse,
  MediaType,
  ImagePickerOptions,
} from 'react-native-image-picker';
import { ImageUploadService } from '../services/ImageUploadService';

interface AvatarPickerProps {
  currentAvatarUrl?: string;
  currentAvatarEmoji?: string;
  onUploadSuccess: (avatarUrl: string) => void;
  onUploadStart: () => void;
  onUploadEnd: () => void;
  userId?: string;
  size?: number;
}

const AvatarPicker: React.FC<AvatarPickerProps> = ({
  currentAvatarUrl,
  currentAvatarEmoji = '🌸',
  onUploadSuccess,
  onUploadStart,
  onUploadEnd,
  userId,
  size = 80,
}) => {
  const [isUploading, setIsUploading] = useState(false);

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

  const takePhoto = () => {
    const options: ImagePickerOptions = {
      mediaType: 'photo' as MediaType,
      quality: 0.8,
      maxWidth: 400,
      maxHeight: 400,
      includeBase64: false,
    };

    launchCamera(options, (response: ImagePickerResponse) => {
      handleImagePickerResponse(response);
    });
  };

  const pickFromGallery = () => {
    const options: ImagePickerOptions = {
      mediaType: 'photo' as MediaType,
      quality: 0.8,
      maxWidth: 400,
      maxHeight: 400,
      includeBase64: false,
      selectionLimit: 1,
    };

    launchImageLibrary(options, (response: ImagePickerResponse) => {
      handleImagePickerResponse(response);
    });
  };

  const handleImagePickerResponse = async (response: ImagePickerResponse) => {
    if (response.didCancel || response.errorMessage) {
      return;
    }

    if (response.assets && response.assets.length > 0) {
      const asset = response.assets[0];
      await uploadImage({
        uri: asset.uri || '',
        type: asset.type,
        fileName: asset.fileName,
        size: asset.fileSize,
      });
    }
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
    // This will be handled by the parent component
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

export default AvatarPicker;
