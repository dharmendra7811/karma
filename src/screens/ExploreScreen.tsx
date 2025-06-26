import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { ActivityService, CommunityActivity } from '../lib/activityService';
import { DeedService } from '../lib/deedService';
import { DeedCategory } from '../lib/supabase';

interface FilterOption {
  id: string;
  label: string;
  icon: string;
}

const ExploreScreen: React.FC = () => {
  const [viewMode, setViewMode] = useState<'list'>('list'); // Removed map for now
  const [activities, setActivities] = useState<CommunityActivity[]>([]);
  const [categories, setCategories] = useState<DeedCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<{
    category: string;
    status: string;
  }>({
    category: 'all',
    status: 'upcoming',
  });

  useEffect(() => {
    loadData();
  }, [selectedFilters]);

  const loadData = async () => {
    try {
      const [activitiesData, categoriesData] = await Promise.all([
        ActivityService.getActivities({
          status: selectedFilters.status === 'all' ? undefined : selectedFilters.status,
          category_id: selectedFilters.category === 'all' ? undefined : selectedFilters.category,
          upcoming_only: selectedFilters.status === 'upcoming',
        }),
        DeedService.getCategories(),
      ]);

      setActivities(activitiesData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Failed to load explore data:', error);
      Alert.alert('Error', 'Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const categoryFilters: FilterOption[] = [
    { id: 'all', label: 'All', icon: 'apps' },
    ...categories.map(cat => ({
      id: cat.id,
      label: cat.name,
      icon: cat.icon || 'category'
    }))
  ];

  const statusFilters: FilterOption[] = [
    { id: 'upcoming', label: 'Upcoming', icon: 'schedule' },
    { id: 'all', label: 'All Status', icon: 'list' },
    { id: 'ongoing', label: 'Ongoing', icon: 'play-circle' },
    { id: 'completed', label: 'Completed', icon: 'check-circle' },
  ];

  const getCategoryInfo = (categoryId?: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return {
      name: category?.name || 'General',
      icon: category?.icon || 'category',
      color: category?.color || '#10B981'
    };
  };

  const formatDateTime = (date: string, time: string) => {
    const activityDate = new Date(date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let dateStr = '';
    if (activityDate.toDateString() === today.toDateString()) {
      dateStr = 'Today';
    } else if (activityDate.toDateString() === tomorrow.toDateString()) {
      dateStr = 'Tomorrow';
    } else {
      dateStr = activityDate.toLocaleDateString();
    }

    return `${dateStr} • ${time}`;
  };

  const handleJoinActivity = async (activity: CommunityActivity) => {
    if (activity.max_participants && activity.current_participants >= activity.max_participants) {
      Alert.alert('Activity Full', 'This activity has reached its maximum number of participants.');
      return;
    }

    Alert.alert(
      `Join "${activity.title}"? 🌟`,
      `Are you ready to make a positive impact?`,
      [
        { text: 'Not Yet', style: 'cancel' },
        { 
          text: 'Count Me In!', 
          onPress: async () => {
            try {
              await ActivityService.joinActivity(activity.id);
              Alert.alert(
                'Awesome! 🎉',
                `You've successfully joined "${activity.title}". Check back for updates from the organizer.`,
                [{ text: 'Great!', style: 'default' }]
              );
              // Refresh the list to show updated participant count
              loadData();
            } catch (error) {
              console.error('Failed to join activity:', error);
              Alert.alert('Error', 'Failed to join activity. Please try again.');
            }
          }
        }
      ]
    );
  };

  const renderActivityCard = (activity: CommunityActivity) => {
    const categoryInfo = getCategoryInfo(activity.category_id);
    const isPastEvent = new Date(activity.activity_date) < new Date();

    return (
      <View style={[styles.activityCard, isPastEvent && styles.pastActivityCard]}>
        <View style={styles.activityHeader}>
          <View style={[styles.categoryBadge, { backgroundColor: categoryInfo.color + '20' }]}>
            <Icon name={categoryInfo.icon} size={14} color={categoryInfo.color} />
            <Text style={[styles.categoryText, { color: categoryInfo.color }]}>
              {categoryInfo.name}
            </Text>
          </View>
          <View style={styles.participantsInfo}>
            <Icon name="people" size={16} color="#059669" />
            <Text style={styles.participantsText}>
              {activity.current_participants}
              {activity.max_participants ? `/${activity.max_participants}` : ''}
            </Text>
          </View>
        </View>
        
        <Text style={styles.activityTitle}>{activity.title}</Text>
        
        <Text style={styles.activityDescription} numberOfLines={2}>
          {activity.description}
        </Text>
        
        <View style={styles.activityMeta}>
          <View style={styles.metaItem}>
            <Icon name="schedule" size={16} color="#6B7280" />
            <Text style={styles.metaText}>
              {formatDateTime(activity.activity_date, activity.activity_time)}
            </Text>
          </View>
          {activity.location && (
            <View style={styles.metaItem}>
              <Icon name="place" size={16} color="#6B7280" />
              <Text style={styles.metaText}>{activity.location}</Text>
            </View>
          )}
          {activity.creator && (
            <View style={styles.metaItem}>
              <Icon name="person" size={16} color="#6B7280" />
              <Text style={styles.metaText}>
                by {activity.creator.full_name || activity.creator.username || 'Anonymous'}
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(activity.status) }]}>
            <Text style={styles.statusText}>{activity.status.toUpperCase()}</Text>
          </View>
        </View>
        
        {activity.status === 'upcoming' && !isPastEvent && (
          <TouchableOpacity 
            style={[
              styles.joinButton,
              (activity.max_participants && activity.current_participants >= activity.max_participants) && 
              styles.joinButtonDisabled
            ]}
            onPress={() => handleJoinActivity(activity)}
            disabled={activity.max_participants && activity.current_participants >= activity.max_participants}
          >
            <Text style={styles.joinButtonText}>
              {(activity.max_participants && activity.current_participants >= activity.max_participants) 
                ? 'Activity Full' : 'Join Activity'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return '#FEF3C7';
      case 'ongoing': return '#DBEAFE';
      case 'completed': return '#D1FAE5';
      case 'cancelled': return '#FEE2E2';
      default: return '#F3F4F6';
    }
  };

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

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>Loading community activities...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore Community Activities 🌍</Text>
        <Text style={styles.headerSubtitle}>Find ways to make a difference together</Text>
      </View>

      {/* Filters */}
      <View style={styles.filtersSection}>
        <Text style={styles.filterLabel}>Category:</Text>
        {renderFilterChips(
          categoryFilters, 
          selectedFilters.category, 
          (value) => setSelectedFilters({...selectedFilters, category: value})
        )}
        
        <Text style={styles.filterLabel}>Status:</Text>
        {renderFilterChips(
          statusFilters, 
          selectedFilters.status, 
          (value) => setSelectedFilters({...selectedFilters, status: value})
        )}
      </View>

      {/* Activities List */}
      <ScrollView 
        style={styles.listContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {activities.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="event-available" size={48} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>No activities found</Text>
            <Text style={styles.emptyText}>
              {selectedFilters.category !== 'all' || selectedFilters.status !== 'upcoming'
                ? 'Try adjusting your filters to see more activities.'
                : 'Be the first to create a community activity!'}
            </Text>
          </View>
        ) : (
          activities.map((activity) => (
            <View key={activity.id}>
              {renderActivityCard(activity)}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#F0FDF4',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#065F46',
    textAlign: 'center',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#059669',
    textAlign: 'center',
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
  },
  filterChipTextSelected: {
    color: '#065F46',
    fontWeight: '600',
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
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
  },
  pastActivityCard: {
    opacity: 0.7,
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
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
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
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
  },
  activityDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  activityMeta: {
    marginBottom: 12,
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
  },
  statusContainer: {
    marginBottom: 12,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#374151',
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
  joinButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  joinButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default ExploreScreen;