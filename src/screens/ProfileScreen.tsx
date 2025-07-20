import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import EnhancedAvatarPicker from '../components/EnhancedAvatarPicker';
import { ImageUploadService } from '../services/ImageUploadService';
import { SupabaseDebugService } from '../services/SupabaseDebugService';
import { useAuth } from '../contexts/AuthContext';
import { useProfile } from '../contexts/ProfileContext';
import { useImpact } from '../contexts/ImpactContext';
import { ProfileService } from '../lib/profileService';

const { width } = Dimensions.get('window');

interface QuickStat {
  id: string;
  title: string;
  value: string;
  icon: string;
  color: string;
}

const ProfileScreen: React.FC = () => {
  const { user, signOut } = useAuth();
  const {
    profile,
    stats,
    recentActivity,
    loading,
    errors,
    refreshAll,
    updateProfile,
    updatePrivacySettings,
  } = useProfile();
  const { currentLevel, nextLevel, progressPercentage, pointsToNext } =
    useImpact();

  const [refreshing, setRefreshing] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  console.log(isUploadingAvatar, 'isUploadingAvatar state');

  // Local state for settings
  const [isProfilePrivate, setIsProfilePrivate] = useState(
    profile?.is_profile_private || false,
  );
  const [notifications, setNotifications] = useState(
    profile?.notifications_enabled !== false,
  );
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(
    profile?.theme_preference || 'system',
  );

  // Update local state when profile loads
  React.useEffect(() => {
    if (profile) {
      setIsProfilePrivate(profile.is_profile_private || false);
      setNotifications(profile.notifications_enabled !== false);
      setTheme(profile.theme_preference || 'system');
    }
  }, [profile]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshAll();
    } catch (error) {
      console.error('Error refreshing profile data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Dynamic user data
  const userData = {
    name: profile?.full_name || user?.full_name || 'Karma User',
    email: user?.email || 'user@example.com',
    avatar: profile?.avatar_emoji || '🌸',
    avatarUrl: profile?.avatar_url,
    status: profile?.status || 'Doing good, one deed at a time 🌱',
    karmaScore: stats.karmaPoints,
    location: profile?.location || 'Vadodara, Gujarat',
    bio:
      profile?.bio ||
      'Environmental advocate and community volunteer. Love organizing cleanup drives!',
    memberSince: profile?.created_at
      ? new Date(profile.created_at).toLocaleDateString('en-US', {
          month: 'long',
          year: 'numeric',
        })
      : 'Recently',
  };

  // Dynamic quick stats
  const quickStats: QuickStat[] = [
    {
      id: 'deeds',
      title: 'Deeds Logged',
      value: '47',
      icon: 'volunteer-activism',
      color: '#10B981',
    },
    {
      id: 'events',
      title: 'Events Joined',
      value: '12',
      icon: 'groups',
      color: '#F59E0B',
    },
    {
      id: 'badges',
      title: 'Badges Earned',
      value: '8',
      icon: 'military-tech',
      color: '#8B5CF6',
    },
    {
      id: 'streak',
      title: 'Streak Days',
      value: stats.streakDays.toString(),
      icon: 'local-fire-department',
      color: '#EF4444',
    },
  ];

  const handleAvatarUploadSuccess = async (result: string) => {
    try {
      if (result.startsWith('emoji:')) {
        // Handle emoji selection - delete old avatar if exists
        if (userData.avatarUrl) {
          await ImageUploadService.deleteImage(userData.avatarUrl, 'avatars');
        }
        await updateProfile({
          avatar_url: '',
        });
        Alert.alert('Success! ✨', 'Avatar updated successfully!');
      } else if (result === '') {
        // Handle photo removal - delete from storage
        if (userData.avatarUrl) {
          const deleteResult = await ImageUploadService.deleteImage(
            userData.avatarUrl,
            'avatars',
          );
          if (!deleteResult.success) {
            console.warn('Failed to delete old avatar:', deleteResult.error);
          }
        }
        await updateProfile({
          avatar_url: '',
        });
        Alert.alert('Success! 🗑️', 'Profile photo removed successfully!');
      } else {
        // Handle photo upload - delete old avatar if exists
        if (userData.avatarUrl) {
          await ImageUploadService.deleteImage(userData.avatarUrl, 'avatars');
        }
        await updateProfile({
          avatar_url: result,
        });
        Alert.alert('Success! 🎉', 'Profile photo uploaded successfully!');
      }

      // Refresh profile to show updated avatar
      await refreshAll();
    } catch (error) {
      console.error('Profile update error:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };

  const handleAvatarUploadStart = () => {
    setIsUploadingAvatar(true);
  };

  const handleAvatarUploadEnd = () => {
    setIsUploadingAvatar(false);
  };

  const handleEditProfile = () => {
    Alert.alert('Edit Profile ✏️', 'What would you like to update?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Edit Name',
        onPress: () => {
          Alert.alert(
            'Edit Name',
            'Name editing coming soon! For now, you can update your name through settings.',
            [{ text: 'OK' }],
          );
        },
      },
      {
        text: 'Edit Bio',
        onPress: () => {
          Alert.alert(
            'Edit Bio',
            'Bio editing coming soon! For now, you can update your bio through settings.',
            [{ text: 'OK' }],
          );
        },
      },
    ]);
  };

  // Handle privacy settings changes
  const handlePrivacyToggle = async (newValue: boolean) => {
    try {
      setIsProfilePrivate(newValue);
      await updatePrivacySettings({ is_profile_private: newValue });
    } catch (error) {
      setIsProfilePrivate(!newValue); // Revert on error
      Alert.alert('Error', 'Failed to update privacy setting');
    }
  };

  const handleNotificationsToggle = async (newValue: boolean) => {
    try {
      setNotifications(newValue);
      await updatePrivacySettings({ notifications_enabled: newValue });
    } catch (error) {
      setNotifications(!newValue); // Revert on error
      Alert.alert('Error', 'Failed to update notification setting');
    }
  };

  const handleViewFullKarma = () => {
    Alert.alert(
      'Karma Impact 🌟',
      'Navigate to your full Karma Impact screen to see detailed progress and achievements!',
      [
        { text: 'Stay Here', style: 'cancel' },
        {
          text: 'View Impact',
          onPress: () => console.log('Navigate to Impact screen'),
        },
      ],
    );
  };

  const handleNotificationSettings = () => {
    Alert.alert(
      'Notification Preferences 🔔',
      'Customize what notifications you receive',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Manage',
          onPress: () => console.log('Navigate to notification settings'),
        },
      ],
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout 👋',
      'Are you sure you want to logout? Your karma progress will be saved.',
      [
        { text: 'Stay Logged In', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ],
    );
  };

  // const handleDeleteAccount = () => {
  //   Alert.alert(
  //     'Delete Account ⚠️',
  //     'This action cannot be undone. All your karma points and deeds will be permanently lost.',
  //     [
  //       { text: 'Keep Account', style: 'cancel' },
  //       {
  //         text: 'Delete Forever',
  //         style: 'destructive',
  //         onPress: () => {
  //           Alert.alert(
  //             'Final Confirmation',
  //             'Type "DELETE" to confirm account deletion',
  //             [
  //               { text: 'Cancel', style: 'cancel' },
  //               {
  //                 text: 'Proceed',
  //                 style: 'destructive',
  //                 onPress: () => console.log('Delete account'),
  //               },
  //             ],
  //           );
  //         },
  //       },
  //     ],
  //   );
  // };

  const renderProfileHeader = () => (
    <View style={styles.profileHeader}>
      <View style={styles.avatarContainer}>
        <EnhancedAvatarPicker
          currentAvatarUrl={userData.avatarUrl}
          currentAvatarEmoji={userData.avatar}
          onUploadSuccess={handleAvatarUploadSuccess}
          onUploadStart={handleAvatarUploadStart}
          onUploadEnd={handleAvatarUploadEnd}
          userId={user?.id}
          key={user?.id}
          size={80}
        />
      </View>

      <View style={styles.profileInfo}>
        <Text style={styles.userName}>{userData.name}</Text>
        <Text style={styles.userStatus}>{userData.status}</Text>
        <View style={styles.karmaLevelBadge}>
          <Text style={styles.karmaLevelEmoji}>{currentLevel.emoji}</Text>
          <Text style={styles.karmaLevelText}>{currentLevel.name}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.editProfileButton}
        onPress={handleEditProfile}
      >
        <Icon name="edit" size={16} color="#059669" />
      </TouchableOpacity>
    </View>
  );

  const renderKarmaSnapshot = () => (
    <View style={styles.karmaSnapshotContainer}>
      <Text style={styles.sectionTitle}>Your Karma Journey 🌱</Text>
      {loading.stats ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#065F46" />
          <Text style={styles.loadingText}>Loading karma data...</Text>
        </View>
      ) : (
        <View style={styles.karmaSnapshotCard}>
          <View style={styles.karmaScoreSection}>
            <Text style={styles.karmaScoreNumber}>{userData.karmaScore}</Text>
            <Text style={styles.karmaScoreLabel}>Karma Points</Text>
          </View>

          <View style={styles.karmaLevelSection}>
            <Text style={styles.karmaCurrentLevel}>
              Level: {currentLevel.name} {currentLevel.emoji}
            </Text>
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarTrack}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${progressPercentage}%` },
                  ]}
                />
              </View>
              {nextLevel && (
                <Text style={styles.progressText}>
                  {pointsToNext} points to {nextLevel.name} {nextLevel.emoji}
                </Text>
              )}
            </View>
          </View>

          <TouchableOpacity
            style={styles.viewFullKarmaButton}
            onPress={handleViewFullKarma}
          >
            <Text style={styles.viewFullKarmaText}>View Full Karma Impact</Text>
            <Icon name="arrow-forward" size={16} color="#059669" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderQuickStats = () => (
    <View style={styles.quickStatsContainer}>
      <Text style={styles.sectionTitle}>Quick Stats 📊</Text>
      <View style={styles.statsGrid}>
        {quickStats.map(stat => (
          <View key={stat.id} style={styles.statCard}>
            <View
              style={[styles.statIcon, { backgroundColor: `${stat.color}20` }]}
            >
              <Icon name={stat.icon} size={20} color={stat.color} />
            </View>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statTitle}>{stat.title}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderSettings = () => (
    <View style={styles.settingsContainer}>
      <Text style={styles.sectionTitle}>Settings & Preferences ⚙️</Text>

      {/* Privacy Settings */}
      <View style={styles.settingItem}>
        <View style={styles.settingLeft}>
          <Icon name="visibility-off" size={20} color="#6B7280" />
          <Text style={styles.settingLabel}>Private Profile</Text>
        </View>
        <Switch
          value={isProfilePrivate}
          onValueChange={handlePrivacyToggle}
          trackColor={{ false: '#E5E7EB', true: '#86EFAC' }}
          thumbColor={isProfilePrivate ? '#059669' : '#F3F4F6'}
          disabled={loading.updating}
        />
      </View>

      {/* Profile Management */}
      <TouchableOpacity style={styles.settingItem} onPress={handleEditProfile}>
        <View style={styles.settingLeft}>
          <Icon name="person" size={20} color="#6B7280" />
          <Text style={styles.settingLabel}>Edit Bio & Location</Text>
        </View>
        <Icon name="keyboard-arrow-right" size={20} color="#9CA3AF" />
      </TouchableOpacity>

      {/* Notifications */}
      <View style={styles.settingItem}>
        <View style={styles.settingLeft}>
          <Icon name="notifications" size={20} color="#6B7280" />
          <Text style={styles.settingLabel}>Notifications</Text>
        </View>
        <Switch
          value={notifications}
          onValueChange={handleNotificationsToggle}
          trackColor={{ false: '#E5E7EB', true: '#86EFAC' }}
          thumbColor={notifications ? '#059669' : '#F3F4F6'}
          disabled={loading.updating}
        />
      </View>

      <TouchableOpacity
        style={styles.settingItem}
        onPress={handleNotificationSettings}
      >
        <View style={styles.settingLeft}>
          <Icon name="tune" size={20} color="#6B7280" />
          <Text style={styles.settingLabel}>Notification Preferences</Text>
        </View>
        <Icon name="keyboard-arrow-right" size={20} color="#9CA3AF" />
      </TouchableOpacity>

      {/* Theme Settings */}
      <View style={styles.settingItem}>
        <View style={styles.settingLeft}>
          <Icon name="palette" size={20} color="#6B7280" />
          <Text style={styles.settingLabel}>App Theme</Text>
        </View>
        <Text style={styles.settingValue}>
          {theme === 'system' ? 'System' : theme === 'light' ? 'Light' : 'Dark'}
        </Text>
      </View>
    </View>
  );

  const renderRecentActivity = () => (
    <View style={styles.recentActivityContainer}>
      <Text style={styles.sectionTitle}>Recent Activity 📈</Text>
      {loading.activity ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#065F46" />
          <Text style={styles.loadingText}>Loading activity...</Text>
        </View>
      ) : errors.activity ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load recent activity</Text>
          <TouchableOpacity onPress={handleRefresh} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : recentActivity.length === 0 ? (
        <View style={styles.emptyActivityContainer}>
          <Text style={styles.emptyActivityEmoji}>🌱</Text>
          <Text style={styles.emptyActivityText}>No recent activity</Text>
          <Text style={styles.emptyActivitySubtext}>
            Start logging deeds to see your activity!
          </Text>
        </View>
      ) : (
        <View style={styles.activityList}>
          {recentActivity.slice(0, 3).map(activity => (
            <View key={activity.id} style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Text style={styles.activityEmoji}>{activity.icon}</Text>
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>{activity.title}</Text>
                <Text style={styles.activityDescription} numberOfLines={2}>
                  {activity.description}
                </Text>
                <View style={styles.activityMeta}>
                  <Text style={styles.activityDate}>
                    {new Date(activity.date).toLocaleDateString()}
                  </Text>
                  {activity.karma_earned && (
                    <View style={styles.activityKarma}>
                      <Icon name="star" size={12} color="#F59E0B" />
                      <Text style={styles.activityKarmaText}>
                        +{activity.karma_earned}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          ))}
          {recentActivity.length > 3 && (
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={handleViewFullKarma}
            >
              <Text style={styles.viewAllText}>View All Activity</Text>
              <Icon name="arrow-forward" size={16} color="#059669" />
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );

  const renderAccountInfo = () => (
    <View style={styles.accountContainer}>
      <Text style={styles.sectionTitle}>Account Information 📄</Text>

      <View style={styles.accountInfoCard}>
        <View style={styles.accountInfoItem}>
          <Text style={styles.accountInfoLabel}>Email</Text>
          <Text style={styles.accountInfoValue}>{userData.email}</Text>
        </View>

        <View style={styles.accountInfoItem}>
          <Text style={styles.accountInfoLabel}>Member Since</Text>
          <Text style={styles.accountInfoValue}>{userData.memberSince}</Text>
        </View>

        <View style={styles.accountInfoItem}>
          <Text style={styles.accountInfoLabel}>Location</Text>
          <TouchableOpacity onPress={handleEditLocation}>
            <Text style={[styles.accountInfoValue, styles.editableValue]}>
              {userData.location}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Action Buttons */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Icon name="logout" size={20} color="#FFFFFF" />
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>

      {/* Debug Button - Remove in production */}
      <TouchableOpacity
        style={[styles.logoutButton, { backgroundColor: '#F59E0B' }]}
        onPress={async () => {
          Alert.alert('Debug Tests', 'Running Supabase debug tests...');
          await SupabaseDebugService.runAllTests();
          Alert.alert('Debug Complete', 'Check console for results');
        }}
      >
        <Icon name="bug-report" size={20} color="#FFFFFF" />
        <Text style={styles.logoutButtonText}>Debug Supabase</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={handleDeleteAccount}
      >
        <Text style={styles.deleteButtonText}>Delete Account</Text>
      </TouchableOpacity>
    </View>
  );

  // Add missing handlers
  const handleEditLocation = () => {
    Alert.alert('Edit Location', 'Choose your location:', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Vadodara, Gujarat',
        onPress: () => updateLocation('Vadodara, Gujarat'),
      },
      {
        text: 'Mumbai, Maharashtra',
        onPress: () => updateLocation('Mumbai, Maharashtra'),
      },
      { text: 'Delhi, India', onPress: () => updateLocation('Delhi, India') },
      {
        text: 'Bangalore, Karnataka',
        onPress: () => updateLocation('Bangalore, Karnataka'),
      },
      {
        text: 'Other',
        onPress: () => {
          Alert.alert('Custom Location', 'Custom location entry coming soon!');
        },
      },
    ]);
  };

  const updateLocation = async (location: string) => {
    try {
      await updateProfile({ location });
      Alert.alert('Success', 'Location updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update location');
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account ⚠️',
      'This action cannot be undone. Your account and all data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Delete My Account',
          style: 'destructive',
          onPress: () => {
            // Final confirmation
            Alert.alert(
              'Final Confirmation',
              'This will permanently deactivate your account. This action cannot be undone.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete Account',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      await ProfileService.deleteUserAccount();
                      Alert.alert(
                        'Account Deleted',
                        'Your account has been deactivated.',
                      );
                    } catch (error) {
                      Alert.alert(
                        'Error',
                        'Failed to delete account. Please try again.',
                      );
                    }
                  },
                },
              ],
            );
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {renderProfileHeader()}
        {renderKarmaSnapshot()}
        {renderQuickStats()}
        {renderRecentActivity()}
        {renderSettings()}
        {renderAccountInfo()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  profileHeader: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 20,
    paddingVertical: 24,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#FEF3E0',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FEF3E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarEmoji: {
    fontSize: 32,
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  editAvatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#065F46',
    marginBottom: 4,
    fontFamily: 'System',
  },
  userStatus: {
    fontSize: 14,
    color: '#059669',
    marginBottom: 8,
    fontStyle: 'italic',
    fontFamily: 'System',
  },
  karmaLevelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  karmaLevelEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  karmaLevelText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#065F46',
    fontFamily: 'System',
  },
  editProfileButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  karmaSnapshotContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#065F46',
    marginBottom: 16,
    fontFamily: 'System',
  },
  karmaSnapshotCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0FDF4',
  },
  karmaScoreSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  karmaScoreNumber: {
    fontSize: 36,
    fontWeight: '800',
    color: '#065F46',
    fontFamily: 'System',
  },
  karmaScoreLabel: {
    fontSize: 14,
    color: '#059669',
    marginTop: 4,
    fontFamily: 'System',
  },
  karmaLevelSection: {
    marginBottom: 20,
  },
  karmaCurrentLevel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#065F46',
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: 'System',
  },
  progressBarContainer: {
    alignItems: 'center',
  },
  progressBarTrack: {
    width: '100%',
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#059669',
    fontFamily: 'System',
  },
  viewFullKarmaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0FDF4',
    paddingVertical: 12,
    borderRadius: 12,
  },
  viewFullKarmaText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
    marginRight: 6,
    fontFamily: 'System',
  },
  quickStatsContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    width: (width - 52) / 2,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#065F46',
    marginBottom: 4,
    fontFamily: 'System',
  },
  statTitle: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    fontFamily: 'System',
  },
  settingsContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingLabel: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 12,
    fontFamily: 'System',
  },
  settingValue: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'System',
  },
  accountContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  accountInfoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  accountInfoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  accountInfoLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'System',
  },
  accountInfoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    fontFamily: 'System',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 12,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
    fontFamily: 'System',
  },
  deleteButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  deleteButtonText: {
    fontSize: 14,
    color: '#EF4444',
    fontFamily: 'System',
  },
  // Loading states
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'System',
  },
  // Error states
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  errorText: {
    fontSize: 14,
    color: '#DC2626',
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: 'System',
  },
  retryButton: {
    backgroundColor: '#059669',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'System',
  },
  // Recent Activity styles
  recentActivityContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyActivityContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyActivityEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyActivityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#065F46',
    marginBottom: 4,
    fontFamily: 'System',
  },
  emptyActivitySubtext: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    fontFamily: 'System',
  },
  activityList: {
    marginTop: 8,
  },
  activityItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityEmoji: {
    fontSize: 16,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#065F46',
    marginBottom: 2,
    fontFamily: 'System',
  },
  activityDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 6,
    lineHeight: 16,
    fontFamily: 'System',
  },
  activityMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activityDate: {
    fontSize: 11,
    color: '#9CA3AF',
    fontFamily: 'System',
  },
  activityKarma: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityKarmaText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#F59E0B',
    marginLeft: 2,
    fontFamily: 'System',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    paddingVertical: 8,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
    marginRight: 4,
    fontFamily: 'System',
  },
  editableValue: {
    color: '#059669',
    textDecorationLine: 'underline',
  },
});

export default ProfileScreen;
