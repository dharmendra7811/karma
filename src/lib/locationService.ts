import Geolocation from '@react-native-community/geolocation';
import { Platform, PermissionsAndroid, Alert } from 'react-native';

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface LocationAddress {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  formattedAddress?: string;
}

export interface NearbyPlace {
  id: string;
  name: string;
  address: string;
  coordinates: LocationCoordinates;
  distance?: number;
  type?: string;
}

class LocationService {
  private watchId: number | null = null;

  /**
   * Request location permissions for Android
   */
  private async requestLocationPermission(): Promise<boolean> {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        ]);

        return (
          granted[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] === 'granted' ||
          granted[PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION] === 'granted'
        );
      } catch (error) {
        console.error('Permission request error:', error);
        return false;
      }
    }
    return true; // iOS permissions are handled in Info.plist
  }

  /**
   * Get current location once
   */
  async getCurrentLocation(): Promise<LocationCoordinates | null> {
    const hasPermission = await this.requestLocationPermission();
    if (!hasPermission) {
      Alert.alert(
        'Location Permission Required',
        'Please enable location permissions to use this feature.',
      );
      return null;
    }

    return new Promise((resolve) => {
      // Try high accuracy first
      Geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
        },
        (error) => {
          console.error('High accuracy location failed:', error);
          // Fallback to lower accuracy with longer timeout
          Geolocation.getCurrentPosition(
            (position) => {
              resolve({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
              });
            },
            (fallbackError) => {
              console.error('Error getting current location:', fallbackError);
              resolve(null);
            },
            {
              enableHighAccuracy: false,
              timeout: 30000,
              maximumAge: 60000,
            },
          );
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 5000,
        },
      );
    });
  }

  /**
   * Watch location changes (real-time updates)
   */
  watchLocation(
    onLocationUpdate: (location: LocationCoordinates) => void,
    onError?: (error: any) => void,
  ): Promise<boolean> {
    return new Promise(async (resolve) => {
      const hasPermission = await this.requestLocationPermission();
      if (!hasPermission) {
        Alert.alert(
          'Location Permission Required',
          'Please enable location permissions to use real-time location.',
        );
        resolve(false);
        return;
      }

      this.watchId = Geolocation.watchPosition(
        (position) => {
          onLocationUpdate({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
        },
        (error) => {
          console.error('Location watch error:', error);
          if (onError) {
            onError(error);
          }
        },
        {
          enableHighAccuracy: true,
          distanceFilter: 10, // Only update if moved 10 meters
          interval: 5000, // Update every 5 seconds
          fastestInterval: 2000, // Fastest update interval
        },
      );

      resolve(true);
    });
  }

  /**
   * Stop watching location
   */
  stopWatchingLocation(): void {
    if (this.watchId !== null) {
      Geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  /**
   * Reverse geocoding - convert coordinates to address
   * Using free Nominatim service (OpenStreetMap)
   */
  async reverseGeocode(
    latitude: number,
    longitude: number,
  ): Promise<LocationAddress | null> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'Karma-App/1.0.0', // Required by Nominatim
          },
        },
      );

      if (!response.ok) {
        throw new Error('Geocoding request failed');
      }

      const data = await response.json();
      
      if (data && data.address) {
        const address = data.address;
        return {
          street: `${address.house_number || ''} ${address.road || ''}`.trim(),
          city: address.city || address.town || address.village || address.hamlet,
          state: address.state || address.region,
          country: address.country,
          postalCode: address.postcode,
          formattedAddress: data.display_name,
        };
      }

      return null;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return null;
    }
  }

  /**
   * Forward geocoding - convert address to coordinates
   * Using free Nominatim service (OpenStreetMap)
   */
  async geocodeAddress(address: string): Promise<LocationCoordinates | null> {
    try {
      const encodedAddress = encodeURIComponent(address);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`,
        {
          headers: {
            'User-Agent': 'Karma-App/1.0.0', // Required by Nominatim
          },
        },
      );

      if (!response.ok) {
        throw new Error('Geocoding request failed');
      }

      const data = await response.json();
      
      if (data && data.length > 0) {
        const result = data[0];
        return {
          latitude: parseFloat(result.lat),
          longitude: parseFloat(result.lon),
        };
      }

      return null;
    } catch (error) {
      console.error('Forward geocoding error:', error);
      return null;
    }
  }

  /**
   * Calculate distance between two coordinates (in kilometers)
   */
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
    return Math.round(distance * 100) / 100; // Round to 2 decimal places
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  /**
   * Search for nearby places around current location or given coordinates
   */
  async searchNearbyPlaces(
    centerLat?: number,
    centerLon?: number,
    radius: number = 5000, // 5km radius by default
    query: string = '',
  ): Promise<NearbyPlace[]> {
    try {
      let searchLat = centerLat;
      let searchLon = centerLon;

      // If no coordinates provided, try to get current location
      if (!searchLat || !searchLon) {
        const currentLocation = await this.getCurrentLocation();
        if (!currentLocation) {
          throw new Error('Unable to get location for nearby search');
        }
        searchLat = currentLocation.latitude;
        searchLon = currentLocation.longitude;
      }

      // Build search query
      let searchQuery = query;
      if (!searchQuery) {
        // Default search for common places
        searchQuery = 'restaurant,cafe,shop,park,hospital,school,bank,pharmacy';
      }

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&lat=${searchLat}&lon=${searchLon}&radius=${radius}&limit=20&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'Karma-App/1.0.0',
          },
        },
      );

      if (!response.ok) {
        throw new Error('Nearby places search failed');
      }

      const data = await response.json();
      
      const places: NearbyPlace[] = data.map((place: any, index: number) => {
        const lat = parseFloat(place.lat);
        const lon = parseFloat(place.lon);
        const distance = this.calculateDistance(searchLat!, searchLon!, lat, lon);

        return {
          id: place.place_id?.toString() || `place_${index}`,
          name: place.display_name.split(',')[0], // First part is usually the name
          address: place.display_name,
          coordinates: {
            latitude: lat,
            longitude: lon,
          },
          distance: distance,
          type: place.type || place.class,
        };
      });

      // Sort by distance
      return places.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    } catch (error) {
      console.error('Error searching nearby places:', error);
      return [];
    }
  }

  /**
   * Search for places by text query
   */
  async searchPlaces(query: string, limit: number = 10): Promise<NearbyPlace[]> {
    try {
      if (!query.trim()) {
        return [];
      }

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=${limit}&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'Karma-App/1.0.0',
          },
        },
      );

      if (!response.ok) {
        throw new Error('Places search failed');
      }

      const data = await response.json();
      
      return data.map((place: any, index: number) => ({
        id: place.place_id?.toString() || `search_${index}`,
        name: place.display_name.split(',')[0],
        address: place.display_name,
        coordinates: {
          latitude: parseFloat(place.lat),
          longitude: parseFloat(place.lon),
        },
        type: place.type || place.class,
      }));
    } catch (error) {
      console.error('Error searching places:', error);
      return [];
    }
  }

  /**
   * Format coordinates for display
   */
  formatCoordinates(lat: number, lng: number): string {
    const latDir = lat >= 0 ? 'N' : 'S';
    const lngDir = lng >= 0 ? 'E' : 'W';
    return `${Math.abs(lat).toFixed(4)}°${latDir}, ${Math.abs(lng).toFixed(4)}°${lngDir}`;
  }
}

export default new LocationService();