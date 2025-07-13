import { supabase, Profile } from './supabase';

// Add these interfaces for avatar handling
export interface AvatarUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export interface ProfileStats {
  totalDeeds: number;
  totalEvents: number;
  badgesEarned: number;
  streakDays: number;
  karmaPoints: number;
  joinedDate: string;
}

export interface ProfileData {
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  avatar_emoji?: string;
  bio?: string;
  location?: string;
  status?: string;
  karma_points: number;
  total_deeds: number;
  created_at: string;
  updated_at: string;
  // Privacy settings
  is_profile_private?: boolean;
  notifications_enabled?: boolean;
  theme_preference?: 'light' | 'dark' | 'system';
  is_active?: boolean;
  deactivated_at?: string;
}

export interface RecentActivity {
  id: string;
  type: 'deed' | 'achievement' | 'event';
  title: string;
  description: string;
  date: string;
  icon: string;
  karma_earned?: number;
}

export class ProfileService {
  // Upload avatar image to Supabase Storage
  static async uploadAvatar(file: File | Blob, userId: string): Promise<AvatarUploadResult> {
    try {
      // Generate unique filename
      const fileExt = file.type?.split('/')[1] || 'jpg';
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true, // Replace existing file
        });

      if (error) {
        console.error('Upload error:', error);
        return { success: false, error: error.message };
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      if (!urlData?.publicUrl) {
        return { success: false, error: 'Failed to get public URL' };
      }

      // Update user profile with new avatar URL
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ 
          avatar_url: urlData.publicUrl,
          avatar_emoji: null, // Clear emoji when using photo
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) {
        console.error('Profile update error:', updateError);
        return { success: false, error: 'Failed to update profile' };
      }

      return { 
        success: true, 
        url: urlData.publicUrl 
      };

    } catch (error) {
      console.error('Avatar upload failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Upload failed' 
      };
    }
  }

  // Delete current avatar and revert to emoji
  static async deleteAvatar(userId: string): Promise<boolean> {
    try {
      // Get current avatar URL to extract file path
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('avatar_url')
        .eq('id', userId)
        .single();

      if (profile?.avatar_url) {
        // Extract file path from URL
        const url = new URL(profile.avatar_url);
        const filePath = url.pathname.split('/').pop();
        
        if (filePath) {
          // Delete from storage
          await supabase.storage
            .from('avatars')
            .remove([`${userId}/${filePath}`]);
        }
      }

      // Update profile to use emoji instead
      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          avatar_url: null,
          avatar_emoji: '🌸', // Default emoji
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      return !error;
    } catch (error) {
      console.error('Delete avatar failed:', error);
      return false;
    }
  }
  // Get current user's profile data
  static async getCurrentUserProfile(): Promise<ProfileData | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        // If profile doesn't exist, create one
        if (error.code === 'PGRST116') {
          const newProfile = await this.createUserProfile(user.id, {
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Karma User',
            avatar_emoji: '🌸',
            bio: 'Doing good, one deed at a time 🌱',
            location: 'Vadodara, Gujarat',
            status: 'New to Karma - ready to make a difference!',
          });
          return newProfile;
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  // Create a new user profile
  static async createUserProfile(
    userId: string, 
    profileData: Partial<ProfileData>
  ): Promise<ProfileData> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .insert([
          {
            id: userId,
            full_name: profileData.full_name || 'Karma User',
            avatar_emoji: profileData.avatar_emoji || '🌸',
            bio: profileData.bio || 'Doing good, one deed at a time 🌱',
            location: profileData.location || 'Vadodara, Gujarat',
            status: profileData.status || 'Ready to make a difference!',
            karma_points: 0,
            total_deeds: 0,
            is_profile_private: false,
            notifications_enabled: true,
            theme_preference: 'system',
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  }

  // Update user profile
  static async updateUserProfile(updates: Partial<ProfileData>): Promise<ProfileData> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }
  // Get user's profile statistics
  static async getProfileStats(userId?: string): Promise<ProfileStats> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const targetUserId = userId || user?.id;
      if (!targetUserId) throw new Error('No user ID provided');

      // Get user profile for basic stats
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('karma_points, total_deeds, created_at')
        .eq('id', targetUserId)
        .single();

      // Get events participated in
      const { data: events } = await supabase
        .from('activity_participants')
        .select('id')
        .eq('user_id', targetUserId);

      // Get achievements earned (calculate from karma and deeds)
      const karmaPoints = profile?.karma_points || 0;
      const totalDeeds = profile?.total_deeds || 0;
      const badgesEarned = this.calculateBadgesEarned(karmaPoints, totalDeeds);

      // Calculate streak days (simplified - based on recent activity)
      const streakDays = await this.calculateStreakDays(targetUserId);

      return {
        totalDeeds: totalDeeds,
        totalEvents: events?.length || 0,
        badgesEarned: badgesEarned,
        streakDays: streakDays,
        karmaPoints: karmaPoints,
        joinedDate: profile?.created_at || new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error fetching profile stats:', error);
      return {
        totalDeeds: 0,
        totalEvents: 0,
        badgesEarned: 0,
        streakDays: 0,
        karmaPoints: 0,
        joinedDate: new Date().toISOString(),
      };
    }
  }

  // Get recent activity for the user
  static async getRecentActivity(userId?: string, limit: number = 10): Promise<RecentActivity[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const targetUserId = userId || user?.id;
      if (!targetUserId) return [];

      // Get recent deeds
      const { data: deeds } = await supabase
        .from('deeds')
        .select(`
          id,
          title,
          description,
          karma_points,
          created_at,
          deed_categories(name, icon)
        `)
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: false })
        .limit(limit);

      const activities: RecentActivity[] = [];

      // Convert deeds to activities
      if (deeds) {
        deeds.forEach(deed => {
          activities.push({
            id: deed.id,
            type: 'deed',
            title: deed.title,
            description: deed.description || '',
            date: deed.created_at,
            icon: this.getCategoryIcon(deed.deed_categories?.name || 'general'),
            karma_earned: deed.karma_points,
          });
        });
      }

      // Sort by date and return
      return activities
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, limit);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      return [];
    }
  }
  // Helper function to calculate badges earned
  private static calculateBadgesEarned(karmaPoints: number, totalDeeds: number): number {
    let badges = 0;
    
    // Milestone badges
    if (totalDeeds >= 1) badges++; // First Steps
    if (totalDeeds >= 5) badges++; // Community Builder
    if (karmaPoints >= 100) badges++; // Karma Collector
    if (totalDeeds >= 25) badges++; // Helping Hand
    if (karmaPoints >= 500) badges++; // Karma Master
    if (totalDeeds >= 50) badges++; // Super Contributor
    
    return badges;
  }

  // Calculate streak days (simplified version)
  private static async calculateStreakDays(userId: string): Promise<number> {
    try {
      // Get deeds from the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: recentDeeds } = await supabase
        .from('deeds')
        .select('created_at')
        .eq('user_id', userId)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: false });

      if (!recentDeeds || recentDeeds.length === 0) return 0;

      // Simple streak calculation - count consecutive days with activity
      const today = new Date();
      let streak = 0;
      let currentDate = new Date(today);

      for (let i = 0; i < 30; i++) {
        const dayString = currentDate.toISOString().split('T')[0];
        const hasActivityThisDay = recentDeeds.some(deed => 
          deed.created_at.startsWith(dayString)
        );

        if (hasActivityThisDay) {
          streak++;
        } else if (streak > 0) {
          // Break streak if no activity found
          break;
        }

        currentDate.setDate(currentDate.getDate() - 1);
      }

      return streak;
    } catch (error) {
      console.error('Error calculating streak days:', error);
      return 0;
    }
  }

  // Helper function for category icons
  private static getCategoryIcon(categoryName: string): string {
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
    return '🌟';
  }

  // Update profile privacy settings
  static async updatePrivacySettings(settings: {
    is_profile_private?: boolean;
    notifications_enabled?: boolean;
    theme_preference?: 'light' | 'dark' | 'system';
  }): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('user_profiles')
        .update(settings)
        .eq('id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      throw error;
    }
  }

  // Delete user account (soft delete - mark as inactive)
  static async deleteUserAccount(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Mark profile as inactive instead of deleting
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({ 
          is_active: false,
          deactivated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Sign out the user
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) throw signOutError;

    } catch (error) {
      console.error('Error deleting user account:', error);
      throw error;
    }
  }
}