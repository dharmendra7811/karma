import React, { useState } from 'react';
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
import { useImpact } from '../contexts/ImpactContext';

const ImpactScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'personal' | 'local' | 'global'>(
    'personal',
  );
  const [refreshing, setRefreshing] = useState(false);

  const {
    currentKarma,
    impactItems,
    achievements,
    globalStats,
    karmaLevels,
    loading,
    errors,
    currentLevel,
    nextLevel,
    progressPercentage,
    pointsToNext,
    refreshAll,
  } = useImpact();

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshAll();
    } catch (error) {
      console.error('Error refreshing impact data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleAchievementPress = (achievement: any) => {
    if (achievement.earned) {
      Alert.alert(
        `${achievement.icon} ${achievement.title}`,
        `${achievement.description}\n\n${
          achievement.earnedDate
            ? `Earned: ${achievement.earnedDate}`
            : 'Achievement unlocked!'
        }`,
        [{ text: 'Awesome!', style: 'default' }],
      );
    } else {
      const progressText =
        achievement.requiredCount && achievement.currentCount !== undefined
          ? `\n\nProgress: ${achievement.currentCount}/${achievement.requiredCount}`
          : '';

      Alert.alert(
        `${achievement.icon} ${achievement.title}`,
        `${achievement.description}${progressText}\n\nKeep going to unlock this achievement!`,
        [{ text: 'Got it!', style: 'default' }],
      );
    }
  };

  const renderKarmaScore = () => (
    <View style={styles.karmaScoreContainer}>
      <View style={styles.karmaScoreMain}>
        {loading.karma ? (
          <ActivityIndicator size="large" color="#065F46" />
        ) : (
          <>
            <Text style={styles.karmaNumber}>{currentKarma}</Text>
            <View style={styles.karmaLevelInfo}>
              <Text style={styles.karmaLevelEmoji}>{currentLevel.emoji}</Text>
              <Text style={styles.karmaLevelText}>
                You're blooming! (Level: {currentLevel.name}{' '}
                {currentLevel.emoji})
              </Text>
            </View>
          </>
        )}
        {errors.karma && (
          <Text style={styles.errorText}>Failed to load karma score</Text>
        )}
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
              { width: `${progressPercentage}%` },
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
    <ScrollView
      style={styles.tabContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <Text style={styles.sectionTitle}>Your Impact Timeline 📚</Text>

      {loading.impactItems ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#065F46" />
          <Text style={styles.loadingText}>Loading your impact...</Text>
        </View>
      ) : errors.impactItems ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load impact timeline</Text>
          <TouchableOpacity onPress={handleRefresh} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : impactItems.length === 0 ? (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyStateEmoji}>🌱</Text>
          <Text style={styles.emptyStateTitle}>Start Your Impact Journey</Text>
          <Text style={styles.emptyStateText}>
            Log your first good deed to see your impact timeline!
          </Text>
        </View>
      ) : (
        impactItems.map(item => (
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
        ))
      )}

      <View style={styles.achievementsSection}>
        <Text style={styles.sectionTitle}>Achievements & Badges 🏅</Text>

        {loading.achievements ? (
          <ActivityIndicator size="small" color="#065F46" />
        ) : errors.achievements ? (
          <Text style={styles.errorText}>Failed to load achievements</Text>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.achievementsContainer}
          >
            {achievements.map(achievement => (
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
                {!achievement.earned &&
                  achievement.requiredCount &&
                  achievement.currentCount !== undefined && (
                    <Text style={styles.achievementProgress}>
                      {achievement.currentCount}/{achievement.requiredCount}
                    </Text>
                  )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
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
    <ScrollView
      style={styles.tabContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <Text style={styles.sectionTitle}>Global Impact 🌍</Text>

      {loading.globalStats ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#065F46" />
          <Text style={styles.loadingText}>Loading global stats...</Text>
        </View>
      ) : errors.globalStats ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load global stats</Text>
          <TouchableOpacity onPress={handleRefresh} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.globalStatsContainer}>
            <View style={styles.globalStatCard}>
              <Text style={styles.globalStatNumber}>
                {globalStats.totalKarmaPoints.toLocaleString()}
              </Text>
              <Text style={styles.globalStatLabel}>
                Karma Points Earned Worldwide
              </Text>
              <Text style={styles.globalStatEmoji}>🌍</Text>
            </View>

            <View style={styles.globalStatCard}>
              <Text style={styles.globalStatNumber}>
                {globalStats.environmentalActs.toLocaleString()}
              </Text>
              <Text style={styles.globalStatLabel}>
                Environmental Acts This Week
              </Text>
              <Text style={styles.globalStatEmoji}>💧</Text>
            </View>

            <View style={styles.globalStatCard}>
              <Text style={styles.globalStatNumber}>
                {globalStats.peopleHelped.toLocaleString()}
              </Text>
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

          <Text style={styles.sectionTitle}>
            This Week's Global Highlights 🌟
          </Text>
          <View style={styles.globalHighlights}>
            {globalStats.highlights.map(highlight => (
              <View key={highlight.id} style={styles.globalHighlight}>
                <Text style={styles.globalHighlightEmoji}>
                  {highlight.emoji}
                </Text>
                <Text style={styles.globalHighlightText}>{highlight.text}</Text>
              </View>
            ))}
          </View>
        </>
      )}
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
  achievementProgress: {
    fontSize: 9,
    color: '#6B7280',
    marginTop: 4,
    fontFamily: 'System',
  },
  // Loading and Error States
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
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 40,
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
  // Empty State
  emptyStateContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#065F46',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'System',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    fontFamily: 'System',
  },
  contributorNameHighlight: {
    color: '#059669',
    fontWeight: '700',
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
