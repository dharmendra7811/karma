import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LocationService, {
  NearbyPlace,
  LocationCoordinates,
} from '../lib/locationService';

interface LocationPickerProps {
  onLocationSelect: (
    location: string,
    coordinates: LocationCoordinates,
  ) => void;
  onClose: () => void;
  currentLocation?: LocationCoordinates | null;
}

const LocationPicker: React.FC<LocationPickerProps> = ({
  onLocationSelect,
  onClose,
  currentLocation,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<NearbyPlace[]>([]);
  const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPlace[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingNearby, setIsLoadingNearby] = useState(false);
  const [activeTab, setActiveTab] = useState<'nearby' | 'search'>('nearby');

  useEffect(() => {
    if (activeTab === 'nearby') {
      loadNearbyPlaces();
    }
  }, [activeTab]);

  useEffect(() => {
    if (searchQuery.trim() && activeTab === 'search') {
      const timeoutId = setTimeout(() => {
        searchPlaces();
      }, 500); // Debounce search

      return () => clearTimeout(timeoutId);
    } else if (!searchQuery.trim()) {
      setSearchResults([]);
    }
  }, [searchQuery, activeTab]);

  const loadNearbyPlaces = async () => {
    setIsLoadingNearby(true);
    try {
      const places = await LocationService.searchNearbyPlaces(
        currentLocation?.latitude,
        currentLocation?.longitude,
        5000, // 5km radius
        '', // Empty query for general nearby places
      );
      setNearbyPlaces(places);
    } catch (error) {
      console.error('Error loading nearby places:', error);
      Alert.alert('Error', 'Failed to load nearby places');
    } finally {
      setIsLoadingNearby(false);
    }
  };

  const searchPlaces = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const places = await LocationService.searchPlaces(searchQuery, 15);
      setSearchResults(places);
    } catch (error) {
      console.error('Error searching places:', error);
      Alert.alert('Error', 'Failed to search places');
    } finally {
      setIsSearching(false);
    }
  };

  const handlePlaceSelect = (place: NearbyPlace) => {
    onLocationSelect(place.address, place.coordinates);
    onClose();
  };

  const useCurrentLocation = async () => {
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

        onLocationSelect(formattedLocation, location);
        onClose();
      } else {
        Alert.alert('Error', 'Unable to get your current location');
      }
    } catch (error) {
      console.error('Error getting current location:', error);
      Alert.alert('Error', 'Failed to get current location');
    }
  };

  const renderPlaceItem = ({ item }: { item: NearbyPlace }) => (
    <TouchableOpacity
      style={styles.placeItem}
      onPress={() => handlePlaceSelect(item)}
    >
      <View style={styles.placeInfo}>
        <Text style={styles.placeName}>{item.name}</Text>
        <Text style={styles.placeAddress} numberOfLines={2}>
          {item.address}
        </Text>
        {item.distance !== undefined && (
          <Text style={styles.placeDistance}>
            {item.distance < 1
              ? `${Math.round(item.distance * 1000)}m away`
              : `${item.distance.toFixed(1)}km away`}
          </Text>
        )}
      </View>
      <Icon name="place" size={24} color="#10B981" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Choose Location</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Icon name="close" size={24} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* Current Location Button */}
      <TouchableOpacity
        style={styles.currentLocationButton}
        onPress={useCurrentLocation}
      >
        <Icon name="my-location" size={20} color="#10B981" />
        <Text style={styles.currentLocationText}>Use Current Location</Text>
      </TouchableOpacity>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'nearby' && styles.activeTab]}
          onPress={() => setActiveTab('nearby')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'nearby' && styles.activeTabText,
            ]}
          >
            Nearby Places
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'search' && styles.activeTab]}
          onPress={() => setActiveTab('search')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'search' && styles.activeTabText,
            ]}
          >
            Search Places
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Input (only show for search tab) */}
      {activeTab === 'search' && (
        <View style={styles.searchContainer}>
          <Icon
            name="search"
            size={20}
            color="#6B7280"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for places..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          {isSearching && (
            <ActivityIndicator
              size="small"
              color="#10B981"
              style={styles.searchLoader}
            />
          )}
        </View>
      )}

      {/* Results List */}
      <View style={styles.resultsContainer}>
        {activeTab === 'nearby' ? (
          isLoadingNearby ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#10B981" />
              <Text style={styles.loadingText}>Finding nearby places...</Text>
            </View>
          ) : nearbyPlaces.length > 0 ? (
            <FlatList
              data={nearbyPlaces}
              renderItem={renderPlaceItem}
              keyExtractor={item => item.id}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Icon name="location-off" size={48} color="#9CA3AF" />
              <Text style={styles.emptyText}>No nearby places found</Text>
              <Text style={styles.emptySubtext}>
                Try enabling location services or search for a specific place
              </Text>
            </View>
          )
        ) : // Search results
        searchResults.length > 0 ? (
          <FlatList
            data={searchResults}
            renderItem={renderPlaceItem}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
          />
        ) : searchQuery.trim() ? (
          <View style={styles.emptyContainer}>
            <Icon name="search-off" size={48} color="#9CA3AF" />
            <Text style={styles.emptyText}>No places found</Text>
            <Text style={styles.emptySubtext}>
              Try searching with different keywords
            </Text>
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Icon name="search" size={48} color="#9CA3AF" />
            <Text style={styles.emptyText}>Search for places</Text>
            <Text style={styles.emptySubtext}>
              Enter a place name, address, or landmark
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  currentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F0FDF4',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  currentLocationText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
    color: '#10B981',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#111827',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    marginLeft: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 16,
    color: '#111827',
  },
  searchLoader: {
    marginRight: 12,
  },
  resultsContainer: {
    flex: 1,
    marginTop: 16,
  },
  placeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  placeInfo: {
    flex: 1,
  },
  placeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  placeAddress: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  placeDistance: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default LocationPicker;
