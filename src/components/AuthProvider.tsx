
import { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log("AuthProvider: 初始化身份验证状态监听器");
    
    // First set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log("Auth state changed:", event, currentSession?.user?.email);
        
        if (currentSession?.user) {
          console.log("用户已登录:", currentSession.user.email);
          console.log("会话过期时间:", new Date(currentSession.expires_at * 1000).toLocaleString());
          console.log("会话访问令牌:", currentSession.access_token ? "已设置" : "未设置");
          console.log("用户角色:", currentSession.user.role);
        } else {
          console.log("用户未登录");
        }
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setIsLoading(false);
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession }, error }) => {
      if (error) {
        console.error("获取会话错误:", error);
      }
      
      console.log("Existing session check:", currentSession?.user?.email);
      
      if (currentSession?.user) {
        console.log("用户已有会话:", currentSession.user.email);
        console.log("会话过期时间:", new Date(currentSession.expires_at * 1000).toLocaleString());
        console.log("会话访问令牌:", currentSession.access_token ? "已设置" : "未设置");
        console.log("用户角色:", currentSession.user.role);
        console.log("用户ID:", currentSession.user.id);
      } else {
        console.log("没有现有会话");
      }
      
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      console.log("AuthProvider: 清理身份验证状态监听器");
      subscription.unsubscribe();
    }
  }, []);

  const signOut = async () => {
    console.log("Signing out user:", user?.email);
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("登出失败:", error);
        throw error;
      }
      console.log("User signed out successfully");
    } catch (error) {
      console.error("登出失败:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
