import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

// TODO: Replace with your actual Supabase project credentials

const supabaseUrl = 'https://lwqeyvyooawldhpndlru.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3cWV5dnlvb2F3bGRocG5kbHJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4Njc3NTQsImV4cCI6MjA2NjQ0Mzc1NH0.bx1rXIsURS090p1hS-4S8aMxe_3YDrPXnjRobeaUvOo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Database types for better TypeScript support
export interface Profile {
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
  // Privacy and settings
  is_profile_private?: boolean;
  notifications_enabled?: boolean;
  theme_preference?: 'light' | 'dark' | 'system';
  is_active?: boolean;
  deactivated_at?: string;
}

export interface DeedCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  karma_multiplier: number;
  created_at: string;
}

export interface Deed {
  id: string;
  user_id: string;
  category_id: string;
  title: string;
  description?: string;
  karma_points: number;
  location?: string;
  image_url?: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  category?: DeedCategory;
  user_profile?: Profile;
}

export interface Activity {
  id: string;
  user_id: string;
  deed_id?: string;
  activity_type: 'deed_logged' | 'karma_milestone' | 'badge_earned';
  title: string;
  description?: string;
  karma_earned: number;
  created_at: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  deed_title?: string;
  category_name?: string;
  category_icon?: string;
  category_color?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  karma_points?: number;
}
