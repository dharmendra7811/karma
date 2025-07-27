import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { DeedService } from '../lib/deedService';
import { ActivityService } from '../lib/activityService';
import { Activity } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

// Extended activity interface for display purposes
interface EnhancedActivity extends Activity {
  image_urls?: string[];
  location?: string;
  activity_date?: string;
  activity_time?: string;
}

const { width } = Dimensions.get('window');

const HomeScreen: React.FC = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<EnhancedActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'deeds' | 'events'>('all');
  const [userStats, setUserStats] = useState({
    karma_points: 0,
    total_deeds: 0,
  });

  useEffect(() => {
    loadActivityFeed();
    if (user) {
      loadUserStats();
    }
  }, [user]);

  const loadActivityFeed = async () => {
    try {
      const feedData = await DeedService.getActivityFeed(50); // Get more items

      // Enhance activities with full deed/activity data including images
      const enhancedActivities = await Promise.all(
        feedData.map(async activity => {
          try {
            if (activity.deed_id && activity.activity_type === 'deed_logged') {
              // Fetch the full deed data
              const deeds = await DeedService.getUserDeeds();
              const deed = deeds.find(d => d.id === activity.deed_id);
              if (deed) {
                const imageUrls = DeedService.getImageUrls(deed);
                console.log(`Deed ${deed.id} images:`, imageUrls);
                return {
                  ...activity,
                  image_urls: imageUrls,
                  location: deed.location,
                  category: deed.category,
                };
              }
            } else if (
              activity.activity_id &&
              activity.activity_type === 'activity_created'
            ) {
              // Fetch the full activity data
              const communityActivities = await ActivityService.getActivities();
              const communityActivity = communityActivities.find(
                a => a.id === activity.activity_id,
              );
              if (communityActivity) {
                const imageUrls =
                  ActivityService.getImageUrls(communityActivity);
                console.log(
                  `Activity ${communityActivity.id} images:`,
                  imageUrls,
                );
                return {
                  ...activity,
                  image_urls: imageUrls,
                  location: communityActivity.location,
                  activity_date: communityActivity.activity_date,
                  activity_time: communityActivity.activity_time,
                };
              }
            }
            return activity;
          } catch (error) {
            console.error('Error enhancing activity:', error);
            return activity;
          }
        }),
      );

      setActivities(enhancedActivities);
    } catch (error) {
      console.error('Failed to load activity feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserStats = async () => {
    if (!user) return;
    try {
      const stats = await DeedService.getUserKarmaStats(user.id);
      if (stats) {
        setUserStats(stats);
      }
    } catch (error) {
      console.error('Failed to load user stats:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadActivityFeed(), loadUserStats()]);
    setRefreshing(false);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60),
    );

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}w ago`;

    return date.toLocaleDateString();
  };

  const getCategoryIcon = (categoryIcon: string | undefined) => {
    const iconMap: { [key: string]: string } = {
      eco: 'eco',
      people: 'people',
      school: 'school',
      favorite: 'favorite',
      pets: 'pets',
      elderly: 'elderly-woman',
      'volunteer-activism': 'volunteer-activism',
      'auto-awesome': 'auto-awesome',
      nature: 'nature',
      health: 'health-and-safety',
      community: 'groups',
      help: 'helping-hand',
    };
    return iconMap[categoryIcon || ''] || 'star';
  };

  const getKarmaLevel = (points: number) => {
    if (points < 50) return { level: 'Seed', icon: 'eco', color: '#10B981' };
    if (points < 150)
      return { level: 'Sprout', icon: 'nature', color: '#059669' };
    if (points < 300)
      return { level: 'Bloom', icon: 'local-florist', color: '#047857' };
    if (points < 500) return { level: 'Tree', icon: 'park', color: '#065F46' };
    return { level: 'Forest', icon: 'forest', color: '#064E3B' };
  };

  const filteredActivities = activities.filter(activity => {
    if (activeTab === 'all') return true;
    if (activeTab === 'deeds') return activity.activity_type === 'deed_logged';
    if (activeTab === 'events')
      return activity.activity_type === 'activity_created';
    return true;
  });

  const handleInspireAction = (activity: EnhancedActivity) => {
    Alert.alert(
      'Inspired! ✨',
      `You're inspired by ${
        activity.full_name || activity.username || 'this person'
      }'s good deed!`,
      [{ text: 'Keep Spreading Kindness!' }],
    );
  };

  const handleShareAction = (activity: EnhancedActivity) => {
    Alert.alert(
      'Share Kindness 📢',
      'Sharing feature coming soon! Help us spread good vibes.',
      [{ text: 'Got it!' }],
    );
  };

  const renderImageGallery = (imageUrls: string[], maxImages: number = 3) => {
    if (!imageUrls || imageUrls.length === 0) return null;

    const displayImages = imageUrls.slice(0, maxImages);
    const remainingCount = imageUrls.length - maxImages;

    return (
      <View style={styles.imageGallery}>
        {displayImages.map((imageUrl, index) => (
          <View key={index} style={styles.imageContainer}>
            <Image
              source={{ uri: imageUrl }}
              style={[
                styles.activityImage,
                displayImages.length === 1
                  ? styles.singleImage
                  : displayImages.length === 2
                  ? styles.doubleImage
                  : styles.tripleImage,
              ]}
              resizeMode="cover"
              onError={error => {
                console.log('Image load error:', error.nativeEvent.error);
              }}
              onLoad={() => {
                console.log('Image loaded successfully:', imageUrl);
              }}
            />
            {index === maxImages - 1 && remainingCount > 0 && (
              <View style={styles.imageOverlay}>
                <Text style={styles.imageOverlayText}>+{remainingCount}</Text>
              </View>
            )}
          </View>
        ))}
      </View>
    );
  };

  const handleQuickLogDeed = () => {
    Alert.alert(
      'Quick Deed Log 🌟',
      'This will take you to the Action tab to log a new good deed!',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: "Let's Go!",
          onPress: () => {
            // Navigate to Action tab - you'll need to implement navigation
            console.log('Navigate to Action tab');
          },
        },
      ],
    );
  };

  const karmaLevel = getKarmaLevel(userStats.karma_points);

  console.log('Rendering HomeScreen with activities:', activities);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>Loading your karma feed...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Compact Modern Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          {/* Left: User Greeting & Level */}
          <View style={styles.userSection}>
            <Text style={styles.welcomeText}>
              Hey {user?.email?.split('@')[0] || 'Friend'}! 👋
            </Text>
            <View style={styles.levelBadge}>
              <Icon name={karmaLevel.icon} size={12} color={karmaLevel.color} />
              <Text style={[styles.levelText, { color: karmaLevel.color }]}>
                {karmaLevel.level}
              </Text>
            </View>
          </View>

          {/* Right: Quick Stats */}
          <View style={styles.quickStats}>
            <View style={styles.quickStat}>
              <Text style={styles.quickStatNumber}>
                {userStats.karma_points}
              </Text>
              <Text style={styles.quickStatLabel}>Karma</Text>
            </View>
            <View style={styles.quickStat}>
              <Text style={styles.quickStatNumber}>
                {userStats.total_deeds}
              </Text>
              <Text style={styles.quickStatLabel}>Deeds</Text>
            </View>
          </View>
        </View>

        {/* Mini Progress Bar for Next Level */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(
                    ((userStats.karma_points % 150) / 150) * 100,
                    100,
                  )}%`,
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {150 - (userStats.karma_points % 150)} to next level
          </Text>
        </View>
      </View>

      {/* Floating Action Hint */}
      <View style={styles.actionHint}>
        <Icon name="add-circle" size={16} color="#10B981" />
        <Text style={styles.actionHintText}>
          Ready to spread some kindness?
        </Text>
        <TouchableOpacity
          style={styles.actionHintButton}
          onPress={handleQuickLogDeed}
        >
          <Text style={styles.actionHintButtonText}>Log Deed</Text>
        </TouchableOpacity>
      </View>

      {/* Simple Filter Pills */}
      <View style={styles.filterContainer}>
        <Text style={styles.feedLabel}>Recent Activity</Text>
        <View style={styles.filterPills}>
          <TouchableOpacity
            style={[
              styles.filterPill,
              activeTab === 'all' && styles.activeFilterPill,
            ]}
            onPress={() => setActiveTab('all')}
          >
            <Text
              style={[
                styles.filterPillText,
                activeTab === 'all' && styles.activeFilterPillText,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterPill,
              activeTab === 'deeds' && styles.activeFilterPill,
            ]}
            onPress={() => setActiveTab('deeds')}
          >
            <Text
              style={[
                styles.filterPillText,
                activeTab === 'deeds' && styles.activeFilterPillText,
              ]}
            >
              Deeds
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterPill,
              activeTab === 'events' && styles.activeFilterPill,
            ]}
            onPress={() => setActiveTab('events')}
          >
            <Text
              style={[
                styles.filterPillText,
                activeTab === 'events' && styles.activeFilterPillText,
              ]}
            >
              Events
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Activity Feed */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#10B981']}
            tintColor="#10B981"
          />
        }
      >
        {filteredActivities.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon
              name={
                activeTab === 'deeds'
                  ? 'volunteer-activism'
                  : activeTab === 'events'
                  ? 'event'
                  : 'sentiment-satisfied'
              }
              size={64}
              color="#D1D5DB"
            />
            <Text style={styles.emptyTitle}>
              {activeTab === 'deeds'
                ? 'No good deeds yet!'
                : activeTab === 'events'
                ? 'No events yet!'
                : 'No activities yet!'}
            </Text>
            <Text style={styles.emptyText}>
              {activeTab === 'deeds'
                ? 'Be the first to log a good deed and inspire others!'
                : activeTab === 'events'
                ? 'Create a community event and bring people together!'
                : 'Start your karma journey by logging a good deed!'}
            </Text>
          </View>
        ) : (
          filteredActivities.map((activity: EnhancedActivity) => (
            <View key={activity.id} style={styles.activityCard}>
              {/* User Info */}
              <View style={styles.userInfo}>
                <View style={styles.avatarContainer}>
                  {activity.user_profiles?.avatar_url ? (
                    <Image
                      source={{ uri: activity.user_profiles.avatar_url }}
                      style={styles.avatar}
                    />
                  ) : (
                    <Icon name="person" size={24} color="#059669" />
                  )}
                </View>
                <View style={styles.userDetails}>
                  <Text style={styles.userName}>
                    {activity.user_profiles?.full_name ||
                      activity.user_profiles?.username ||
                      activity.full_name ||
                      activity.username ||
                      'Anonymous User'}
                  </Text>
                  <View style={styles.activityMeta}>
                    <Icon
                      name={
                        activity.activity_type === 'deed_logged'
                          ? 'volunteer-activism'
                          : 'event'
                      }
                      size={12}
                      color="#6B7280"
                    />
                    <Text style={styles.timeAgo}>
                      {formatTimeAgo(activity.created_at)}
                    </Text>
                  </View>
                </View>
                <View style={styles.karmaTag}>
                  <Icon name="auto-awesome" size={12} color="#F59E0B" />
                  <Text style={styles.karmaText}>+{activity.karma_earned}</Text>
                </View>
              </View>

              {/* Activity Details */}
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>{activity.title}</Text>
                {activity.description && activity.description.trim() && (
                  <Text style={styles.activityDescription}>
                    {activity.description}
                  </Text>
                )}

                {/* Image Gallery */}
                {activity.image_urls && renderImageGallery(activity.image_urls)}

                {/* Location Info */}
                {activity.location && (
                  <View style={styles.locationContainer}>
                    <Icon name="place" size={14} color="#6B7280" />
                    <Text style={styles.locationText}>{activity.location}</Text>
                  </View>
                )}

                {/* Event Date/Time for Activities */}
                {activity.activity_type === 'activity_created' &&
                  activity.activity_date && (
                    <View style={styles.eventTimeContainer}>
                      <Icon name="schedule" size={14} color="#6B7280" />
                      <Text style={styles.eventTimeText}>
                        {new Date(activity.activity_date).toLocaleDateString()}{' '}
                        at {activity.activity_time || 'TBD'}
                      </Text>
                    </View>
                  )}

                {activity.category_name && (
                  <View style={styles.categoryContainer}>
                    <Icon
                      name={getCategoryIcon(activity.category_icon)}
                      size={14}
                      color={activity.category_color || '#10B981'}
                    />
                    <Text
                      style={[
                        styles.categoryName,
                        { color: activity.category_color || '#10B981' },
                      ]}
                    >
                      {activity.category_name}
                    </Text>
                  </View>
                )}
              </View>

              {/* Enhanced Action Buttons */}
              <View style={styles.actionBar}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleInspireAction(activity)}
                >
                  <Icon name="favorite-border" size={16} color="#059669" />
                  <Text style={styles.actionText}>Inspire</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleShareAction(activity)}
                >
                  <Icon name="share" size={16} color="#059669" />
                  <Text style={styles.actionText}>Share</Text>
                </TouchableOpacity>

                {activity.activity_type === 'activity_created' && (
                  <TouchableOpacity style={styles.actionButton}>
                    <Icon name="group-add" size={16} color="#059669" />
                    <Text style={styles.actionText}>Join</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        )}

        {/* Compact Community Footer */}
        <View style={styles.compactFooter}>
          <View style={styles.communityStats}>
            <Icon name="groups" size={20} color="#059669" />
            <Text style={styles.communityText}>
              {new Set(activities.map(a => a.user_id)).size}+ kind souls
              spreading good vibes 💚
            </Text>
          </View>
        </View>
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
    fontWeight: '500',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userSection: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 4,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  levelText: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  quickStats: {
    flexDirection: 'row',
    gap: 16,
  },
  quickStat: {
    alignItems: 'center',
  },
  quickStatNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10B981',
  },
  quickStatLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '500',
  },
  actionHint: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  actionHintText: {
    flex: 1,
    fontSize: 14,
    color: '#059669',
    fontWeight: '500',
    marginLeft: 8,
  },
  actionHintButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  actionHintButtonText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  feedLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
  },
  filterPills: {
    flexDirection: 'row',
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  activeFilterPill: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeFilterPillText: {
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
    paddingTop: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#374151',
    marginTop: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 2,
    borderColor: '#D1FAE5',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  userDetails: {
    marginLeft: 14,
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 4,
  },
  activityMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeAgo: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 6,
    fontWeight: '500',
  },
  karmaTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  karmaText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#92400E',
    marginLeft: 4,
  },
  activityContent: {
    marginBottom: 16,
  },
  activityTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
    lineHeight: 24,
  },
  activityDescription: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 22,
    marginBottom: 12,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryName: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  imageGallery: {
    flexDirection: 'row',
    marginVertical: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    marginRight: 4,
  },
  activityImage: {
    borderRadius: 8,
  },
  singleImage: {
    width: width - 72, // Full width minus padding
    height: 200,
  },
  doubleImage: {
    width: (width - 80) / 2, // Half width minus padding and gap
    height: 120,
  },
  tripleImage: {
    width: (width - 88) / 3, // Third width minus padding and gaps
    height: 80,
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  imageOverlayText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  locationText: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 6,
    fontWeight: '500',
  },
  eventTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  eventTimeText: {
    fontSize: 13,
    color: '#92400E',
    marginLeft: 6,
    fontWeight: '600',
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#059669',
    marginLeft: 6,
  },
  compactFooter: {
    paddingVertical: 20,
  },
  communityStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0FDF4',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  communityText: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '500',
    marginLeft: 8,
    textAlign: 'center',
  },
});

export default HomeScreen;
