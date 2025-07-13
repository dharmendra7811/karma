import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ScrollView,
  Modal,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  launchCamera,
  launchImageLibrary,
  ImagePickerResponse,
  MediaType,
  ImagePickerOptions,
} from 'react-native-image-picker';

interface ImageAsset {
  uri: string;
  width?: number;
  height?: number;
  size?: number;
  type?: string;
  fileName?: string;
}

interface RealImagePickerProps {
  images: ImageAsset[];
  onImagesChange: (images: ImageAsset[]) => void;
  maxImages?: number;
  title?: string;
  allowMultiple?: boolean;
  circular?: boolean;
  size?: number;
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
}

const RealImagePicker: React.FC<RealImagePickerProps> = ({
  images,
  onImagesChange,
  maxImages = 3,
  title = 'Add Photos',
  allowMultiple = true,
  circular = false,
  size = 80,
  quality = 0.8,
  maxWidth = 800,
  maxHeight = 800,
}) => {
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

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
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const requestStoragePermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        // For Android 13+ (API level 33+), we need READ_MEDIA_IMAGES
        if (Platform.Version >= 33) {
          const granted = await PermissionsAndroid.request(
            'android.permission.READ_MEDIA_IMAGES' as any,
            {
              title: 'Photo Library Permission',
              message:
                'This app needs access to your photo library to select images.',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            },
          );
          return granted === PermissionsAndroid.RESULTS.GRANTED;
        } else {
          // For older Android versions
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
            {
              title: 'Storage Permission',
              message: 'This app needs access to storage to select photos.',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            },
          );
          return granted === PermissionsAndroid.RESULTS.GRANTED;
        }
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const showImagePickerOptions = () => {
    const remainingSlots = maxImages - images.length;

    if (remainingSlots <= 0) {
      Alert.alert(
        'Limit Reached',
        `You can only add up to ${maxImages} photos.`,
      );
      return;
    }

    Alert.alert(
      'Add Photo',
      'Choose how you want to add a photo',
      [
        {
          text: 'Take Photo',
          onPress: () => takePhoto(),
        },
        {
          text: 'Choose from Gallery',
          onPress: () => pickFromGallery(),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true },
    );
  };

  const takePhoto = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert(
        'Permission Required',
        'Camera permission is required to take photos.',
      );
      return;
    }

    const options: ImagePickerOptions = {
      mediaType: 'photo' as MediaType,
      quality: quality,
      maxWidth: maxWidth,
      maxHeight: maxHeight,
      includeBase64: false,
      includeExtra: true,
    };

    launchCamera(options, (response: ImagePickerResponse) => {
      handleImagePickerResponse(response);
    });
  };

  const pickFromGallery = async () => {
    const hasPermission = await requestStoragePermission();
    if (!hasPermission) {
      Alert.alert(
        'Permission Required',
        'Storage permission is required to select photos from gallery.',
      );
      return;
    }

    const options: ImagePickerOptions = {
      mediaType: 'photo' as MediaType,
      quality: quality,
      maxWidth: maxWidth,
      maxHeight: maxHeight,
      includeBase64: false,
      includeExtra: true,
      selectionLimit: allowMultiple
        ? Math.min(maxImages - images.length, 10)
        : 1,
    };

    launchImageLibrary(options, (response: ImagePickerResponse) => {
      handleImagePickerResponse(response);
    });
  };

  const handleImagePickerResponse = (response: ImagePickerResponse) => {
    if (response.didCancel) {
      console.log('User cancelled image picker');
      return;
    }

    if (response.errorMessage) {
      console.log('ImagePicker Error: ', response.errorMessage);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
      return;
    }

    if (response.assets && response.assets.length > 0) {
      const newImages: ImageAsset[] = response.assets.map(asset => ({
        uri: asset.uri || '',
        width: asset.width,
        height: asset.height,
        size: asset.fileSize,
        type: asset.type,
        fileName: asset.fileName,
      }));

      const updatedImages = [...images, ...newImages];

      // Ensure we don't exceed maxImages
      if (updatedImages.length > maxImages) {
        Alert.alert(
          'Too Many Images',
          `You can only add up to ${maxImages} images. Only the first ${maxImages} will be kept.`,
        );
        onImagesChange(updatedImages.slice(0, maxImages));
      } else {
        onImagesChange(updatedImages);
      }
    }
  };

  const removeImage = (index: number) => {
    Alert.alert('Remove Photo', 'Are you sure you want to remove this photo?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          const newImages = images.filter((_, i) => i !== index);
          onImagesChange(newImages);
        },
      },
    ]);
  };

  const viewImage = (index: number) => {
    setSelectedImageIndex(index);
    setShowImageModal(true);
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes || bytes === 0) return '0 KB';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Circular mode for avatars
  if (circular) {
    const containerStyle = {
      width: size,
      height: size,
      borderRadius: size / 2,
    };

    if (images.length === 0) {
      return (
        <TouchableOpacity
          style={[styles.circularContainer, containerStyle]}
          onPress={showImagePickerOptions}
        >
          <View style={[styles.circularPlaceholder, containerStyle]}>
            <Icon name="add-a-photo" size={size / 3} color="#6B7280" />
          </View>
        </TouchableOpacity>
      );
    }

    return (
      <View style={[styles.circularContainer, containerStyle]}>
        <TouchableOpacity onPress={() => viewImage(0)}>
          <Image
            source={{ uri: images[0].uri }}
            style={[styles.circularImage, containerStyle]}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.editButton}
          onPress={showImagePickerOptions}
        >
          <Icon name="edit" size={12} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    );
  }

  // Regular grid mode
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {images.length > 0 && (
          <Text style={styles.counter}>
            {images.length}/{maxImages}
          </Text>
        )}
      </View>

      {/* Add Photo Button */}
      {images.length < maxImages && (
        <TouchableOpacity
          style={styles.addPhotoButton}
          onPress={showImagePickerOptions}
        >
          <Icon name="add-a-photo" size={24} color="#059669" />
          <Text style={styles.addPhotoText}>
            {images.length === 0 ? 'Add Photos' : 'Add More Photos'}
          </Text>
        </TouchableOpacity>
      )}

      {/* Selected Images */}
      {images.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.imagesScroll}
        >
          {images.map((image, index) => (
            <View key={index} style={styles.imageContainer}>
              <TouchableOpacity onPress={() => viewImage(index)}>
                <Image source={{ uri: image.uri }} style={styles.thumbnail} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeImage(index)}
              >
                <Icon name="close" size={16} color="#fff" />
              </TouchableOpacity>

              <View style={styles.imageInfo}>
                <Text style={styles.imageInfoText}>
                  {image.width && image.height
                    ? `${image.width}×${image.height}`
                    : 'Image'}
                </Text>
                <Text style={styles.imageInfoText}>
                  {formatFileSize(image.size)}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Full Screen Image Modal */}
      <Modal
        visible={showImageModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowImageModal(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setShowImageModal(false)}
          >
            <Icon name="close" size={24} color="#fff" />
          </TouchableOpacity>

          {images[selectedImageIndex] && (
            <Image
              source={{ uri: images[selectedImageIndex].uri }}
              style={styles.fullScreenImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  counter: {
    fontSize: 12,
    color: '#6B7280',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  addPhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 2,
    borderColor: '#BBF7D0',
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  addPhotoText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
    marginLeft: 8,
  },
  imagesScroll: {
    marginBottom: 8,
  },
  imageContainer: {
    marginRight: 12,
    position: 'relative',
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  removeButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageInfo: {
    marginTop: 4,
    alignItems: 'center',
  },
  imageInfoText: {
    fontSize: 10,
    color: '#6B7280',
  },
  // Circular styles
  circularContainer: {
    position: 'relative',
  },
  circularPlaceholder: {
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  circularImage: {
    backgroundColor: '#F3F4F6',
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
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: '90%',
    height: '80%',
  },
});

export default RealImagePicker;
