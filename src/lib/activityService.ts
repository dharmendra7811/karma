import { supabase } from '../lib/supabase';

export interface CommunityActivity {
  id: string;
  creator_id: string;
  title: string;
  description: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  activity_date: string;
  activity_time: string;
  max_participants?: number;
  current_participants: number;
  category_id?: string;
  image_url?: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  creator?: {
    username?: string;
    full_name?: string;
    avatar_url?: string;
  };
  category?: {
    name: string;
    icon?: string;
    color?: string;
  };
  isParticipant?: boolean;
}

export interface ActivityParticipant {
  id: string;
  activity_id: string;
  user_id: string;
  joined_at: string;
  status: 'joined' | 'left' | 'completed';
}

export class ActivityService {
  // Create a new community activity
  static async createActivity(activityData: {
    title: string;
    description: string;
    location?: string;
    latitude?: number;
    longitude?: number;
    activity_date: string;
    activity_time: string;
    max_participants?: number;
    category_id?: string;
    image_url?: string;
  }): Promise<CommunityActivity> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('community_activities')
        .insert([
          {
            creator_id: user.id,
            title: activityData.title,
            description: activityData.description,
            location: activityData.location,
            activity_date: activityData.activity_date,
            activity_time: activityData.activity_time,
            max_participants: activityData.max_participants,
            category_id: activityData.category_id,
            image_url: activityData.image_url,
          }
        ])
        .select('*')
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating activity:', error);
      throw error;
    }
  }

  // Get all community activities
  static async getActivities(filter: {
    status?: string;
    category_id?: string;
    upcoming_only?: boolean;
  } = {}): Promise<CommunityActivity[]> {
    try {
      let query = supabase
        .from('community_activities')
        .select(`
          *,
          creator:user_profiles!community_activities_creator_id_fkey(username, full_name, avatar_url),
          category:deed_categories(name, icon, color)
        `)
        .order('activity_date', { ascending: true })
        .order('activity_time', { ascending: true });

      if (filter.status) {
        query = query.eq('status', filter.status);
      }

      if (filter.category_id) {
        query = query.eq('category_id', filter.category_id);
      }

      if (filter.upcoming_only) {
        const today = new Date().toISOString().split('T')[0];
        query = query.gte('activity_date', today);
      }

      const { data, error } = await query;

      if (error) {
        console.warn('Error with full query, trying simpler version:', error);
        // Fallback to simpler query
        const { data: simpleData, error: simpleError } = await supabase
          .from('community_activities')
          .select('*')
          .order('activity_date', { ascending: true });
        
        if (simpleError) throw simpleError;
        return simpleData || [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching activities:', error);
      throw error;
    }
  }

  // Join an activity
  static async joinActivity(activityId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Check if activity exists and has space
      const { data: activity, error: activityError } = await supabase
        .from('community_activities')
        .select('max_participants, current_participants')
        .eq('id', activityId)
        .single();

      if (activityError) throw activityError;

      if (activity.max_participants && activity.current_participants >= activity.max_participants) {
        throw new Error('Activity is full');
      }

      // Join the activity
      const { error } = await supabase
        .from('activity_participants')
        .insert([
          {
            activity_id: activityId,
            user_id: user.id,
          }
        ]);

      if (error) throw error;
    } catch (error) {
      console.error('Error joining activity:', error);
      throw error;
    }
  }

  // Leave an activity
  static async leaveActivity(activityId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('activity_participants')
        .delete()
        .eq('activity_id', activityId)
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error leaving activity:', error);
      throw error;
    }
  }

  // Get user's activities (created or joined)
  static async getUserActivities(userId: string): Promise<{
    created: CommunityActivity[];
    joined: CommunityActivity[];
  }> {
    try {
      // Get created activities
      const { data: created, error: createdError } = await supabase
        .from('community_activities')
        .select('*')
        .eq('creator_id', userId)
        .order('activity_date', { ascending: true });

      if (createdError) throw createdError;

      // Get joined activities
      const { data: participantData, error: participantError } = await supabase
        .from('activity_participants')
        .select(`
          activity_id,
          community_activities!inner(*)
        `)
        .eq('user_id', userId)
        .eq('status', 'joined');

      if (participantError) throw participantError;

      const joined = participantData?.map(p => p.community_activities) || [];

      return {
        created: created || [],
        joined: joined as CommunityActivity[]
      };
    } catch (error) {
      console.error('Error fetching user activities:', error);
      return { created: [], joined: [] };
    }
  }

  // Update activity status
  static async updateActivityStatus(activityId: string, status: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('community_activities')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', activityId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating activity status:', error);
      throw error;
    }
  }

  // Delete an activity (creator only)
  static async deleteActivity(activityId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('community_activities')
        .delete()
        .eq('id', activityId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting activity:', error);
      throw error;
    }
  }
}