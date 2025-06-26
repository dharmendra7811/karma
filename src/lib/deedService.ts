import { supabase, Deed, DeedCategory, Activity } from '../lib/supabase';

export class DeedService {
  // Get all deed categories
  static async getCategories(): Promise<DeedCategory[]> {
    try {
      const { data, error } = await supabase
        .from('deed_categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  // Log a new deed
  static async logDeed(deedData: {
    category_id: string;
    title: string;
    description?: string;
    location?: string;
    image_url?: string;
  }): Promise<Deed> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get category to calculate karma points
      const { data: category } = await supabase
        .from('deed_categories')
        .select('karma_multiplier')
        .eq('id', deedData.category_id)
        .single();

      const baseKarma = 10; // Base karma points for any deed
      const karmaPoints = Math.round(baseKarma * (category?.karma_multiplier || 1));

      // Insert the deed with basic select
      const { data, error } = await supabase
        .from('deeds')
        .insert([
          {
            user_id: user.id,
            category_id: deedData.category_id,
            title: deedData.title,
            description: deedData.description,
            location: deedData.location,
            image_url: deedData.image_url,
            karma_points: karmaPoints,
          }
        ])
        .select('*')
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error logging deed:', error);
      throw error;
    }
  }

  // Get user's deeds
  static async getUserDeeds(userId?: string): Promise<Deed[]> {
    try {
      let query = supabase
        .from('deeds')
        .select('*')
        .order('created_at', { ascending: false });

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching deeds:', error);
      throw error;
    }
  }

  // Get recent activity feed
  static async getActivityFeed(limit: number = 20): Promise<Activity[]> {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select(`
          *,
          user_profiles!inner(username, full_name, avatar_url)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.warn('Activity feed error, trying simpler query:', error);
        // Fallback to simpler query
        const { data: simpleData, error: simpleError } = await supabase
          .from('activities')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(limit);
        
        if (simpleError) throw simpleError;
        return simpleData || [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Error fetching activity feed:', error);
      throw error;
    }
  }

  // Get user's karma stats
  static async getUserKarmaStats(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('karma_points, total_deeds')
        .eq('id', userId)
        .single();

      if (error) {
        // If user profile doesn't exist, create it
        if (error.code === 'PGRST116') {
          const { data: newProfile, error: createError } = await supabase
            .from('user_profiles')
            .insert([
              {
                id: userId,
                karma_points: 0,
                total_deeds: 0,
              }
            ])
            .select('karma_points, total_deeds')
            .single();
          
          if (createError) throw createError;
          return newProfile;
        }
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching karma stats:', error);
      // Return default values on error
      return { karma_points: 0, total_deeds: 0 };
    }
  }

  // Delete a deed
  static async deleteDeed(deedId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('deeds')
        .delete()
        .eq('id', deedId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting deed:', error);
      throw error;
    }
  }
}