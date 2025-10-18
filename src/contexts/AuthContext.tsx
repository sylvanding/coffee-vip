import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, UserProfile } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (phone: string, password: string) => Promise<void>;
  signUp: (phone: string, password: string, invitationCode: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUsername: (username: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (!error && data) {
      setProfile(data);
      
      // Complete invitation code usage if there's a pending one
      if (data.pending_invitation_code) {
        try {
          await supabase.rpc('complete_invitation_code_usage', {
            user_id: userId
          });
          // Reload profile to clear pending_invitation_code
          const { data: updatedData } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle();
          if (updatedData) {
            setProfile(updatedData);
          }
        } catch (err) {
          console.error('Failed to complete invitation code usage:', err);
          // Don't throw error since user is already logged in
        }
      }
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        setUser(session?.user ?? null);
        if (session?.user) {
          await loadProfile(session.user.id);
        } else {
          setProfile(null);
        }
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (phone: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: `${phone}@coffeeshop.local`,
      password,
    });

    if (error) {
      console.error('Supabase auth error:', error);
      throw new Error(error.message || 'Login failed');
    }

    if (!data.user) {
      throw new Error('Login failed. Please check your phone number and password.');
    }
  };

  const signUp = async (phone: string, password: string, invitationCode: string) => {
    // 1. Verify invitation code (as anonymous user)
    const { data: codeData, error: codeError } = await supabase
      .from('invitation_codes')
      .select('*')
      .eq('code', invitationCode)
      .eq('is_used', false)
      .maybeSingle();

    if (codeError) {
      console.error('Invitation code query error:', codeError);
      throw new Error('Failed to verify invitation code');
    }

    if (!codeData) {
      throw new Error('Invitation code is invalid or has already been used');
    }

    // 2. Create user account (this will automatically log in the user)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: `${phone}@coffeeshop.local`,
      password,
    });

    if (authError) {
      console.error('User creation error:', authError);
      throw authError;
    }
    
    if (!authData.user) {
      throw new Error('Failed to create user account');
    }

    // Ensure session is established
    if (!authData.session) {
      throw new Error('Failed to create user session');
    }

    try {
      // 3. Create user profile (store invitation code as pending)
      // Database trigger will automatically handle invitation code update
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: authData.user.id,
          phone,
          username: 'Coffee Lover',
          is_admin: false,
          pending_invitation_code: invitationCode,
        });

      if (profileError) {
        console.error('User profile creation error:', profileError);
        throw new Error(`Failed to create user profile: ${profileError.message}`);
      }

      // Note: Invitation code will be automatically updated in database trigger
      // No need to manually update invitation code here
    } catch (error) {
      // Throw error if profile creation fails
      console.error('Post-registration operation error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setProfile(null);
  };

  const updateUsername = async (username: string) => {
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('user_profiles')
      .update({ username })
      .eq('id', user.id);

    if (error) throw error;

    setProfile(prev => prev ? { ...prev, username } : null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signOut, updateUsername }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
