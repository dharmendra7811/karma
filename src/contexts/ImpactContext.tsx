import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import {
  ImpactService,
  ImpactItem,
  Achievement,
  LocalStats,
  GlobalStats,
  KarmaLevel,
} from '../lib/impactService';

interface ImpactContextType {
  // Data
  currentKarma: number;
  impactItems: ImpactItem[];
  achievements: Achievement[];
  localStats: LocalStats;
  globalStats: GlobalStats;
  karmaLevels: KarmaLevel[];

  // Loading states
  loading: {
    karma: boolean;
    impactItems: boolean;
    achievements: boolean;
    localStats: boolean;
    globalStats: boolean;
  };

  // Error states
  errors: {
    karma: string | null;
    impactItems: string | null;
    achievements: string | null;
    localStats: string | null;
    globalStats: string | null;
  };

  // Computed values
  currentLevel: KarmaLevel;
  nextLevel: KarmaLevel | null;
  progressPercentage: number;
  pointsToNext: number;

  // Actions
  refreshKarma: () => Promise<void>;
  refreshImpactItems: () => Promise<void>;
  refreshAchievements: () => Promise<void>;
  refreshLocalStats: () => Promise<void>;
  refreshGlobalStats: () => Promise<void>;
  refreshAll: () => Promise<void>;
}

const ImpactContext = createContext<ImpactContextType | undefined>(undefined);

interface ImpactProviderProps {
  children: ReactNode;
}
export const ImpactProvider: React.FC<ImpactProviderProps> = ({ children }) => {
  // State
  const [currentKarma, setCurrentKarma] = useState(0);
  const [impactItems, setImpactItems] = useState<ImpactItem[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [localStats, setLocalStats] = useState<LocalStats>({
    peopleHelped: 0,
    goodDeeds: 0,
    topContributors: [],
  });
  const [globalStats, setGlobalStats] = useState<GlobalStats>({
    totalKarmaPoints: 0,
    environmentalActs: 0,
    peopleHelped: 0,
    highlights: [],
  });

  // Loading states
  const [loading, setLoading] = useState({
    karma: false,
    impactItems: false,
    achievements: false,
    localStats: false,
    globalStats: false,
  });

  // Error states
  const [errors, setErrors] = useState({
    karma: null as string | null,
    impactItems: null as string | null,
    achievements: null as string | null,
    localStats: null as string | null,
    globalStats: null as string | null,
  });

  // Computed values
  const karmaLevels = ImpactService.karmaLevels;
  const currentLevel = ImpactService.getCurrentLevel(currentKarma);
  const nextLevel = ImpactService.getNextLevel(currentKarma);
  const progressPercentage = ImpactService.getProgressPercentage(currentKarma);
  const pointsToNext = nextLevel ? nextLevel.minPoints - currentKarma : 0;
  // Helper function to update loading state
  const setLoadingState = (key: keyof typeof loading, value: boolean) => {
    setLoading(prev => ({ ...prev, [key]: value }));
  };

  // Helper function to update error state
  const setErrorState = (key: keyof typeof errors, value: string | null) => {
    setErrors(prev => ({ ...prev, [key]: value }));
  };

  // Action functions
  const refreshKarma = async () => {
    setLoadingState('karma', true);
    setErrorState('karma', null);
    try {
      const karma = await ImpactService.getCurrentUserKarma();
      setCurrentKarma(karma);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to fetch karma';
      setErrorState('karma', errorMessage);
      console.error('Error refreshing karma:', error);
    } finally {
      setLoadingState('karma', false);
    }
  };

  const refreshImpactItems = async () => {
    setLoadingState('impactItems', true);
    setErrorState('impactItems', null);
    try {
      const items = await ImpactService.getUserImpactItems();
      setImpactItems(items);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to fetch impact items';
      setErrorState('impactItems', errorMessage);
      console.error('Error refreshing impact items:', error);
    } finally {
      setLoadingState('impactItems', false);
    }
  };

  const refreshAchievements = async () => {
    setLoadingState('achievements', true);
    setErrorState('achievements', null);
    try {
      const userAchievements = await ImpactService.getUserAchievements();
      setAchievements(userAchievements);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to fetch achievements';
      setErrorState('achievements', errorMessage);
      console.error('Error refreshing achievements:', error);
    } finally {
      setLoadingState('achievements', false);
    }
  };
  const refreshLocalStats = async () => {
    setLoadingState('localStats', true);
    setErrorState('localStats', null);
    try {
      const stats = await ImpactService.getLocalStats();
      setLocalStats(stats);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to fetch local stats';
      setErrorState('localStats', errorMessage);
      console.error('Error refreshing local stats:', error);
    } finally {
      setLoadingState('localStats', false);
    }
  };

  const refreshGlobalStats = async () => {
    setLoadingState('globalStats', true);
    setErrorState('globalStats', null);
    try {
      const stats = await ImpactService.getGlobalStats();
      setGlobalStats(stats);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to fetch global stats';
      setErrorState('globalStats', errorMessage);
      console.error('Error refreshing global stats:', error);
    } finally {
      setLoadingState('globalStats', false);
    }
  };

  const refreshAll = async () => {
    await Promise.all([
      refreshKarma(),
      refreshImpactItems(),
      refreshAchievements(),
      refreshLocalStats(),
      refreshGlobalStats(),
    ]);
  };

  // Load initial data
  useEffect(() => {
    refreshAll();
  }, []);

  const value: ImpactContextType = {
    // Data
    currentKarma,
    impactItems,
    achievements,
    localStats,
    globalStats,
    karmaLevels,

    // Loading states
    loading,

    // Error states
    errors,

    // Computed values
    currentLevel,
    nextLevel,
    progressPercentage,
    pointsToNext,

    // Actions
    refreshKarma,
    refreshImpactItems,
    refreshAchievements,
    refreshLocalStats,
    refreshGlobalStats,
    refreshAll,
  };

  return (
    <ImpactContext.Provider value={value}>{children}</ImpactContext.Provider>
  );
};

export const useImpact = (): ImpactContextType => {
  const context = useContext(ImpactContext);
  if (context === undefined) {
    throw new Error('useImpact must be used within an ImpactProvider');
  }
  return context;
};
