import { supabase, Deed, Profile, Activity } from './supabase';

export interface ImpactItem {
  id: string;
  type: 'deed' | 'event';
  title: string;
  description: string;
  date: string;
  points: number;
  icon: string;
  category?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedDate?: string;
  category: string;
  requiredCount?: number;
  currentCount?: number;
}

export interface KarmaLevel {
  name: string;
  emoji: string;
  minPoints: number;
  maxPoints: number;
}

export interface LocalStats {
  peopleHelped: number;
  goodDeeds: number;
  topContributors: Array<{
    id: string;
    name: string;
    points: number;
    emoji: string;
    isCurrentUser?: boolean;
  }>;
}

export interface GlobalStats {
  totalKarmaPoints: number;
  environmentalActs: number;
  peopleHelped: number;
  highlights: Array<{
    id: string;
    emoji: string;
    text: string;
  }>;
}

export class ImpactService {
  // Karma levels configuration
  static karmaLevels: KarmaLevel[] = [
    { name: 'Seedling', emoji: '🌱', minPoints: 0, maxPoints: 99 },
    { name: 'Sprout', emoji: '🌿', minPoints: 100, maxPoints: 299 },
    { name: 'Lotus', emoji: '🪷', minPoints: 300, maxPoints: 599 },
    { name: 'Tree', emoji: '🌳', minPoints: 600, maxPoints: 999 },
    { name: 'Forest', emoji: '🌲', minPoints: 1000, maxPoints: 9999 },
  ];

  // Get current user's karma score
  static async getCurrentUserKarma(): Promise<number> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 0;

      const { data, error } = await supabase
        .from('user_profiles')
        .select('karma_points')
        .eq('id', user.id)
        .single();

      if (error) {
        console.warn('Error fetching karma:', error);
        return 0;
      }

      return data?.karma_points || 0;
    } catch (error) {
      console.error('Error getting current user karma:', error);
      return 0;
    }
  }
  // Get user's impact timeline (deeds and activities)
  static async getUserImpactItems(userId?: string): Promise<ImpactItem[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const targetUserId = userId || user?.id;
      if (!targetUserId) return [];

      // Get user's deeds
      const { data: deeds, error: deedsError } = await supabase
        .from('deeds')
        .select(`
          *,
          deed_categories(name, icon)
        `)
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (deedsError) {
        console.warn('Error fetching deeds, trying simpler query:', deedsError);
        // Fallback to simpler query
        const { data: simpleDeeds, error: simpleError } = await supabase
          .from('deeds')
          .select('*')
          .eq('user_id', targetUserId)
          .order('created_at', { ascending: false })
          .limit(20);
        
        if (simpleError) throw simpleError;
        
        return (simpleDeeds || []).map(deed => ({
          id: deed.id,
          type: 'deed' as const,
          title: deed.title,
          description: deed.description || '',
          date: new Date(deed.created_at).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
          }),
          points: deed.karma_points,
          icon: '🌟', // Default icon
          category: 'general'
        }));
      }

      // Convert deeds to impact items
      const deedItems: ImpactItem[] = (deeds || []).map(deed => ({
        id: deed.id,
        type: 'deed' as const,
        title: deed.title,
        description: deed.description || '',
        date: new Date(deed.created_at).toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        }),
        points: deed.karma_points,
        icon: this.getCategoryIcon(deed.deed_categories?.name || 'general'),
        category: deed.deed_categories?.name || 'general'
      }));

      // TODO: Add community activities that user participated in
      // For now, return just deeds
      return deedItems;
    } catch (error) {
      console.error('Error fetching user impact items:', error);
      return [];
    }
  }

  // Get user's achievements
  static async getUserAchievements(userId?: string): Promise<Achievement[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const targetUserId = userId || user?.id;
      if (!targetUserId) return [];

      // Get user's stats for achievement calculation
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('karma_points, total_deeds')
        .eq('id', targetUserId)
        .single();

      const karmaPoints = profile?.karma_points || 0;
      const totalDeeds = profile?.total_deeds || 0;

      // Get user's deed categories count for specific achievements
      const { data: categoryStats } = await supabase
        .from('deeds')
        .select('category_id')
        .eq('user_id', targetUserId);

      const categoryCounts = this.getCategoryCounts(categoryStats || []);

      return this.calculateAchievements(karmaPoints, totalDeeds, categoryCounts);
    } catch (error) {
      console.error('Error fetching achievements:', error);
      return [];
    }
  }
  // Get local community stats
  static async getLocalStats(): Promise<LocalStats> {
    try {
      // Get total unique users who logged deeds this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: monthlyDeeds } = await supabase
        .from('deeds')
        .select('user_id')
        .gte('created_at', startOfMonth.toISOString());

      const uniqueUsers = new Set(monthlyDeeds?.map(d => d.user_id) || []);
      const peopleHelped = uniqueUsers.size;

      // Get total deeds this week
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      const { data: weeklyDeeds } = await supabase
        .from('deeds')
        .select('id')
        .gte('created_at', startOfWeek.toISOString());

      const goodDeeds = weeklyDeeds?.length || 0;

      // Get top contributors
      const { data: topUsers } = await supabase
        .from('user_profiles')
        .select('id, username, full_name, karma_points')
        .order('karma_points', { ascending: false })
        .limit(5);

      const { data: { user } } = await supabase.auth.getUser();
      const currentUserId = user?.id;

      const topContributors = (topUsers || []).map((profile, index) => ({
        id: profile.id,
        name: profile.full_name || profile.username || 'Anonymous',
        points: profile.karma_points,
        emoji: this.getLeaderboardEmoji(index),
        isCurrentUser: profile.id === currentUserId
      }));

      return {
        peopleHelped,
        goodDeeds,
        topContributors
      };
    } catch (error) {
      console.error('Error fetching local stats:', error);
      return {
        peopleHelped: 0,
        goodDeeds: 0,
        topContributors: []
      };
    }
  }

  // Get global stats (aggregated data)
  static async getGlobalStats(): Promise<GlobalStats> {
    try {
      // Get total karma points from all users
      const { data: karmaData } = await supabase
        .from('user_profiles')
        .select('karma_points');

      const totalKarmaPoints = karmaData?.reduce((sum, profile) => sum + profile.karma_points, 0) || 0;

      // Get environmental deeds this week
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      
      const { data: envDeeds } = await supabase
        .from('deeds')
        .select(`
          deed_categories(name)
        `)
        .gte('created_at', startOfWeek.toISOString());

      const environmentalActs = envDeeds?.filter(deed => 
        deed.deed_categories?.name?.toLowerCase().includes('environment') ||
        deed.deed_categories?.name?.toLowerCase().includes('nature') ||
        deed.deed_categories?.name?.toLowerCase().includes('green')
      ).length || 0;

      // Get total people helped (unique users with deeds)
      const { data: allDeeds } = await supabase
        .from('deeds')
        .select('user_id');

      const peopleHelped = new Set(allDeeds?.map(d => d.user_id) || []).size;

      const highlights = [
        {
          id: '1',
          emoji: '🌱',
          text: `${Math.max(environmentalActs * 5, 100)} trees planted worldwide`
        },
        {
          id: '2',
          emoji: '📚',
          text: `${Math.max(Math.floor(totalKarmaPoints / 10), 50)} education initiatives started`
        },
        {
          id: '3',
          emoji: '🍲',
          text: `${Math.max(peopleHelped * 3, 500)} meals served to those in need`
        }
      ];

      return {
        totalKarmaPoints,
        environmentalActs,
        peopleHelped,
        highlights
      };
    } catch (error) {
      console.error('Error fetching global stats:', error);
      return {
        totalKarmaPoints: 0,
        environmentalActs: 0,
        peopleHelped: 0,
        highlights: []
      };
    }
  }
  // Helper functions
  static getCategoryIcon(categoryName: string): string {
    const iconMap: { [key: string]: string } = {
      'environment': '🌍',
      'education': '📚',
      'community': '🏘️',
      'helping': '🤝',
      'charity': '❤️',
      'volunteer': '🙋',
      'animal': '🐕',
      'elderly': '👴',
      'food': '🍲',
      'general': '🌟'
    };

    const lowercaseName = categoryName.toLowerCase();
    for (const [key, icon] of Object.entries(iconMap)) {
      if (lowercaseName.includes(key)) {
        return icon;
      }
    }
    return '🌟'; // Default icon
  }

  static getLeaderboardEmoji(position: number): string {
    const emojis = ['🥇', '🥈', '🥉', '🌟', '⭐'];
    return emojis[position] || '✨';
  }

  static getCategoryCounts(categoryStats: Array<{ category_id: string }>): { [key: string]: number } {
    const counts: { [key: string]: number } = {};
    categoryStats.forEach(stat => {
      counts[stat.category_id] = (counts[stat.category_id] || 0) + 1;
    });
    return counts;
  }

  static calculateAchievements(karmaPoints: number, totalDeeds: number, categoryCounts: { [key: string]: number }): Achievement[] {
    const achievements: Achievement[] = [
      {
        id: '1',
        title: 'First Steps',
        description: 'Logged your first good deed',
        icon: '👶',
        earned: totalDeeds >= 1,
        earnedDate: totalDeeds >= 1 ? 'When you logged your first deed' : undefined,
        category: 'milestone',
        requiredCount: 1,
        currentCount: totalDeeds
      },
      {
        id: '2',
        title: 'Community Builder',
        description: 'Log 5 good deeds',
        icon: '🏗️',
        earned: totalDeeds >= 5,
        earnedDate: totalDeeds >= 5 ? 'After 5 deeds' : undefined,
        category: 'community',
        requiredCount: 5,
        currentCount: totalDeeds
      },
      {
        id: '3',
        title: 'Karma Collector',
        description: 'Earn 100 karma points',
        icon: '💫',
        earned: karmaPoints >= 100,
        earnedDate: karmaPoints >= 100 ? 'After reaching 100 karma' : undefined,
        category: 'milestone',
        requiredCount: 100,
        currentCount: karmaPoints
      },
      {
        id: '4',
        title: 'Helping Hand',
        description: 'Complete 25 good deeds',
        icon: '🤝',
        earned: totalDeeds >= 25,
        category: 'helping',
        requiredCount: 25,
        currentCount: totalDeeds
      },
      {
        id: '5',
        title: 'Karma Master',
        description: 'Earn 500 karma points',
        icon: '🌟',
        earned: karmaPoints >= 500,
        category: 'milestone',
        requiredCount: 500,
        currentCount: karmaPoints
      },
      {
        id: '6',
        title: 'Super Contributor',
        description: 'Log 50 good deeds',
        icon: '⭐',
        earned: totalDeeds >= 50,
        category: 'leadership',
        requiredCount: 50,
        currentCount: totalDeeds
      }
    ];

    return achievements;
  }

  // Utility functions for karma levels
  static getCurrentLevel(karmaPoints: number): KarmaLevel {
    return this.karmaLevels.find(
      level => karmaPoints >= level.minPoints && karmaPoints <= level.maxPoints
    ) || this.karmaLevels[0];
  }

  static getNextLevel(karmaPoints: number): KarmaLevel | null {
    const currentLevelIndex = this.karmaLevels.findIndex(
      level => karmaPoints >= level.minPoints && karmaPoints <= level.maxPoints
    );
    return this.karmaLevels[currentLevelIndex + 1] || null;
  }

  static getProgressPercentage(karmaPoints: number): number {
    const currentLevel = this.getCurrentLevel(karmaPoints);
    const progress = (karmaPoints - currentLevel.minPoints) / 
                    (currentLevel.maxPoints - currentLevel.minPoints);
    return Math.min(progress * 100, 100);
  }
}