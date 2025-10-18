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
      
      // 如果有待处理的邀请码，完成邀请码的使用
      if (data.pending_invitation_code) {
        try {
          await supabase.rpc('complete_invitation_code_usage', {
            user_id: userId
          });
          // 重新加载配置以清除 pending_invitation_code
          const { data: updatedData } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle();
          if (updatedData) {
            setProfile(updatedData);
          }
        } catch (err) {
          console.error('完成邀请码使用失败:', err);
          // 不抛出错误，因为用户已经成功登录了
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
      throw new Error(error.message || '登录失败');
    }

    if (!data.user) {
      throw new Error('登录失败，请检查手机号和密码');
    }
  };

  const signUp = async (phone: string, password: string, invitationCode: string) => {
    // 1. 验证邀请码（作为匿名用户）
    const { data: codeData, error: codeError } = await supabase
      .from('invitation_codes')
      .select('*')
      .eq('code', invitationCode)
      .eq('is_used', false)
      .maybeSingle();

    if (codeError) {
      console.error('邀请码查询错误:', codeError);
      throw new Error('邀请码查询失败');
    }

    if (!codeData) {
      throw new Error('邀请码无效或已被使用');
    }

    // 2. 创建用户账号（这会自动登录用户）
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: `${phone}@coffeeshop.local`,
      password,
    });

    if (authError) {
      console.error('用户创建错误:', authError);
      throw authError;
    }
    
    if (!authData.user) {
      throw new Error('用户创建失败');
    }

    // 确保会话已建立
    if (!authData.session) {
      throw new Error('用户会话创建失败');
    }

    try {
      // 3. 创建用户配置（将邀请码存储为待处理状态）
      // 触发器会自动处理邀请码的更新
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
        console.error('用户配置创建错误:', profileError);
        throw new Error(`用户配置创建失败: ${profileError.message}`);
      }

      // 注意：邀请码会在数据库触发器中自动更新
      // 不再需要在这里手动更新邀请码
    } catch (error) {
      // 如果配置创建失败，抛出错误
      console.error('注册后续操作错误:', error);
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
