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
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { DeedService } from '../lib/deedService';
import { Activity } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const HomeScreen: React.FC = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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
      const feedData = await DeedService.getActivityFeed();
      setActivities(feedData);
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
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60),
    );

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

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
    };
    return iconMap[categoryIcon || ''] || 'star';
  };

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
      {/* Header with User Stats */}
      <View style={styles.header}>
        <Text style={styles.welcomeText}>
          Welcome back, {user?.email?.split('@')[0] || 'Friend'}! 👋
        </Text>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{userStats.karma_points}</Text>
            <Text style={styles.statLabel}>Karma Points</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{userStats.total_deeds}</Text>
            <Text style={styles.statLabel}>Good Deeds</Text>
          </View>
        </View>
      </View>

      {/* Activity Feed */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={styles.feedTitle}>Recent Good Deeds 🌟</Text>

        {activities.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="sentiment-satisfied" size={48} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>No activities yet!</Text>
            <Text style={styles.emptyText}>
              Be the first to log a good deed and inspire others!
            </Text>
          </View>
        ) : (
          activities.map(activity => (
            <View key={activity.id} style={styles.activityCard}>
              {/* User Info */}
              <View style={styles.userInfo}>
                <View style={styles.avatarContainer}>
                  <Icon
                    name={getCategoryIcon(activity.category_icon)}
                    size={20}
                    color={activity.category_color || '#10B981'}
                  />
                </View>
                <View style={styles.userDetails}>
                  <Text style={styles.userName}>
                    {activity.full_name || activity.username || 'Anonymous'}
                  </Text>
                  <Text style={styles.timeAgo}>
                    {formatTimeAgo(activity.created_at)}
                  </Text>
                </View>
                <View style={styles.karmaTag}>
                  <Text style={styles.karmaText}>+{activity.karma_earned}</Text>
                </View>
              </View>

              {/* Activity Details */}
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>{activity.title}</Text>
                {activity.description && (
                  <Text style={styles.activityDescription}>
                    {activity.description}
                  </Text>
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

              {/* Action Buttons */}
              <View style={styles.actionBar}>
                <TouchableOpacity style={styles.actionButton}>
                  <Icon name="favorite-border" size={16} color="#059669" />
                  <Text style={styles.actionText}>Inspire</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Icon name="share" size={16} color="#059669" />
                  <Text style={styles.actionText}>Share</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        {/* Motivational Footer */}
        <View style={styles.footerMotivation}>
          <Text style={styles.motivationText}>
            "No act of kindness, no matter how small, is ever wasted." ✨
          </Text>
          <Text style={styles.motivationAuthor}>- Aesop</Text>
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
  },
  header: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#065F46',
    textAlign: 'center',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10B981',
  },
  statLabel: {
    fontSize: 12,
    color: '#059669',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#D1FAE5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  feedTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 20,
    marginBottom: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
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
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0FDF4',
  },
  userDetails: {
    marginLeft: 12,
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  timeAgo: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  karmaTag: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  karmaText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#92400E',
  },
  activityContent: {
    marginBottom: 12,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  activityDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 8,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#059669',
    marginLeft: 4,
  },
  footerMotivation: {
    backgroundColor: '#F0FDF4',
    padding: 20,
    borderRadius: 16,
    marginTop: 20,
    alignItems: 'center',
  },
  motivationText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#065F46',
    textAlign: 'center',
    lineHeight: 24,
  },
  motivationAuthor: {
    fontSize: 14,
    color: '#059669',
    marginTop: 8,
    fontWeight: '500',
  },
});

export default HomeScreen;
