# Karma App - Supabase Setup Guide

## 🚀 Quick Setup Instructions

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project" and sign up/login
3. Click "New Project"
4. Choose your organization and fill in:
   - **Project Name**: `Karma`
   - **Database Password**: (choose a strong password)
   - **Region**: (choose closest to your users)
5. Click "Create new project"

### 2. Get Your Project Credentials

Once your project is created:

1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (something like `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

### 3. Update Your App Configuration

1. Open `/src/lib/supabase.ts`
2. Replace the placeholder values:

```typescript
const supabaseUrl = 'YOUR_SUPABASE_URL'; // Replace with your Project URL
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY'; // Replace with your anon key
```

### 4. Set Up Database Tables

In your Supabase dashboard, go to **SQL Editor** and run this SQL:

\`\`\`sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  karma_score INTEGER DEFAULT 0,
  bio TEXT,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile" 
ON profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
ON profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();
\`\`\`

### 5. Install Dependencies

Run this command in your project root:

```bash
npm install @supabase/supabase-js@2.39.0 @react-native-async-storage/async-storage@1.21.0 react-native-url-polyfill@2.0.0 @react-navigation/stack@6.3.16
```

### 6. Test Your Setup

1. Run your app: `npm start` then `npm run android` or `npm run ios`
2. Try signing up with a test email
3. Check your Supabase dashboard → **Authentication** → **Users** to see if the user was created
4. Check **Table Editor** → **profiles** to see if the profile was created

## 🔧 Troubleshooting

### Common Issues:

1. **"Invalid API key"**: Make sure you copied the anon key correctly
2. **"Failed to fetch"**: Check your Project URL is correct and includes `https://`
3. **Sign up not working**: Verify your SQL tables were created correctly
4. **Profile not created**: Check the profiles table policies are set up

### Enable Email Confirmation (Optional)

By default, users can sign up without email confirmation. To enable it:

1. Go to **Authentication** → **Settings**
2. Turn off "Enable email confirmations"
3. Or set up email templates for a better user experience

## 🎉 You're All Set!

Your Karma app now has:
- ✅ User registration and login
- ✅ Protected routes (users must be logged in)
- ✅ User profiles with karma scores
- ✅ Secure logout functionality

Next steps:
- Add good deed logging functionality
- Implement karma point system
- Add social features like following other users