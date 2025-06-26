import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width, height } = Dimensions.get('window');

interface Activity {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
  participants: number;
  maxParticipants?: number;
  latitude: number;
  longitude: number;
  organizer: string;
}

interface FilterOption {
  id: string;
  label: string;
  icon: string;
}

const ExploreScreen: React.FC = () => {
  const [viewMode, setViewMode] = useState<'map' | 'list'>('list');
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [selectedFilters, setSelectedFilters] = useState<{
    category: string;
    date: string;
    distance: string;
  }>({
    category: 'all',
    date: 'all',
    distance: 'all',
  });

  const mockActivities: Activity[] = [
    {
      id: '1',
      title: 'Community Garden Cleanup',
      description: 'Help us maintain our beautiful community garden. Bring gloves and enthusiasm!',
      date: 'June 28, 2025',
      time: '9:00 AM',
      location: 'Central Community Garden',
      category: 'environment',
      participants: 12,
      maxParticipants: 20,
      latitude: 22.3072,
      longitude: 73.1812,
      organizer: 'Green Earth Society',
    },
    {
      id: '2',
      title: 'Free Coding Workshop',
      description: 'Learn basic web development skills. Laptops will be provided for beginners.',
      date: 'June 29, 2025',
      time: '2:00 PM',
      location: 'Tech Hub Vadodara',
      category: 'education',
      participants: 8,
      maxParticipants: 15,
      latitude: 22.3039,
      longitude: 73.1810,
      organizer: 'CodeForGood',
    },
    {
      id: '3',
      title: 'Senior Citizens Visit',
      description: 'Spend time with elderly residents, share stories and bring smiles.',
      date: 'June 30, 2025',
      time: '10:30 AM',
      location: 'Sunset Care Home',
      category: 'helping',
      participants: 6,
      maxParticipants: 10,
      latitude: 22.3000,
      longitude: 73.1850,
      organizer: 'Caring Hearts',
    },
    {
      id: '4',
      title: 'Beach Cleanup Drive',
      description: 'Join us to clean up the local waterfront and protect marine life.',
      date: 'July 1, 2025',
      time: '6:00 AM',
      location: 'Narmada Riverfront',
      category: 'environment',
      participants: 25,
      maxParticipants: 50,
      latitude: 22.3200,
      longitude: 73.1700,
      organizer: 'Ocean Guardians',
    },
    {
      id: '5',
      title: 'Food Distribution',
      description: 'Help distribute meals to underprivileged families in our community.',
      date: 'July 2, 2025',
      time: '7:00 PM',
      location: 'Community Center',
      category: 'helping',
      participants: 15,
      latitude: 22.2950,
      longitude: 73.1900,
      organizer: 'Feed Forward',
    },
  ];

  const categoryFilters: FilterOption[] = [
    { id: 'all', label: 'All', icon: 'apps' },
    { id: 'environment', label: 'Environment', icon: 'eco' },
    { id: 'helping', label: 'Helping', icon: 'favorite' },
    { id: 'education', label: 'Education', icon: 'school' },
    { id: 'health', label: 'Health', icon: 'local-hospital' },
  ];

  const dateFilters: FilterOption[] = [
    { id: 'all', label: 'Any Time', icon: 'schedule' },
    { id: 'today', label: 'Today', icon: 'today' },
    { id: 'week', label: 'This Week', icon: 'date-range' },
    { id: 'month', label: 'This Month', icon: 'event' },
  ];

  const distanceFilters: FilterOption[] = [
    { id: 'all', label: 'Any Distance', icon: 'near-me' },
    { id: '1km', label: 'Within 1km', icon: 'location-on' },
    { id: '5km', label: 'Within 5km', icon: 'location-on' },
    { id: '10km', label: 'Within 10km', icon: 'location-on' },
  ];

  const getCategoryEmoji = (category: string) => {
    switch (category) {
      case 'environment': return '🌱';
      case 'helping': return '🤝';
      case 'education': return '📚';
      case 'health': return '🏥';
      default: return '🌟';
    }
  };

  const handleJoinActivity = (activity: Activity) => {
    Alert.alert(
      `Join "${activity.title}"? 🌟`,
      `Are you ready to make a positive impact with ${activity.organizer}?`,
      [
        { text: 'Not Yet', style: 'cancel' },
        { 
          text: 'Count Me In!', 
          onPress: () => {
            Alert.alert(
              'Awesome! 🎉',
              `You've successfully joined "${activity.title}". The organizer will send you details soon.`,
              [{ text: 'Great!', style: 'default' }]
            );
          }
        }
      ]
    );
  };

  const handleCreateActivity = () => {
    Alert.alert(
      'Create New Activity 🌍',
      'Ready to organize something amazing for your community?',
      [
        { text: 'Not Now', style: 'cancel' },
        { text: 'Let\'s Do It!', onPress: () => console.log('Navigate to create activity') }
      ]
    );
  };

  const filteredActivities = mockActivities.filter(activity => {
    if (selectedFilters.category !== 'all' && activity.category !== selectedFilters.category) {
      return false;
    }
    // Add date and distance filtering logic here in a real app
    return true;
  });

  const renderActivityCard = (activity: Activity, isMapPreview: boolean = false) => (
    <View style={[styles.activityCard, isMapPreview && styles.mapPreviewCard]}>
      <View style={styles.activityHeader}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryEmoji}>{getCategoryEmoji(activity.category)}</Text>
          <Text style={styles.categoryText}>{activity.category}</Text>
        </View>
        <View style={styles.participantsInfo}>
          <Icon name="people" size={16} color="#059669" />
          <Text style={styles.participantsText}>
            {activity.participants}{activity.maxParticipants ? `/${activity.maxParticipants}` : ''}
          </Text>
        </View>
      </View>
      
      <Text style={styles.activityTitle}>{activity.title}</Text>
      
      {!isMapPreview && (
        <Text style={styles.activityDescription} numberOfLines={2}>
          {activity.description}
        </Text>
      )}
      
      <View style={styles.activityMeta}>
        <View style={styles.metaItem}>
          <Icon name="schedule" size={16} color="#6B7280" />
          <Text style={styles.metaText}>{activity.date} • {activity.time}</Text>
        </View>
        <View style={styles.metaItem}>
          <Icon name="place" size={16} color="#6B7280" />
          <Text style={styles.metaText}>{activity.location}</Text>
        </View>
        {!isMapPreview && (
          <View style={styles.metaItem}>
            <Icon name="person" size={16} color="#6B7280" />
            <Text style={styles.metaText}>by {activity.organizer}</Text>
          </View>
        )}
      </View>
      
      <TouchableOpacity 
        style={styles.joinButton}
        onPress={() => handleJoinActivity(activity)}
      >
        <Text style={styles.joinButtonText}>Join Activity</Text>
      </TouchableOpacity>
    </View>
  );

  const renderMapView = () => (
    <View style={styles.mapContainer}>
      <View style={styles.mapPlaceholder}>
        <Icon name="map" size={48} color="#10B981" />
        <Text style={styles.mapPlaceholderText}>Interactive Map Coming Soon</Text>
        <Text style={styles.mapSubText}>
          Tap pins to see activity details
        </Text>
      </View>
      
      {/* Mock pin preview */}
      {selectedActivity && (
        <View style={styles.mapPreview}>
          {renderActivityCard(selectedActivity, true)}
        </View>
      )}
    </View>
  );

  const renderListView = () => (
    <ScrollView 
      style={styles.listContainer}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContent}
    >
      {filteredActivities.map((activity) => (
        <View key={activity.id}>
          {renderActivityCard(activity)}
        </View>
      ))}
    </ScrollView>
  );

  const renderFilterChips = (
    filters: FilterOption[], 
    selectedValue: string, 
    onSelect: (value: string) => void
  ) => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.filterScroll}
      contentContainerStyle={styles.filterContainer}
    >
      {filters.map((filter) => (
        <TouchableOpacity
          key={filter.id}
          style={[
            styles.filterChip,
            selectedValue === filter.id && styles.filterChipSelected
          ]}
          onPress={() => onSelect(filter.id)}
        >
          <Icon 
            name={filter.icon} 
            size={16} 
            color={selectedValue === filter.id ? '#065F46' : '#6B7280'} 
          />
          <Text style={[
            styles.filterChipText,
            selectedValue === filter.id && styles.filterChipTextSelected
          ]}>
            {filter.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore Nearby Activities 🌍</Text>
        <Text style={styles.headerSubtitle}>Find ways to make a difference together</Text>
      </View>

      {/* View Toggle */}
      <View style={styles.viewToggle}>
        <TouchableOpacity
          style={[styles.toggleButton, viewMode === 'list' && styles.toggleButtonActive]}
          onPress={() => setViewMode('list')}
        >
          <Icon name="list" size={20} color={viewMode === 'list' ? '#065F46' : '#6B7280'} />
          <Text style={[
            styles.toggleText,
            viewMode === 'list' && styles.toggleTextActive
          ]}>
            List
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, viewMode === 'map' && styles.toggleButtonActive]}
          onPress={() => setViewMode('map')}
        >
          <Icon name="map" size={20} color={viewMode === 'map' ? '#065F46' : '#6B7280'} />
          <Text style={[
            styles.toggleText,
            viewMode === 'map' && styles.toggleTextActive
          ]}>
            Map
          </Text>
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <View style={styles.filtersSection}>
        <Text style={styles.filterLabel}>Category:</Text>
        {renderFilterChips(
          categoryFilters, 
          selectedFilters.category, 
          (value) => setSelectedFilters({...selectedFilters, category: value})
        )}
        
        <Text style={styles.filterLabel}>When:</Text>
        {renderFilterChips(
          dateFilters, 
          selectedFilters.date, 
          (value) => setSelectedFilters({...selectedFilters, date: value})
        )}
        
        <Text style={styles.filterLabel}>Distance:</Text>
        {renderFilterChips(
          distanceFilters, 
          selectedFilters.distance, 
          (value) => setSelectedFilters({...selectedFilters, distance: value})
        )}
      </View>

      {/* Content */}
      {viewMode === 'map' ? renderMapView() : renderListView()}

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={handleCreateActivity}>
        <View style={styles.fabInner}>
          <Icon name="add" size={24} color="#FFFFFF" />
        </View>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#F0FDF4',
    borderBottomWidth: 2,
    borderBottomColor: '#FEF3E0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#065F46',
    textAlign: 'center',
    marginBottom: 4,
    fontFamily: 'System',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#059669',
    textAlign: 'center',
    fontFamily: 'System',
  },
  viewToggle: {
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
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
  },
  toggleButtonActive: {
    backgroundColor: '#F0FDF4',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginLeft: 6,
    fontFamily: 'System',
  },
  toggleTextActive: {
    color: '#065F46',
  },
  filtersSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginTop: 8,
    fontFamily: 'System',
  },
  filterScroll: {
    marginBottom: 8,
  },
  filterContainer: {
    paddingRight: 16,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  filterChipSelected: {
    backgroundColor: '#F0FDF4',
    borderColor: '#059669',
  },
  filterChipText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
    fontFamily: 'System',
  },
  filterChipTextSelected: {
    color: '#065F46',
    fontWeight: '600',
  },
  mapContainer: {
    flex: 1,
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  mapPlaceholderText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#065F46',
    marginTop: 12,
    fontFamily: 'System',
  },
  mapSubText: {
    fontSize: 14,
    color: '#059669',
    marginTop: 4,
    fontFamily: 'System',
  },
  mapPreview: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  mapPreviewCard: {
    marginBottom: 0,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0FDF4',
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryEmoji: {
    fontSize: 12,
    marginRight: 4,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#065F46',
    textTransform: 'capitalize',
    fontFamily: 'System',
  },
  participantsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantsText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
    marginLeft: 4,
    fontFamily: 'System',
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#065F46',
    marginBottom: 8,
    fontFamily: 'System',
  },
  activityDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
    fontFamily: 'System',
  },
  activityMeta: {
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 6,
    fontFamily: 'System',
  },
  joinButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  joinButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'System',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#34D399',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  fabInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#34D399',
  },
});

export default ExploreScreen;