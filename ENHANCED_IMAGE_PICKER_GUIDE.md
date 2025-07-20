# Enhanced Image Picker with Cropping Setup Guide

## What's New
✅ Built-in image cropping with circular overlay for avatars
✅ Proper camera permissions handling
✅ Better error handling and user feedback
✅ Support for both avatar (circular) and general (freeform) cropping
✅ Automatic image optimization and compression

## New Components

### 1. EnhancedAvatarPicker
- Perfect circular cropping for profile pictures
- Camera and gallery access with permissions
- Emoji fallback options
- Built-in upload integration

### 2. EnhancedImagePicker
- Flexible cropping (square, rectangle, freeform)
- Configurable crop dimensions
- Reusable for any image selection needs

## Integration Steps

### Step 1: Replace AvatarPicker in ProfileScreen

In your ProfileScreen.tsx, replace the current AvatarPicker import:

```typescript
// OLD
import AvatarPicker from '../components/AvatarPicker';

// NEW
import EnhancedAvatarPicker from '../components/EnhancedAvatarPicker';
```

Then update the component usage:

```typescript
// Replace AvatarPicker with EnhancedAvatarPicker
<EnhancedAvatarPicker
  currentAvatarUrl={profile?.avatar_url}
  currentAvatarEmoji={profile?.avatar_emoji}
  onUploadSuccess={handleAvatarUpload}
  onUploadStart={() => setIsUploading(true)}
  onUploadEnd={() => setIsUploading(false)}
  userId={user?.id}
  size={100}
/>
```

### Step 2: Use EnhancedImagePicker for Deed Images

In your ActionScreen.tsx or wherever you select deed images:

```typescript
import EnhancedImagePicker from '../components/EnhancedImagePicker';

// For deed photos (landscape-friendly cropping)
<EnhancedImagePicker
  onImageSelected={handleImageSelected}
  cropSettings={{
    width: 800,
    height: 600,
    cropping: true,
    circular: false,
    freeStyleCrop: true,
  }}
>
  <TouchableOpacity style={styles.addPhotoButton}>
    <Icon name="add-a-photo" size={24} color="#6B7280" />
    <Text>Add Photo</Text>
  </TouchableOpacity>
</EnhancedImagePicker>
```

### Step 3: Test the Camera Functionality

The enhanced components include:
- Automatic permission requests
- Better error messages
- Fallback handling for permission denials
- Camera availability checks

## Camera Issues Debug

If camera still doesn't work, try these steps:

### 1. Check Device Camera Access
```typescript
// Add this debug function to test camera availability
const testCameraAccess = async () => {
  try {
    const image = await ImageCropPicker.openCamera({
      width: 400,
      height: 400,
      cropping: false,
      mediaType: 'photo',
    });
    console.log('Camera test successful:', image);
  } catch (error) {
    console.log('Camera test failed:', error);
  }
};
```

### 2. Android Permissions
Make sure these permissions are in AndroidManifest.xml (already added):
```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
```

### 3. iOS Info.plist
For iOS, add these keys to Info.plist:
```xml
<key>NSCameraUsageDescription</key>
<string>This app needs access to camera to take photos for your profile and good deeds.</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>This app needs access to photo library to select images for your profile and good deeds.</string>
```

## Features of the Enhanced Components

### Cropping Options
- **Circular cropping**: Perfect for avatars
- **Freeform cropping**: For deed photos
- **Fixed aspect ratio**: When needed
- **Rotation support**: Built-in rotation gestures

### User Experience
- **Better error messages**: Clear feedback for permission issues
- **Loading states**: Visual feedback during upload
- **Cancellation handling**: Graceful handling of user cancellation
- **Permission requests**: Automatic Android permission handling

### Image Quality
- **Automatic compression**: Reduces file size while maintaining quality
- **Configurable quality**: Adjustable compression settings
- **Optimal dimensions**: Crops to optimal sizes for faster uploads

## Testing Checklist

1. ✅ Install react-native-image-crop-picker
2. ⏳ Replace AvatarPicker with EnhancedAvatarPicker
3. ⏳ Test camera access on device
4. ⏳ Test gallery access
5. ⏳ Test cropping functionality
6. ⏳ Test upload after cropping
7. ⏳ Test permission denied scenarios

## Common Issues & Solutions

### Camera not opening
- Check device has camera
- Verify permissions are granted
- Try on physical device (not emulator)
- Check Android API level compatibility

### Gallery not accessible
- Check storage permissions
- Verify library installation
- Clear app cache and try again

### Cropping not working
- Update to latest react-native-image-crop-picker
- Check device memory availability
- Try with smaller images first

## Next Steps

1. Replace the old components with the enhanced versions
2. Test on physical device
3. Check console logs for any errors
4. Let me know if you encounter any specific issues!
