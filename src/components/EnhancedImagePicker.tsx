import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  Text,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ImageCropPicker from 'react-native-image-crop-picker';

interface EnhancedImagePickerProps {
  onImageSelected: (image: {
    uri: string;
    type?: string;
    fileName?: string;
    size?: number;
  }) => void;
  children?: React.ReactNode;
  style?: any;
  cropSettings?: {
    width?: number;
    height?: number;
    cropping?: boolean;
    circular?: boolean;
    freeStyleCrop?: boolean;
  };
}

const EnhancedImagePicker: React.FC<EnhancedImagePickerProps> = ({
  onImageSelected,
  children,
  style,
  cropSettings = {
    width: 800,
    height: 600,
    cropping: true,
    circular: false,
    freeStyleCrop: true,
  },
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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
      'Select Image 📷',
      'Choose how you would like to select an image',
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
        width: cropSettings.width || 800,
        height: cropSettings.height || 600,
        cropping: cropSettings.cropping ?? true,
        cropperCircleOverlay: cropSettings.circular ?? false,
        compressImageQuality: 0.8,
        mediaType: 'photo',
        includeBase64: false,
        freeStyleCropEnabled: cropSettings.freeStyleCrop ?? true,
        enableRotationGesture: true,
        cropperToolbarTitle: 'Crop Your Image',
        cropperActiveWidgetColor: '#10B981',
        cropperStatusBarColor: '#059669',
        cropperToolbarColor: '#10B981',
        cropperToolbarWidgetColor: '#FFFFFF',
      });

      await handleSelectedImage(image);
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
        width: cropSettings.width || 800,
        height: cropSettings.height || 600,
        cropping: cropSettings.cropping ?? true,
        cropperCircleOverlay: cropSettings.circular ?? false,
        compressImageQuality: 0.8,
        mediaType: 'photo',
        includeBase64: false,
        freeStyleCropEnabled: cropSettings.freeStyleCrop ?? true,
        enableRotationGesture: true,
        cropperToolbarTitle: 'Crop Your Image',
        cropperActiveWidgetColor: '#10B981',
        cropperStatusBarColor: '#059669',
        cropperToolbarColor: '#10B981',
        cropperToolbarWidgetColor: '#FFFFFF',
        smartAlbums: ['UserLibrary', 'PhotoStream', 'Panoramas', 'Videos', 'Bursts'],
      });

      await handleSelectedImage(image);
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

  const handleSelectedImage = async (image: any) => {
    const imageData = {
      uri: image.path,
      type: image.mime,
      fileName: `image_${Date.now()}.${image.mime.split('/')[1]}`,
      size: image.size,
    };

    setSelectedImage(image.path);
    onImageSelected(imageData);
  };

  if (children) {
    // If custom children are provided, wrap them in a touchable
    return (
      <TouchableOpacity onPress={showImagePickerOptions} style={style}>
        {children}
      </TouchableOpacity>
    );
  }

  // Default image picker UI
  return (
    <TouchableOpacity 
      style={[styles.defaultContainer, style]} 
      onPress={showImagePickerOptions}
    >
      {selectedImage ? (
        <View style={styles.imageContainer}>
          <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
          <View style={styles.changeButton}>
            <Icon name="edit" size={16} color="#FFFFFF" />
          </View>
        </View>
      ) : (
        <View style={styles.placeholderContainer}>
          <Icon name="add-a-photo" size={32} color="#9CA3AF" />
          <Text style={styles.placeholderText}>Tap to add photo</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  defaultContainer: {
    width: 120,
    height: 120,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  selectedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 6,
  },
  changeButton: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: '#10B981',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  placeholderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    marginTop: 8,
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default EnhancedImagePicker;
