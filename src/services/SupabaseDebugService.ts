import { supabase } from '../lib/supabase';

export class SupabaseDebugService {
  // Test basic Supabase connection
  static async testConnection(): Promise<void> {
    try {
      console.log('Testing Supabase connection...');
      console.log('Supabase URL:', supabase.supabaseUrl);
      
      // Test basic query
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id')
        .limit(1);
      
      if (error) {
        console.error('Connection test failed:', error);
      } else {
        console.log('Connection test successful:', data);
      }
    } catch (error) {
      console.error('Connection test error:', error);
    }
  }

  // Test storage bucket access
  static async testStorageAccess(): Promise<void> {
    try {
      console.log('Testing storage access...');
      console.log('Supabase client initialized:', !!supabase);
      
      const { data, error } = await supabase.storage.listBuckets();
      
      console.log('Raw response from listBuckets:');
      console.log('Data:', JSON.stringify(data, null, 2));
      console.log('Error:', JSON.stringify(error, null, 2));
      
      if (error) {
        console.error('Storage access failed:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
      } else {
        console.log('Available buckets:', data);
        console.log('Bucket count:', data ? data.length : 0);
        
        if (data && data.length > 0) {
          console.log('First bucket details:', data[0]);
        } else {
          console.warn('No buckets found or empty array returned');
        }
      }
    } catch (error) {
      console.error('Storage access error:', error);
    }
  }

  // Test with service key if available
  static async testWithServiceKey(): Promise<void> {
    try {
      console.log('Testing with different auth levels...');
      
      // Test current auth level
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Current user auth level:', user ? 'authenticated' : 'anonymous');
      
      // Test if we can access the service role
      // Note: This would require service key instead of anon key
      console.log('Current Supabase URL:', supabase.supabaseUrl);
      console.log('Using anon key (first 20 chars):', supabase.supabaseKey.substring(0, 20) + '...');
      
      // Check what role we're using from the JWT
      if (user) {
        console.log('User role:', user.role || 'No role specified');
        console.log('User aud claim:', user.aud || 'No aud claim');
      }
      
    } catch (error) {
      console.error('Service key test error:', error);
    }
  }

  // Test RLS policies and permissions
  static async testRLSPolicies(): Promise<void> {
    try {
      console.log('Testing RLS policies...');
      
      // First check if we can access the storage schema
      const { data: buckets, error: bucketError } = await supabase
        .from('buckets')
        .select('*');
      
      console.log('Buckets table query:');
      console.log('Data:', JSON.stringify(buckets, null, 2));
      console.log('Error:', JSON.stringify(bucketError, null, 2));
      
      if (bucketError) {
        console.error('Cannot access buckets table:', bucketError);
        console.log('This might be expected if RLS is enabled');
      } else {
        console.log('Buckets table accessible:', buckets);
      }
      
      // Test direct API call to understand permissions
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        console.log('User role from token:', user.role);
        console.log('User aud from token:', user.aud);
      }
    } catch (error) {
      console.error('RLS test error:', error);
    }
  }

  // Test specific bucket access
  static async testBucketAccess(): Promise<void> {
    try {
      console.log('Testing specific bucket access...');
      
      // Test avatars bucket specifically
      const { data, error } = await supabase.storage
        .from('avatars')
        .list('', {
          limit: 10,
          offset: 0,
        });
      
      console.log('Avatars bucket list response:');
      console.log('Data:', JSON.stringify(data, null, 2));
      console.log('Error:', JSON.stringify(error, null, 2));
      
      if (error) {
        console.error('Avatars bucket access failed:', error);
        console.error('Error details:', {
          message: error.message,
          statusCode: error.statusCode,
          error: error.error
        });
      } else {
        console.log('Avatars bucket accessible:', data);
        console.log('Files in avatars bucket:', data ? data.length : 0);
      }
    } catch (error) {
      console.error('Bucket access error:', error);
    }
  }

  // Test simple text upload
  static async testSimpleUpload(): Promise<void> {
    try {
      console.log('Testing simple text upload...');
      
      const testContent = new Blob(['Hello World'], { type: 'text/plain' });
      const fileName = `test_${Date.now()}.txt`;
      
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(`test/${fileName}`, testContent, {
          contentType: 'text/plain',
        });
      
      if (error) {
        console.error('Simple upload failed:', error);
      } else {
        console.log('Simple upload successful:', data);
        
        // Clean up test file
        await supabase.storage
          .from('avatars')
          .remove([`test/${fileName}`]);
        console.log('Test file cleaned up');
      }
    } catch (error) {
      console.error('Simple upload error:', error);
    }
  }

  // Check user authentication
  static async checkAuth(): Promise<void> {
    try {
      console.log('Checking authentication...');
      
      const { data: { user }, error } = await supabase.auth.getUser();
      
      console.log('Auth response:');
      console.log('User:', user ? { id: user.id, email: user.email } : 'null');
      console.log('Error:', error);
      
      if (error) {
        console.error('Auth check failed:', error);
        console.error('Error details:', {
          message: error.message,
          status: error.status,
          code: error.code || 'No code'
        });
      } else if (user) {
        console.log('User authenticated:', user.id, user.email);
        console.log('User metadata:', user.user_metadata);
        console.log('User app metadata:', user.app_metadata);
      } else {
        console.log('No user authenticated');
      }
      
      // Also check the session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session check failed:', sessionError);
      } else if (session) {
        console.log('Session exists:', !!session);
        console.log('Session user:', session.user?.id);
        console.log('Access token length:', session.access_token?.length);
      } else {
        console.log('No session found');
      }
    } catch (error) {
      console.error('Auth check error:', error);
    }
  }

  // Run all debug tests
  static async runAllTests(): Promise<void> {
    console.log('🔍 Starting Supabase Debug Tests...');
    
    await this.testConnection();
    await this.checkAuth();
    await this.testWithServiceKey();
    await this.testRLSPolicies();
    await this.testStorageAccess();
    await this.testBucketAccess();
    await this.testSimpleUpload();
    
    console.log('🔍 Debug tests completed');
  }
}