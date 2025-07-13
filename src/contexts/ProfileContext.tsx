import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import {
  ProfileService,
  ProfileData,
  ProfileStats,
  RecentActivity,
} from '../lib/profileService';

interface ProfileContextType {
  // Data
  profile: ProfileData | null;
  stats: ProfileStats;
  recentActivity: RecentActivity[];

  // Loading states
  loading: {
    profile: boolean;
    stats: boolean;
    activity: boolean;
    updating: boolean;
  };

  // Error states
  errors: {
    profile: string | null;
    stats: string | null;
    activity: string | null;
    updating: string | null;
  };

  // Actions
  refreshProfile: () => Promise<void>;
  refreshStats: () => Promise<void>;
  refreshActivity: () => Promise<void>;
  refreshAll: () => Promise<void>;
  updateProfile: (updates: Partial<ProfileData>) => Promise<void>;
  updatePrivacySettings: (settings: {
    is_profile_private?: boolean;
    notifications_enabled?: boolean;
    theme_preference?: 'light' | 'dark' | 'system';
  }) => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

interface ProfileProviderProps {
  children: ReactNode;
}

export const ProfileProvider: React.FC<ProfileProviderProps> = ({
  children,
}) => {
  // State
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [stats, setStats] = useState<ProfileStats>({
    totalDeeds: 0,
    totalEvents: 0,
    badgesEarned: 0,
    streakDays: 0,
    karmaPoints: 0,
    joinedDate: new Date().toISOString(),
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);

  // Loading states
  const [loading, setLoading] = useState({
    profile: false,
    stats: false,
    activity: false,
    updating: false,
  });

  // Error states
  const [errors, setErrors] = useState({
    profile: null as string | null,
    stats: null as string | null,
    activity: null as string | null,
    updating: null as string | null,
  });
  // Helper functions
  const setLoadingState = (key: keyof typeof loading, value: boolean) => {
    setLoading(prev => ({ ...prev, [key]: value }));
  };

  const setErrorState = (key: keyof typeof errors, value: string | null) => {
    setErrors(prev => ({ ...prev, [key]: value }));
  };

  // Action functions
  const refreshProfile = async () => {
    setLoadingState('profile', true);
    setErrorState('profile', null);
    try {
      const profileData = await ProfileService.getCurrentUserProfile();
      setProfile(profileData);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to fetch profile';
      setErrorState('profile', errorMessage);
      console.error('Error refreshing profile:', error);
    } finally {
      setLoadingState('profile', false);
    }
  };

  const refreshStats = async () => {
    setLoadingState('stats', true);
    setErrorState('stats', null);
    try {
      const statsData = await ProfileService.getProfileStats();
      setStats(statsData);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to fetch stats';
      setErrorState('stats', errorMessage);
      console.error('Error refreshing stats:', error);
    } finally {
      setLoadingState('stats', false);
    }
  };

  const refreshActivity = async () => {
    setLoadingState('activity', true);
    setErrorState('activity', null);
    try {
      const activityData = await ProfileService.getRecentActivity();
      setRecentActivity(activityData);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to fetch activity';
      setErrorState('activity', errorMessage);
      console.error('Error refreshing activity:', error);
    } finally {
      setLoadingState('activity', false);
    }
  };

  const refreshAll = async () => {
    await Promise.all([refreshProfile(), refreshStats(), refreshActivity()]);
  };

  const updateProfile = async (updates: Partial<ProfileData>) => {
    setLoadingState('updating', true);
    setErrorState('updating', null);
    try {
      const updatedProfile = await ProfileService.updateUserProfile(updates);
      setProfile(updatedProfile);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to update profile';
      setErrorState('updating', errorMessage);
      console.error('Error updating profile:', error);
      throw error; // Re-throw so UI can handle it
    } finally {
      setLoadingState('updating', false);
    }
  };

  const updatePrivacySettings = async (settings: {
    is_profile_private?: boolean;
    notifications_enabled?: boolean;
    theme_preference?: 'light' | 'dark' | 'system';
  }) => {
    setLoadingState('updating', true);
    setErrorState('updating', null);
    try {
      await ProfileService.updatePrivacySettings(settings);
      // Update local state
      if (profile) {
        setProfile({
          ...profile,
          ...settings,
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to update settings';
      setErrorState('updating', errorMessage);
      console.error('Error updating privacy settings:', error);
      throw error;
    } finally {
      setLoadingState('updating', false);
    }
  };

  // Load initial data
  useEffect(() => {
    refreshAll();
  }, []);

  const value: ProfileContextType = {
    // Data
    profile,
    stats,
    recentActivity,

    // Loading states
    loading,

    // Error states
    errors,

    // Actions
    refreshProfile,
    refreshStats,
    refreshActivity,
    refreshAll,
    updateProfile,
    updatePrivacySettings,
  };

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
};

export const useProfile = (): ProfileContextType => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};
