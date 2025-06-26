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
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

interface QuickStat {
  id: string;
  title: string;
  value: string;
  icon: string;
  color: string;
}

interface KarmaLevel {
  name: string;
  emoji: string;
  minPoints: number;
  maxPoints: number;
}

const ProfileScreen: React.FC = () => {
  const [isProfilePrivate, setIsProfilePrivate] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');

  // User data (in a real app, this would come from state management or API)
  const userData = {
    name: 'Ananya Sharma',
    email: 'ananya.sharma@example.com',
    avatar: '🌸',
    status: 'Doing good, one deed at a time 🌱',
    karmaScore: 452,
    location: 'Vadodara, Gujarat',
    bio: 'Environmental advocate and community volunteer. Love organizing cleanup drives!',
    memberSince: 'May 2025',
  };

  const karmaLevels: KarmaLevel[] = [
    { name: 'Seedling', emoji: '🌱', minPoints: 0, maxPoints: 99 },
    { name: 'Sprout', emoji: '🌿', minPoints: 100, maxPoints: 299 },
    { name: 'Lotus', emoji: '🪷', minPoints: 300, maxPoints: 599 },
    { name: 'Tree', emoji: '🌳', minPoints: 600, maxPoints: 999 },
    { name: 'Forest', emoji: '🌲', minPoints: 1000, maxPoints: 9999 },
  ];

  const getCurrentLevel = () => {
    return karmaLevels.find(level => 
      userData.karmaScore >= level.minPoints && userData.karmaScore <= level.maxPoints
    ) || karmaLevels[0];
  };

  const getNextLevel = () => {
    const currentLevelIndex = karmaLevels.findIndex(level => 
      userData.karmaScore >= level.minPoints && userData.karmaScore <= level.maxPoints
    );
    return karmaLevels[currentLevelIndex + 1] || null;
  };

  const getProgressPercentage = () => {
    const currentLevel = getCurrentLevel();
    const progress = (userData.karmaScore - currentLevel.minPoints) / 
                    (currentLevel.maxPoints - currentLevel.minPoints);
    return Math.min(progress * 100, 100);
  };

  const currentLevel = getCurrentLevel();
  const nextLevel = getNextLevel();

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
      value: '15',
      icon: 'local-fire-department',
      color: '#EF4444',
    },
  ];

  const handleEditAvatar = () => {
    Alert.alert(
      'Change Avatar 📸',
      'Choose how you\'d like to update your profile picture',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Choose Emoji', onPress: () => console.log('Emoji picker') },
        { text: 'Upload Photo', onPress: () => console.log('Photo picker') },
      ]
    );
  };

  const handleEditProfile = () => {
    Alert.alert(
      'Edit Profile ✏️',
      'Update your name, bio, and location',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Edit', onPress: () => console.log('Navigate to edit profile') },
      ]
    );
  };

  const handleViewFullKarma = () => {
    Alert.alert(
      'Karma Impact 🌟',
      'Navigate to your full Karma Impact screen to see detailed progress and achievements!',
      [
        { text: 'Stay Here', style: 'cancel' },
        { text: 'View Impact', onPress: () => console.log('Navigate to Impact screen') },
      ]
    );
  };

  const handleNotificationSettings = () => {
    Alert.alert(
      'Notification Preferences 🔔',
      'Customize what notifications you receive',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Manage', onPress: () => console.log('Navigate to notification settings') },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout 👋',
      'Are you sure you want to logout? Your karma progress will be saved.',
      [
        { text: 'Stay Logged In', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: () => console.log('Logout user') },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account ⚠️',
      'This action cannot be undone. All your karma points and deeds will be permanently lost.',
      [
        { text: 'Keep Account', style: 'cancel' },
        { 
          text: 'Delete Forever', 
          style: 'destructive', 
          onPress: () => {
            Alert.alert(
              'Final Confirmation',
              'Type "DELETE" to confirm account deletion',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Proceed', style: 'destructive', onPress: () => console.log('Delete account') },
              ]
            );
          }
        },
      ]
    );
  };

  const renderProfileHeader = () => (
    <View style={styles.profileHeader}>
      <TouchableOpacity style={styles.avatarContainer} onPress={handleEditAvatar}>
        <View style={styles.avatar}>
          <Text style={styles.avatarEmoji}>{userData.avatar}</Text>
        </View>
        <View style={styles.editAvatarBadge}>
          <Icon name="edit" size={12} color="#FFFFFF" />
        </View>
      </TouchableOpacity>
      
      <View style={styles.profileInfo}>
        <Text style={styles.userName}>{userData.name}</Text>
        <Text style={styles.userStatus}>{userData.status}</Text>
        <View style={styles.karmaLevelBadge}>
          <Text style={styles.karmaLevelEmoji}>{currentLevel.emoji}</Text>
          <Text style={styles.karmaLevelText}>{currentLevel.name}</Text>
        </View>
      </View>
      
      <TouchableOpacity style={styles.editProfileButton} onPress={handleEditProfile}>
        <Icon name="edit" size={16} color="#059669" />
      </TouchableOpacity>
    </View>
  );

  const renderKarmaSnapshot = () => (
    <View style={styles.karmaSnapshotContainer}>
      <Text style={styles.sectionTitle}>Your Karma Journey 🌱</Text>
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
                  { width: `${getProgressPercentage()}%` }
                ]} 
              />
            </View>
            {nextLevel && (
              <Text style={styles.progressText}>
                {nextLevel.minPoints - userData.karmaScore} points to {nextLevel.name} {nextLevel.emoji}
              </Text>
            )}
          </View>
        </View>
        
        <TouchableOpacity style={styles.viewFullKarmaButton} onPress={handleViewFullKarma}>
          <Text style={styles.viewFullKarmaText}>View Full Karma Impact</Text>
          <Icon name="arrow-forward" size={16} color="#059669" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderQuickStats = () => (
    <View style={styles.quickStatsContainer}>
      <Text style={styles.sectionTitle}>Quick Stats 📊</Text>
      <View style={styles.statsGrid}>
        {quickStats.map((stat) => (
          <View key={stat.id} style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: `${stat.color}20` }]}>
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
          onValueChange={setIsProfilePrivate}
          trackColor={{ false: '#E5E7EB', true: '#86EFAC' }}
          thumbColor={isProfilePrivate ? '#059669' : '#F3F4F6'}
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

      <TouchableOpacity style={styles.settingItem} onPress={handleEditAvatar}>
        <View style={styles.settingLeft}>
          <Icon name="photo-camera" size={20} color="#6B7280" />
          <Text style={styles.settingLabel}>Change Avatar</Text>
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
          onValueChange={setNotifications}
          trackColor={{ false: '#E5E7EB', true: '#86EFAC' }}
          thumbColor={notifications ? '#059669' : '#F3F4F6'}
        />
      </View>

      <TouchableOpacity style={styles.settingItem} onPress={handleNotificationSettings}>
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
        <Text style={styles.settingValue}>{theme === 'system' ? 'System' : theme === 'light' ? 'Light' : 'Dark'}</Text>
      </View>
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
          <Text style={styles.accountInfoValue}>{userData.location}</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Icon name="logout" size={20} color="#FFFFFF" />
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
        <Text style={styles.deleteButtonText}>Delete Account</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {renderProfileHeader()}
        {renderKarmaSnapshot()}
        {renderQuickStats()}
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
});

export default ProfileScreen;