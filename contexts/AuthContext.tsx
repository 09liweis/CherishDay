import React, { createContext, useState, useEffect, useContext } from 'react';
import { appwriteAuth } from '../constant/appwrite';
import { Models } from 'appwrite';

// 定义认证上下文的类型
interface AuthContextType {
  user: Models.User<Models.Preferences> | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
}

// 创建认证上下文
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 认证提供者组件
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 检查用户是否已登录
  useEffect(() => {
    const checkUser = async () => {
      try {
        setIsLoading(true);
        const currentUser = await appwriteAuth.getCurrentUser();
        // 确保currentUser不为null才设置用户
        if (currentUser) {
          setUser(currentUser);
        } else {
          console.log('未获取到用户信息，用户可能未登录');
          setUser(null);
        }
      } catch (err) {
        console.error('检查用户状态失败:', err);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();
  }, []);

  // 登录函数
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await appwriteAuth.login(email, password);
      const currentUser = await appwriteAuth.getCurrentUser();
      // 确保currentUser不为null才设置用户
      if (currentUser) {
        setUser(currentUser);
      } else {
        console.error('登录成功但获取用户信息失败');
        setError('登录成功但获取用户信息失败，请重试');
        setUser(null);
        throw new Error('登录成功但获取用户信息失败');
      }
    } catch (err: any) {
      console.error('登录失败:', err);
      setError(err.message || '登录失败，请检查您的凭据');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // 注册函数
  const register = async (email: string, password: string, name: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await appwriteAuth.register(email, password, name);
      // 注册后需要登录才能获取用户信息
      await appwriteAuth.login(email, password);
      const currentUser = await appwriteAuth.getCurrentUser();
      // 确保currentUser不为null才设置用户
      if (currentUser) {
        setUser(currentUser);
      } else {
        console.error('注册成功但获取用户信息失败');
        setError('注册成功但获取用户信息失败，请尝试重新登录');
        setUser(null);
        throw new Error('注册成功但获取用户信息失败');
      }
    } catch (err: any) {
      console.error('注册失败:', err);
      setError(err.message || '注册失败，请稍后再试');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // 登出函数
  const logout = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await appwriteAuth.logout();
      setUser(null);
    } catch (err: any) {
      console.error('登出失败:', err);
      setError(err.message || '登出失败，请稍后再试');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // 提供认证上下文值
  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 自定义钩子，用于在组件中访问认证上下文
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth 必须在 AuthProvider 内部使用');
  }
  return context;
};