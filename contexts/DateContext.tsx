import React, { createContext, useContext, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';
import { Databases, ID, Query } from 'appwrite';
import { client } from '../constant/appwrite';
import { useAuth } from './AuthContext';
import NetInfo from '@react-native-community/netinfo';

// Appwrite 数据库配置
const databases = new Databases(client);
const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID; // 替换为你的数据库 ID
const COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_ID; // 替换为你的集合 ID

export type DateType = 'yearly' | 'monthly' | 'one-time';

export interface TrackedDate {
  id: string;
  title: string;
  date: string;
  type: DateType;
}

interface DateContextType {
  dates: TrackedDate[];
  addDate: (date: Omit<TrackedDate, 'id'>) => void;
  removeDate: (id: string) => void;
  isLoading: boolean;
  error: string | null;
  refreshDates: () => Promise<void>;
  isOffline: boolean;
}

const STORAGE_KEY = '@date_tracker_dates';

const DateContext = createContext<DateContextType | undefined>(undefined);

export function DateProvider({ children }: { children: ReactNode }) {
  const [dates, setDates] = useState<TrackedDate[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const { user } = useAuth();

  // 检查网络连接状态
  const checkNetworkConnection = async (): Promise<boolean> => {
    const state = await NetInfo.fetch();
    const isConnected = state.isConnected ?? false;
    setIsOffline(!isConnected);
    return isConnected;
  };

  // 监听网络连接状态
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const isConnected = state.isConnected ?? false;
      setIsOffline(!isConnected);
      
      // 当网络恢复连接时，尝试同步数据
      if (isConnected && user) {
        loadDates();
      }
    });
    
    // 初始检查网络状态
    checkNetworkConnection();
    
    return () => {
      unsubscribe();
    };
  }, [user]);

  // Load dates from storage on app start
  useEffect(() => {
    if (user) {
      loadDates();
    } else {
      // 如果用户未登录，清空日期列表
      setDates([]);
    }
  }, [user]);

  // Save dates to storage whenever dates change
  useEffect(() => {
    if (dates.length > 0) {
      saveDates();
    }
  }, [dates]);

  const loadDates = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    // 检查网络连接状态
    const isConnected = await checkNetworkConnection();
    
    // 如果没有网络连接，直接从本地加载数据
    if (!isConnected) {
      try {
        const storedDates = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedDates) {
          const parsedDates = JSON.parse(storedDates);
          setDates(parsedDates);
          setError('无网络连接，使用本地缓存数据');
        } else {
          setError('无网络连接，且无本地缓存数据');
        }
        setIsLoading(false);
        return;
      } catch (storageError) {
        console.error('Error loading dates from storage:', storageError);
        setError('无网络连接，且无法加载本地数据');
        setIsLoading(false);
        return;
      }
    }
    
    try {
      // 从 Appwrite 数据库加载数据
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID,
        [Query.equal('userId', user.$id)]
      );
      
      if (response.documents.length > 0) {
        const appwriteDates = response.documents.map(doc => ({
          id: doc.$id,
          title: doc.title,
          date: doc.date,
          type: doc.type as DateType,
        }));
        setDates(appwriteDates);
        
        // 同步到 AsyncStorage 作为备份
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(appwriteDates));
      } else {
        // 如果 Appwrite 中没有数据，尝试从 AsyncStorage 加载
        const storedDates = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedDates) {
          const parsedDates = JSON.parse(storedDates);
          setDates(parsedDates);
          
          // 不再将 AsyncStorage 中的数据同步到 Appwrite
          // 这样确保只有 Appwrite -> 本地 的同步，而不是双向同步
        }
      }
    } catch (error) {
      console.error('Failed to load dates from Appwrite', error);
      setError('从云端加载日期数据失败');
      
      // 如果 Appwrite 加载失败，尝试从 AsyncStorage 加载
      try {
        const storedDates = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedDates) {
          const parsedDates = JSON.parse(storedDates);
          setDates(parsedDates);
          setError('使用本地缓存数据，部分功能可能受限');
        }
      } catch (storageError) {
        console.error('Error loading dates from storage:', storageError);
        setError('加载日期数据失败，请重试');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // 添加手动刷新函数
  const refreshDates = async () => {
    await loadDates();
  };
  
  // 辅助函数：将日期添加到 Appwrite
  const addDateToAppwrite = async (date: TrackedDate) => {
    if (!user) return;
    
    try {
      await databases.createDocument(
        DATABASE_ID,
        COLLECTION_ID,
        ID.unique(),
        {
          userId: user.$id,
          title: date.title,
          date: date.date,
          type: date.type,
        }
      );
    } catch (error) {
      console.error('Failed to add date to Appwrite', error);
    }
  };

  const saveDates = async () => {
    if (!user) return;
    
    try {
      // 只保存到 AsyncStorage，不同步到 Appwrite
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(dates));
      
      // 不再执行将本地数据同步到 Appwrite 的操作
      // 这样确保只有 Appwrite -> 本地 的同步，而不是双向同步
    } catch (error) {
      console.error('Error saving dates to storage:', error);
    }
  };

  const addDate = async (dateData: Omit<TrackedDate, 'id'>) => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    // 检查网络连接状态
    const isConnected = await checkNetworkConnection();
    
    // 创建一个唯一ID
    const uniqueId = isConnected ? ID.unique() : Math.random().toString(36).substr(2, 9);
    
    // 创建新的日期对象
    const newDate: TrackedDate = {
      ...dateData,
      id: uniqueId,
    };
    
    // 如果没有网络连接，直接添加到本地状态
    if (!isConnected) {
      setDates(prevDates => [...prevDates, newDate]);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([...dates, newDate]));
      setError('无网络连接，日期已保存到本地');
      setIsLoading(false);
      return;
    }
    
    try {
      // 添加到 Appwrite 数据库
      await databases.createDocument(
        DATABASE_ID,
        COLLECTION_ID,
        uniqueId,
        {
          userId: user.$id,
          title: newDate.title,
          date: newDate.date,
          type: newDate.type,
        }
      );
      
      // 更新本地状态
      setDates(prevDates => [...prevDates, newDate]);
      
    } catch (error) {
      console.error('Failed to add date to Appwrite', error);
      setError('添加日期到云端失败，已保存到本地');
      
      // 如果 Appwrite 添加失败，仅添加到本地状态
      const fallbackId = Math.random().toString(36).substr(2, 9);
      const fallbackDate: TrackedDate = {
        ...dateData,
        id: fallbackId,
      };
      setDates(prevDates => [...prevDates, fallbackDate]);
    } finally {
      setIsLoading(false);
    }
  };

  const removeDate = async (id: string) => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    // 检查网络连接状态
    const isConnected = await checkNetworkConnection();
    
    // 更新本地状态
    setDates(prevDates => prevDates.filter(date => date.id !== id));
    
    // 如果没有日期了，清除存储
    if (dates.length <= 1) { // 使用 <= 1 因为当前日期还没有从 dates 中移除
      AsyncStorage.removeItem(STORAGE_KEY);
    } else {
      // 更新 AsyncStorage
      const updatedDates = dates.filter(date => date.id !== id);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedDates));
    }
    
    // 如果没有网络连接，只更新本地状态
    if (!isConnected) {
      setError('无网络连接，日期已从本地删除，将在网络恢复后同步到云端');
      setIsLoading(false);
      return;
    }
    
    try {
      // 从 Appwrite 数据库中删除
      await databases.deleteDocument(
        DATABASE_ID,
        COLLECTION_ID,
        id
      );
    } catch (error) {
      console.error('Failed to remove date from Appwrite', error);
      setError('从云端删除日期失败，但已从本地移除');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DateContext.Provider value={{ dates, addDate, removeDate, isLoading, error, refreshDates, isOffline }}>
      {children}
    </DateContext.Provider>
  );
}

export function useDates() {
  const context = useContext(DateContext);
  if (context === undefined) {
    throw new Error('useDates must be used within a DateProvider');
  }
  return context;
}