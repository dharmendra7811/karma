import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../contexts/AuthContext';
import { DeedService } from '../lib/deedService';
import { ActivityService } from '../lib/activityService';
import { DeedCategory } from '../lib/supabase';
import LocationService, { LocationCoordinates } from '../lib/locationService';
import LocationPicker from '../components/LocationPicker';
import RealImagePicker from '../components/RealImagePicker';
import { ImageUploadService } from '../services/ImageUploadService';

const ActionScreen: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'deed' | 'activity'>('deed');
  const [categories, setCategories] = useState<DeedCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Location state
  const [currentLocation, setCurrentLocation] =
    useState<LocationCoordinates | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [isWatchingLocation, setIsWatchingLocation] = useState(false);

  // Deed form state
  const [deedForm, setDeedForm] = useState({
    title: '',
    description: '',
    location: '',
    selectedCategory: '',
    longitude: null as string | null,
    latitude: null as string | null,
  });
  const [isSubmittingDeed, setIsSubmittingDeed] = useState(false);

  // Activity form state
  const [activityForm, setActivityForm] = useState({
    title: '',
    description: '',
    location: '',
    date: '',
    time: '',
    maxParticipants: '',
    selectedCategory: '',
    longitude: null as string | null,
    latitude: null as string | null,
  });
  const [isSubmittingActivity, setIsSubmittingActivity] = useState(false);

  // Image states
  const [deedImages, setDeedImages] = useState<
    Array<{
      uri: string;
      width?: number;
      height?: number;
      size?: number;
      type?: string;
      fileName?: string;
    }>
  >([]);
  const [activityImages, setActivityImages] = useState<
    Array<{
      uri: string;
      width?: number;
      height?: number;
      size?: number;
      type?: string;
      fileName?: string;
    }>
  >([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);

  // Location picker state
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [locationPickerType, setLocationPickerType] = useState<
    'deed' | 'activity'
  >('deed');

  useEffect(() => {
    loadCategories();
    return () => {
      // Clean up location watching when component unmounts
      LocationService.stopWatchingLocation();
    };
  }, []);

  const loadCategories = async () => {
    try {
      const categoriesData = await DeedService.getCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Failed to load categories:', error);
      Alert.alert('Error', 'Failed to load deed categories');
    } finally {
      setLoadingCategories(false);
    }
  };

  // Location functions
  const getCurrentLocation = async () => {
    setLocationLoading(true);
    try {
      const location = await LocationService.getCurrentLocation();
      if (location) {
        setCurrentLocation(location);
        return location;
      }
    } catch (error) {
      console.error('Error getting current location:', error);
    } finally {
      setLocationLoading(false);
    }
    return null;
  };

  const startLocationWatching = async () => {
    if (isWatchingLocation) {
      LocationService.stopWatchingLocation();
      setIsWatchingLocation(false);
      return;
    }

    const success = await LocationService.watchLocation(
      location => {
        setCurrentLocation(location);
      },
      error => {
        console.error('Location watch error:', error);
        setIsWatchingLocation(false);
      },
    );

    setIsWatchingLocation(success);
  };

  const fillLocationFromCurrent = async (formType: 'deed' | 'activity') => {
    setLocationLoading(true);
    try {
      const location = await LocationService.getCurrentLocation();
      if (location) {
        const address = await LocationService.reverseGeocode(
          location.latitude,
          location.longitude,
        );

        const formattedLocation =
          address?.formattedAddress ||
          LocationService.formatCoordinates(
            location.latitude,
            location.longitude,
          );

        if (formType === 'deed') {
          setDeedForm({
            ...deedForm,
            location: formattedLocation,
            longitude: location.longitude,
            latitude: location.latitude,
          });
        } else {
          setActivityForm({
            ...activityForm,
            location: formattedLocation,
            longitude: location.longitude,
            latitude: location.latitude,
          });
        }

        Alert.alert(
          'Location Added! 📍',
          `Your current location has been added to the ${formType}.`,
        );
      }
    } catch (error) {
      console.error('Error filling location:', error);
      Alert.alert('Error', 'Unable to get your location. Please try again.');
    } finally {
      setLocationLoading(false);
    }
  };

  const openLocationPicker = (formType: 'deed' | 'activity') => {
    setLocationPickerType(formType);
    setShowLocationPicker(true);
  };

  const handleLocationSelect = (
    location: string,
    coordinates: LocationCoordinates,
  ) => {
    console.log(`Location selected: ${location}`, coordinates);

    if (locationPickerType === 'deed') {
      setDeedForm({
        ...deedForm,
        location: location,
        longitude: coordinates.longitude,
        latitude: coordinates.latitude,
      });
    } else {
      setActivityForm({
        ...activityForm,
        location: location,
        longitude: coordinates.longitude,
        latitude: coordinates.latitude,
      });
    }

    Alert.alert(
      'Location Selected! 📍',
      `Location has been added to your ${locationPickerType}.`,
    );
  };

  const resetDeedForm = () => {
    setDeedForm({
      title: '',
      description: '',
      location: '',
      selectedCategory: '',
      longitude: null,
      latitude: null,
    });
    setDeedImages([]);
  };

  const resetActivityForm = () => {
    setActivityForm({
      title: '',
      description: '',
      location: '',
      date: '',
      time: '',
      maxParticipants: '',
      selectedCategory: '',
      longitude: null,
      latitude: null,
    });
    setActivityImages([]);
  };

  const handleSubmitDeed = async () => {
    if (!deedForm.title.trim()) {
      Alert.alert('Missing Information', 'Please enter a title for your deed.');
      return;
    }

    if (!deedForm.selectedCategory) {
      Alert.alert('Missing Information', 'Please select a category.');
      return;
    }

    setIsSubmittingDeed(true);
    let imageUrls: string[] = [];

    try {
      // Upload images if any
      if (deedImages.length > 0) {
        setIsUploadingImages(true);
        const uploadResult = await ImageUploadService.uploadMultipleImages(
          deedImages,
          'deed',
          user?.id,
          progress => {
            console.log(`Upload progress: ${Math.round(progress * 100)}%`);
          },
        );

        if (uploadResult.success) {
          imageUrls = uploadResult.urls;
        } else {
          // Show upload errors but still allow deed submission
          Alert.alert(
            'Image Upload Issues',
            `Some images failed to upload: ${uploadResult.errors.join(
              ', ',
            )}. Continue anyway?`,
            [
              {
                text: 'Cancel',
                style: 'cancel',
                onPress: () => {
                  setIsSubmittingDeed(false);
                  return;
                },
              },
              { text: 'Continue', onPress: () => {} },
            ],
          );
        }
        setIsUploadingImages(false);
      }

      await DeedService.logDeed({
        category_id: deedForm.selectedCategory,
        title: deedForm.title.trim(),
        description: deedForm.description.trim() || undefined,
        location: deedForm.location.trim() || undefined,
        latitude: deedForm.latitude,
        longitude: deedForm.longitude,
        image_urls: imageUrls.length > 0 ? imageUrls : undefined,
      });

      Alert.alert(
        'Good Deed Logged! 🌟',
        `Thank you for making the world a better place! Your karma has been updated.${
          imageUrls.length > 0 ? ` ${imageUrls.length} photo(s) attached.` : ''
        }`,
        [
          {
            text: 'Continue Spreading Kindness',
            onPress: resetDeedForm,
          },
        ],
      );
    } catch (error) {
      console.error('Failed to log deed:', error);
      Alert.alert('Error', 'Failed to log your deed. Please try again.');
    } finally {
      setIsSubmittingDeed(false);
      setIsUploadingImages(false);
    }
  };

  const handleSubmitActivity = async () => {
    if (!activityForm.title.trim()) {
      Alert.alert(
        'Missing Information',
        'Please enter a title for your activity.',
      );
      return;
    }

    if (!activityForm.description.trim()) {
      Alert.alert(
        'Missing Information',
        'Please enter a description for your activity.',
      );
      return;
    }

    if (!activityForm.date) {
      Alert.alert(
        'Missing Information',
        'Please select a date for your activity.',
      );
      return;
    }

    if (!activityForm.time) {
      Alert.alert(
        'Missing Information',
        'Please select a time for your activity.',
      );
      return;
    }

    setIsSubmittingActivity(true);
    console.log('activityForm', activityForm);

    try {
      await ActivityService.createActivity({
        title: activityForm.title.trim(),
        description: activityForm.description.trim(),
        location: activityForm.location.trim() || undefined,
        activity_date: activityForm.date,
        activity_time: activityForm.time,
        max_participants: activityForm.maxParticipants
          ? parseInt(activityForm.maxParticipants)
          : undefined,
        category_id: activityForm.selectedCategory || undefined,
        latitude: activityForm.latitude as string,
        longitude: activityForm.longitude as string,
      });

      Alert.alert(
        'Activity Created! 🎉',
        'Your community activity has been posted! Others can now join and help make a difference together.',
        [
          {
            text: 'Great!',
            onPress: resetActivityForm,
          },
        ],
      );
    } catch (error) {
      console.error('Failed to create activity:', error);
      Alert.alert('Error', 'Failed to create your activity. Please try again.');
    } finally {
      setIsSubmittingActivity(false);
    }
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const renderLocationInfo = () => {
    if (!currentLocation) return null;

    return (
      <View style={styles.locationInfoContainer}>
        <View style={styles.locationHeader}>
          <Icon name="my-location" size={16} color="#059669" />
          <Text style={styles.locationInfoTitle}>Your Current Location</Text>
          <TouchableOpacity
            style={styles.locationWatchButton}
            onPress={startLocationWatching}
          >
            <Icon
              name={isWatchingLocation ? 'gps-fixed' : 'gps-not-fixed'}
              size={16}
              color={isWatchingLocation ? '#059669' : '#6B7280'}
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.locationCoords}>
          {LocationService.formatCoordinates(
            currentLocation.latitude,
            currentLocation.longitude,
          )}
        </Text>
        {currentLocation.accuracy && (
          <Text style={styles.locationAccuracy}>
            Accuracy: ±{Math.round(currentLocation.accuracy)}m
          </Text>
        )}
      </View>
    );
  };

  const renderLocationButtons = (formType: 'deed' | 'activity') => (
    <View style={styles.locationButtonsContainer}>
      <TouchableOpacity
        style={[styles.locationButton, styles.locationButtonHalf]}
        onPress={() => fillLocationFromCurrent(formType)}
        disabled={locationLoading}
      >
        {locationLoading ? (
          <ActivityIndicator size="small" color="#059669" />
        ) : (
          <Icon name="my-location" size={16} color="#059669" />
        )}
        <Text style={styles.locationButtonText}>
          {locationLoading ? 'Getting...' : 'Current'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.locationButton, styles.locationButtonHalf]}
        onPress={() => openLocationPicker(formType)}
      >
        <Icon name="search" size={16} color="#059669" />
        <Text style={styles.locationButtonText}>Search Places</Text>
      </TouchableOpacity>
    </View>
  );

  const renderCategorySelection = (
    selectedCategory: string,
    onSelect: (id: string) => void,
  ) => (
    <>
      <Text style={styles.sectionLabel}>Choose a category: *</Text>
      {loadingCategories ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#10B981" />
          <Text style={styles.loadingText}>Loading categories...</Text>
        </View>
      ) : (
        <View style={styles.categoriesContainer}>
          {categories.map(category => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryTag,
                selectedCategory === category.id && styles.categoryTagSelected,
              ]}
              onPress={() => onSelect(category.id)}
            >
              <Icon
                name={category.icon || 'category'}
                size={16}
                color={
                  selectedCategory === category.id
                    ? '#FFFFFF'
                    : category.color || '#059669'
                }
              />
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category.id &&
                    styles.categoryTextSelected,
                ]}
              >
                {category.name}
              </Text>
              {category.karma_multiplier > 1 && (
                <Text
                  style={[
                    styles.multiplierText,
                    selectedCategory === category.id &&
                      styles.multiplierTextSelected,
                  ]}
                >
                  {category.karma_multiplier}x
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </>
  );

  const renderLogDeedTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.tabTitle}>What good did you do today? ✨</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Title *</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Give your deed a title..."
          placeholderTextColor="#9CA3AF"
          value={deedForm.title}
          onChangeText={text => setDeedForm({ ...deedForm, title: text })}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Description</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Tell us more about what you did..."
          placeholderTextColor="#9CA3AF"
          value={deedForm.description}
          onChangeText={text => setDeedForm({ ...deedForm, description: text })}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Location (Optional)</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Where did this happen?"
          placeholderTextColor="#9CA3AF"
          value={deedForm.location}
          onChangeText={text => setDeedForm({ ...deedForm, location: text })}
        />
        {renderLocationButtons('deed')}
        {deedForm.longitude && deedForm.latitude && (
          <View style={styles.coordinateInfo}>
            <Icon name="place" size={14} color="#059669" />
            <Text style={styles.coordinateText}>
              {LocationService.formatCoordinates(
                deedForm.latitude,
                deedForm.longitude,
              )}
            </Text>
          </View>
        )}
      </View>

      {renderCategorySelection(deedForm.selectedCategory, id =>
        setDeedForm({ ...deedForm, selectedCategory: id }),
      )}

      <RealImagePicker
        images={deedImages}
        onImagesChange={setDeedImages}
        maxImages={3}
        title="Add Photos (Optional)"
        allowMultiple={true}
        quality={0.7}
        maxWidth={800}
        maxHeight={600}
      />

      {isUploadingImages && (
        <View style={styles.uploadingContainer}>
          <ActivityIndicator size="small" color="#059669" />
          <Text style={styles.uploadingText}>Uploading images...</Text>
        </View>
      )}

      <TouchableOpacity
        style={[
          styles.submitButton,
          isSubmittingDeed && styles.submitButtonDisabled,
        ]}
        onPress={handleSubmitDeed}
        disabled={isSubmittingDeed}
      >
        {isSubmittingDeed ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text style={styles.submitButtonText}>Log Your Good Deed 🌱</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );

  const renderCreateActivityTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.tabTitle}>Plan a community event 🌍</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Event Title *</Text>
        <TextInput
          style={styles.textInput}
          placeholder="What's your event called?"
          placeholderTextColor="#9CA3AF"
          value={activityForm.title}
          onChangeText={text =>
            setActivityForm({ ...activityForm, title: text })
          }
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Description *</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Tell people about your event and what you'll do together..."
          placeholderTextColor="#9CA3AF"
          value={activityForm.description}
          onChangeText={text =>
            setActivityForm({ ...activityForm, description: text })
          }
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>

      <View style={styles.rowContainer}>
        <View style={[styles.inputContainer, styles.halfWidth]}>
          <Text style={styles.inputLabel}>Date *</Text>
          <TextInput
            style={styles.textInput}
            placeholder={getTodayDate()}
            placeholderTextColor="#9CA3AF"
            value={activityForm.date}
            onChangeText={text =>
              setActivityForm({ ...activityForm, date: text })
            }
          />
          <Text style={styles.helpText}>Format: YYYY-MM-DD</Text>
        </View>

        <View style={[styles.inputContainer, styles.halfWidth]}>
          <Text style={styles.inputLabel}>Time *</Text>
          <TextInput
            style={styles.textInput}
            placeholder={getCurrentTime()}
            placeholderTextColor="#9CA3AF"
            value={activityForm.time}
            onChangeText={text =>
              setActivityForm({ ...activityForm, time: text })
            }
          />
          <Text style={styles.helpText}>Format: HH:MM (24h)</Text>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Location</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Where will this happen?"
          placeholderTextColor="#9CA3AF"
          value={activityForm.location}
          onChangeText={text =>
            setActivityForm({ ...activityForm, location: text })
          }
        />
        {renderLocationButtons('activity')}
        {activityForm.longitude && activityForm.latitude && (
          <View style={styles.coordinateInfo}>
            <Icon name="place" size={14} color="#059669" />
            <Text style={styles.coordinateText}>
              {LocationService.formatCoordinates(
                activityForm.latitude,
                activityForm.longitude,
              )}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Max Participants (Optional)</Text>
        <TextInput
          style={styles.textInput}
          placeholder="How many people can join?"
          placeholderTextColor="#9CA3AF"
          value={activityForm.maxParticipants}
          onChangeText={text =>
            setActivityForm({ ...activityForm, maxParticipants: text })
          }
          keyboardType="numeric"
        />
      </View>

      <Text style={styles.sectionLabel}>Category (Optional):</Text>
      {loadingCategories ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#10B981" />
          <Text style={styles.loadingText}>Loading categories...</Text>
        </View>
      ) : (
        <View style={styles.categoriesContainer}>
          {categories.map(category => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryTag,
                activityForm.selectedCategory === category.id &&
                  styles.categoryTagSelected,
              ]}
              onPress={() =>
                setActivityForm({
                  ...activityForm,
                  selectedCategory:
                    activityForm.selectedCategory === category.id
                      ? ''
                      : category.id,
                })
              }
            >
              <Icon
                name={category.icon || 'category'}
                size={16}
                color={
                  activityForm.selectedCategory === category.id
                    ? '#FFFFFF'
                    : category.color || '#059669'
                }
              />
              <Text
                style={[
                  styles.categoryText,
                  activityForm.selectedCategory === category.id &&
                    styles.categoryTextSelected,
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <RealImagePicker
        images={activityImages}
        onImagesChange={setActivityImages}
        maxImages={5}
        title="Event Photos (Optional)"
        allowMultiple={true}
        quality={0.7}
        maxWidth={800}
        maxHeight={600}
      />

      {isUploadingImages && (
        <View style={styles.uploadingContainer}>
          <ActivityIndicator size="small" color="#059669" />
          <Text style={styles.uploadingText}>Uploading images...</Text>
        </View>
      )}

      <TouchableOpacity
        style={[
          styles.submitButton,
          isSubmittingActivity && styles.submitButtonDisabled,
        ]}
        onPress={handleSubmitActivity}
        disabled={isSubmittingActivity}
      >
        {isSubmittingActivity ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text style={styles.submitButtonText}>Create Community Event 🎉</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Location Info Header */}
      {/* <View style={styles.locationSection}>
        {currentLocation ? (
          renderLocationInfo()
        ) : (
          <TouchableOpacity
            style={styles.getLocationButton}
            onPress={getCurrentLocation}
            disabled={locationLoading}
          >
            {locationLoading ? (
              <ActivityIndicator size="small" color="#059669" />
            ) : (
              <Icon name="location-searching" size={20} color="#059669" />
            )}
            <Text style={styles.getLocationButtonText}>
              {locationLoading
                ? 'Getting your location...'
                : 'Get Current Location'}
            </Text>
          </TouchableOpacity>
        )}
      </View> */}

      {/* Tab Header */}
      <View style={styles.tabHeader}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'deed' && styles.activeTab]}
          onPress={() => setActiveTab('deed')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'deed' && styles.activeTabText,
            ]}
          >
            Log a Deed
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'activity' && styles.activeTab]}
          onPress={() => setActiveTab('activity')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'activity' && styles.activeTabText,
            ]}
          >
            Create Activity
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {activeTab === 'deed' ? renderLogDeedTab() : renderCreateActivityTab()}

      {/* Location Picker Modal */}
      <Modal
        visible={showLocationPicker}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <LocationPicker
          onLocationSelect={handleLocationSelect}
          onClose={() => setShowLocationPicker(false)}
          currentLocation={currentLocation}
        />
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  tabHeader: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#F0FDF4',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#065F46',
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  tabTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#065F46',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#374151',
  },
  textArea: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#374151',
    minHeight: 100,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  helpText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginLeft: 8,
    color: '#6B7280',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  categoryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  categoryTagSelected: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  categoryText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 6,
  },
  categoryTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  multiplierText: {
    fontSize: 12,
    color: '#F59E0B',
    marginLeft: 4,
    fontWeight: 'bold',
  },
  multiplierTextSelected: {
    color: '#FEF3C7',
  },
  submitButton: {
    backgroundColor: '#10B981',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  locationSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F0FDF4',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  locationInfoContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  locationInfoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
    flex: 1,
    marginLeft: 6,
  },
  locationWatchButton: {
    padding: 4,
  },
  locationCoords: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'monospace',
  },
  locationAccuracy: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  getLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#D1FAE5',
    borderStyle: 'dashed',
  },
  getLocationButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
    marginLeft: 8,
  },
  locationButtonsContainer: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  locationButtonHalf: {
    flex: 1,
  },
  locationButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#059669',
    marginLeft: 6,
  },
  coordinateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 6,
    padding: 8,
    marginTop: 6,
  },
  coordinateText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
    fontFamily: 'monospace',
  },
  uploadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  uploadingText: {
    fontSize: 14,
    color: '#059669',
    marginLeft: 8,
    fontFamily: 'System',
  },
});

export default ActionScreen;
