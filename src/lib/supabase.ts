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
  email: string;
  full_name: string;
  avatar_url?: string;
  karma_score: number;
  created_at: string;
  updated_at: string;
}

export interface AuthUser {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  karma_score?: number;
}
