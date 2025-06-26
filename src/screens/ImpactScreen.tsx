import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedDate?: string;
  category: string;
}

interface ImpactItem {
  id: string;
  type: 'deed' | 'event';
  title: string;
  description: string;
  date: string;
  points: number;
  icon: string;
}

interface KarmaLevel {
  name: string;
  emoji: string;
  minPoints: number;
  maxPoints: number;
}

const ImpactScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'personal' | 'local' | 'global'>(
    'personal',
  );

  // User's karma data
  const currentKarma = 452;
  const karmaLevels: KarmaLevel[] = [
    { name: 'Seedling', emoji: '🌱', minPoints: 0, maxPoints: 99 },
    { name: 'Sprout', emoji: '🌿', minPoints: 100, maxPoints: 299 },
    { name: 'Lotus', emoji: '🪷', minPoints: 300, maxPoints: 599 },
    { name: 'Tree', emoji: '🌳', minPoints: 600, maxPoints: 999 },
    { name: 'Forest', emoji: '🌲', minPoints: 1000, maxPoints: 9999 },
  ];

  const getCurrentLevel = () => {
    return (
      karmaLevels.find(
        level =>
          currentKarma >= level.minPoints && currentKarma <= level.maxPoints,
      ) || karmaLevels[0]
    );
  };

  const getNextLevel = () => {
    const currentLevelIndex = karmaLevels.findIndex(
      level =>
        currentKarma >= level.minPoints && currentKarma <= level.maxPoints,
    );
    return karmaLevels[currentLevelIndex + 1] || null;
  };

  const getProgressPercentage = () => {
    const currentLevel = getCurrentLevel();
    const progress =
      (currentKarma - currentLevel.minPoints) /
      (currentLevel.maxPoints - currentLevel.minPoints);
    return Math.min(progress * 100, 100);
  };

  const currentLevel = getCurrentLevel();
  const nextLevel = getNextLevel();
  const pointsToNext = nextLevel ? nextLevel.minPoints - currentKarma : 0;

  const mockImpactItems: ImpactItem[] = [
    {
      id: '1',
      type: 'deed',
      title: 'Helped elderly neighbor with groceries',
      description: 'Carried heavy bags and spent time chatting',
      date: 'June 25, 2025',
      points: 15,
      icon: '🛒',
    },
    {
      id: '2',
      type: 'event',
      title: 'Community Garden Cleanup',
      description: 'Joined 12 others to maintain our local garden',
      date: 'June 24, 2025',
      points: 25,
      icon: '🌱',
    },
    {
      id: '3',
      type: 'deed',
      title: 'Donated books to library',
      description: "Gave 20 children's books to local library",
      date: 'June 22, 2025',
      points: 20,
      icon: '📚',
    },
    {
      id: '4',
      type: 'deed',
      title: 'Volunteered at animal shelter',
      description: 'Helped walk dogs and clean kennels',
      date: 'June 20, 2025',
      points: 18,
      icon: '🐕',
    },
    {
      id: '5',
      type: 'event',
      title: 'Beach Cleanup Drive',
      description: 'Collected plastic waste with 30 volunteers',
      date: 'June 18, 2025',
      points: 30,
      icon: '🏖️',
    },
  ];

  const mockAchievements: Achievement[] = [
    {
      id: '1',
      title: 'First Steps',
      description: 'Logged your first good deed',
      icon: '👶',
      earned: true,
      earnedDate: 'May 15, 2025',
      category: 'milestone',
    },
    {
      id: '2',
      title: 'Community Builder',
      description: 'Joined 5 community events',
      icon: '🏗️',
      earned: true,
      earnedDate: 'June 10, 2025',
      category: 'community',
    },
    {
      id: '3',
      title: 'Green Warrior',
      description: 'Completed 10 environmental deeds',
      icon: '🌍',
      earned: true,
      earnedDate: 'June 20, 2025',
      category: 'environment',
    },
    {
      id: '4',
      title: 'Photo Champion',
      description: 'Most inspiring photo this month',
      icon: '📸',
      earned: true,
      earnedDate: 'June 22, 2025',
      category: 'special',
    },
    {
      id: '5',
      title: 'Helping Hand',
      description: 'Complete 25 helping deeds',
      icon: '🤝',
      earned: false,
      category: 'helping',
    },
    {
      id: '6',
      title: 'Super Connector',
      description: 'Organize 3 community events',
      icon: '⭐',
      earned: false,
      category: 'leadership',
    },
  ];

  const handleAchievementPress = (achievement: Achievement) => {
    if (achievement.earned) {
      Alert.alert(
        `${achievement.icon} ${achievement.title}`,
        `${achievement.description}\n\nEarned: ${achievement.earnedDate}`,
        [{ text: 'Awesome!', style: 'default' }],
      );
    } else {
      Alert.alert(
        `${achievement.icon} ${achievement.title}`,
        `${achievement.description}\n\nKeep going to unlock this achievement!`,
        [{ text: 'Got it!', style: 'default' }],
      );
    }
  };

  const renderKarmaScore = () => (
    <View style={styles.karmaScoreContainer}>
      <View style={styles.karmaScoreMain}>
        <Text style={styles.karmaNumber}>{currentKarma}</Text>
        <View style={styles.karmaLevelInfo}>
          <Text style={styles.karmaLevelEmoji}>{currentLevel.emoji}</Text>
          <Text style={styles.karmaLevelText}>
            You're blooming! (Level: {currentLevel.name} {currentLevel.emoji})
          </Text>
        </View>
      </View>
    </View>
  );

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      <Text style={styles.progressTitle}>Karma Growth Journey</Text>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarTrack}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${getProgressPercentage()}%` },
            ]}
          />
        </View>
      </View>

      {/* Level Icons */}
      <View style={styles.levelIconsContainer}>
        {karmaLevels.map(level => (
          <View key={level.name} style={styles.levelIcon}>
            <Text
              style={[
                styles.levelEmoji,
                currentKarma >= level.minPoints && styles.levelEmojiActive,
              ]}
            >
              {level.emoji}
            </Text>
            <Text style={styles.levelName}>{level.name}</Text>
          </View>
        ))}
      </View>

      {nextLevel && (
        <Text style={styles.progressText}>
          {pointsToNext} more points to become a {nextLevel.name}{' '}
          {nextLevel.emoji}
        </Text>
      )}
    </View>
  );

  const renderPersonalTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Your Impact Timeline 📚</Text>

      {mockImpactItems.map(item => (
        <View key={item.id} style={styles.impactItem}>
          <View style={styles.impactIcon}>
            <Text style={styles.impactEmoji}>{item.icon}</Text>
          </View>
          <View style={styles.impactContent}>
            <Text style={styles.impactTitle}>{item.title}</Text>
            <Text style={styles.impactDescription}>{item.description}</Text>
            <View style={styles.impactMeta}>
              <Text style={styles.impactDate}>{item.date}</Text>
              <View style={styles.impactPoints}>
                <Icon name="star" size={14} color="#F59E0B" />
                <Text style={styles.impactPointsText}>+{item.points}</Text>
              </View>
            </View>
          </View>
        </View>
      ))}

      <View style={styles.achievementsSection}>
        <Text style={styles.sectionTitle}>Achievements & Badges 🏅</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.achievementsContainer}
        >
          {mockAchievements.map(achievement => (
            <TouchableOpacity
              key={achievement.id}
              style={[
                styles.achievementBadge,
                !achievement.earned && styles.achievementBadgeLocked,
              ]}
              onPress={() => handleAchievementPress(achievement)}
            >
              <Text
                style={[
                  styles.achievementIcon,
                  !achievement.earned && styles.achievementIconLocked,
                ]}
              >
                {achievement.icon}
              </Text>
              <Text
                style={[
                  styles.achievementTitle,
                  !achievement.earned && styles.achievementTitleLocked,
                ]}
              >
                {achievement.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </ScrollView>
  );

  const renderLocalTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Local Community Impact 🏘️</Text>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>386</Text>
          <Text style={styles.statLabel}>People Helped</Text>
          <Text style={styles.statSubtext}>in Vadodara this month</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>127</Text>
          <Text style={styles.statLabel}>Good Deeds</Text>
          <Text style={styles.statSubtext}>logged this week</Text>
        </View>
      </View>

      <View style={styles.localMapPlaceholder}>
        <Icon name="map" size={48} color="#10B981" />
        <Text style={styles.localMapText}>Your Local Impact Map</Text>
        <Text style={styles.localMapSubtext}>
          See good deeds happening around you
        </Text>
      </View>

      <View style={styles.inspiringQuoteContainer}>
        <Text style={styles.inspiringQuote}>
          "Your city helped 386 people this month! 🌟"
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Top Local Contributors 👏</Text>
      <View style={styles.contributorsContainer}>
        <View style={styles.contributor}>
          <Text style={styles.contributorEmoji}>🌟</Text>
          <Text style={styles.contributorName}>Sarah M.</Text>
          <Text style={styles.contributorPoints}>1,247 points</Text>
        </View>
        <View style={styles.contributor}>
          <Text style={styles.contributorEmoji}>🌿</Text>
          <Text style={styles.contributorName}>Alex R.</Text>
          <Text style={styles.contributorPoints}>1,156 points</Text>
        </View>
        <View style={styles.contributor}>
          <Text style={styles.contributorEmoji}>🌱</Text>
          <Text style={styles.contributorName}>You!</Text>
          <Text style={styles.contributorPoints}>452 points</Text>
        </View>
      </View>
    </ScrollView>
  );

  const renderGlobalTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Global Impact 🌍</Text>

      <View style={styles.globalStatsContainer}>
        <View style={styles.globalStatCard}>
          <Text style={styles.globalStatNumber}>72,456</Text>
          <Text style={styles.globalStatLabel}>
            Karma Points Earned Worldwide
          </Text>
          <Text style={styles.globalStatEmoji}>🌍</Text>
        </View>

        <View style={styles.globalStatCard}>
          <Text style={styles.globalStatNumber}>1,208</Text>
          <Text style={styles.globalStatLabel}>
            Environmental Acts This Week
          </Text>
          <Text style={styles.globalStatEmoji}>💧</Text>
        </View>

        <View style={styles.globalStatCard}>
          <Text style={styles.globalStatNumber}>15,432</Text>
          <Text style={styles.globalStatLabel}>People Helped Globally</Text>
          <Text style={styles.globalStatEmoji}>🤝</Text>
        </View>
      </View>

      <View style={styles.globalMapPlaceholder}>
        <Icon name="public" size={48} color="#10B981" />
        <Text style={styles.globalMapText}>Global Good Deeds</Text>
        <Text style={styles.globalMapSubtext}>
          Watch kindness spread across the world
        </Text>
      </View>

      <Text style={styles.sectionTitle}>This Week's Global Highlights 🌟</Text>
      <View style={styles.globalHighlights}>
        <View style={styles.globalHighlight}>
          <Text style={styles.globalHighlightEmoji}>🌱</Text>
          <Text style={styles.globalHighlightText}>
            2,450 trees planted worldwide
          </Text>
        </View>
        <View style={styles.globalHighlight}>
          <Text style={styles.globalHighlightEmoji}>📚</Text>
          <Text style={styles.globalHighlightText}>
            890 education initiatives started
          </Text>
        </View>
        <View style={styles.globalHighlight}>
          <Text style={styles.globalHighlightEmoji}>🍲</Text>
          <Text style={styles.globalHighlightText}>
            12,300 meals served to those in need
          </Text>
        </View>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Karma Score Section */}
      {renderKarmaScore()}

      {/* Progress Bar Section */}
      {renderProgressBar()}

      {/* Tab Navigation */}
      <View style={styles.tabNavigation}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'personal' && styles.tabButtonActive,
          ]}
          onPress={() => setActiveTab('personal')}
        >
          <Text
            style={[
              styles.tabButtonText,
              activeTab === 'personal' && styles.tabButtonTextActive,
            ]}
          >
            My Impact
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'local' && styles.tabButtonActive,
          ]}
          onPress={() => setActiveTab('local')}
        >
          <Text
            style={[
              styles.tabButtonText,
              activeTab === 'local' && styles.tabButtonTextActive,
            ]}
          >
            Local
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'global' && styles.tabButtonActive,
          ]}
          onPress={() => setActiveTab('global')}
        >
          <Text
            style={[
              styles.tabButtonText,
              activeTab === 'global' && styles.tabButtonTextActive,
            ]}
          >
            Global
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {activeTab === 'personal' && renderPersonalTab()}
      {activeTab === 'local' && renderLocalTab()}
      {activeTab === 'global' && renderGlobalTab()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  karmaScoreContainer: {
    backgroundColor: '#F0FDF4',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FEF3E0',
  },
  karmaScoreMain: {
    alignItems: 'center',
  },
  karmaNumber: {
    fontSize: 48,
    fontWeight: '800',
    color: '#065F46',
    fontFamily: 'System',
  },
  karmaLevelInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  karmaLevelEmoji: {
    fontSize: 24,
    marginRight: 8,
  },
  karmaLevelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#059669',
    fontFamily: 'System',
  },
  progressContainer: {
    marginHorizontal: 16,
    marginTop: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#065F46',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'System',
  },
  progressBarContainer: {
    marginBottom: 16,
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  levelIconsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  levelIcon: {
    alignItems: 'center',
    flex: 1,
  },
  levelEmoji: {
    fontSize: 20,
    opacity: 0.3,
    marginBottom: 4,
  },
  levelEmojiActive: {
    opacity: 1,
  },
  levelName: {
    fontSize: 10,
    color: '#6B7280',
    fontFamily: 'System',
  },
  progressText: {
    fontSize: 14,
    color: '#059669',
    textAlign: 'center',
    fontFamily: 'System',
  },
  tabNavigation: {
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
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#F0FDF4',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    fontFamily: 'System',
  },
  tabButtonTextActive: {
    color: '#065F46',
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#065F46',
    marginTop: 20,
    marginBottom: 16,
    fontFamily: 'System',
  },
  impactItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  impactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  impactEmoji: {
    fontSize: 18,
  },
  impactContent: {
    flex: 1,
  },
  impactTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#065F46',
    marginBottom: 4,
    fontFamily: 'System',
  },
  impactDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
    fontFamily: 'System',
  },
  impactMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  impactDate: {
    fontSize: 11,
    color: '#9CA3AF',
    fontFamily: 'System',
  },
  impactPoints: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  impactPointsText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#F59E0B',
    marginLeft: 2,
    fontFamily: 'System',
  },
  achievementsSection: {
    marginTop: 20,
    marginBottom: 20,
  },
  achievementsContainer: {
    paddingRight: 16,
    paddingBottom: 5,
    paddingTop: 5,
  },
  achievementBadge: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    alignItems: 'center',
    width: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  achievementBadgeLocked: {
    backgroundColor: '#F3F4F6',
    opacity: 0.6,
  },
  achievementIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  achievementIconLocked: {
    opacity: 0.3,
  },
  achievementTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#065F46',
    textAlign: 'center',
    fontFamily: 'System',
  },
  achievementTitleLocked: {
    color: '#9CA3AF',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#065F46',
    fontFamily: 'System',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
    textAlign: 'center',
    marginTop: 4,
    fontFamily: 'System',
  },
  statSubtext: {
    fontSize: 10,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 2,
    fontFamily: 'System',
  },
  localMapPlaceholder: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    marginBottom: 20,
  },
  localMapText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#065F46',
    marginTop: 8,
    fontFamily: 'System',
  },
  localMapSubtext: {
    fontSize: 12,
    color: '#059669',
    marginTop: 4,
    fontFamily: 'System',
  },
  inspiringQuoteContainer: {
    backgroundColor: '#FEF3E0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  inspiringQuote: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    textAlign: 'center',
    fontStyle: 'italic',
    fontFamily: 'System',
  },
  contributorsContainer: {
    marginBottom: 20,
  },
  contributor: {
    flexDirection: 'row',
    alignItems: 'center',
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
  contributorEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  contributorName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#065F46',
    fontFamily: 'System',
  },
  contributorPoints: {
    fontSize: 12,
    color: '#059669',
    fontFamily: 'System',
  },
  globalStatsContainer: {
    marginBottom: 20,
  },
  globalStatCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  globalStatNumber: {
    fontSize: 32,
    fontWeight: '800',
    color: '#065F46',
    fontFamily: 'System',
  },
  globalStatLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
    textAlign: 'center',
    marginTop: 4,
    fontFamily: 'System',
  },
  globalStatEmoji: {
    fontSize: 24,
    marginTop: 8,
  },
  globalMapPlaceholder: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    marginBottom: 20,
  },
  globalMapText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#065F46',
    marginTop: 8,
    fontFamily: 'System',
  },
  globalMapSubtext: {
    fontSize: 12,
    color: '#059669',
    marginTop: 4,
    fontFamily: 'System',
  },
  globalHighlights: {
    marginBottom: 20,
  },
  globalHighlight: {
    flexDirection: 'row',
    alignItems: 'center',
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
  globalHighlightEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  globalHighlightText: {
    fontSize: 14,
    color: '#374151',
    fontFamily: 'System',
  },
});

export default ImpactScreen;
