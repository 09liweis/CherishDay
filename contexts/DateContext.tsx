import React, { createContext, useContext, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';

export type DateType = 'yearly' | 'monthly' | 'one-time';

export interface TrackedDate {
  id: string;
  title: string;
  date: Date;
  type: DateType;
  createdAt: Date;
}

interface DateContextType {
  dates: TrackedDate[];
  addDate: (date: Omit<TrackedDate, 'id' | 'createdAt'>) => void;
  removeDate: (id: string) => void;
}

const STORAGE_KEY = '@date_tracker_dates';

const DateContext = createContext<DateContextType | undefined>(undefined);

export function DateProvider({ children }: { children: ReactNode }) {
  const [dates, setDates] = useState<TrackedDate[]>([]);

  // Load dates from storage on app start
  useEffect(() => {
    loadDates();
  }, []);

  // Save dates to storage whenever dates change
  useEffect(() => {
    if (dates.length > 0) {
      saveDates();
    }
  }, [dates]);

  const loadDates = async () => {
    try {
      const storedDates = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedDates) {
        const parsedDates = JSON.parse(storedDates).map((date: TrackedDate) => ({
          ...date,
          date: new Date(date.date),
          createdAt: new Date(date.createdAt),
        }));
        setDates(parsedDates);
      }
    } catch (error) {
      console.error('Error loading dates from storage:', error);
    }
  };

  const saveDates = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(dates));
    } catch (error) {
      console.error('Error saving dates to storage:', error);
    }
  };

  const addDate = (dateData: Omit<TrackedDate, 'id' | 'createdAt'>) => {
    const newDate: TrackedDate = {
      ...dateData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
    };
    setDates(prevDates => [...prevDates, newDate]);
  };

  const removeDate = (id: string) => {
    setDates(prevDates => prevDates.filter(date => date.id !== id));
    // If no dates left, clear storage
    if (dates.length === 0) {
      AsyncStorage.removeItem(STORAGE_KEY);
    }
  };

  return (
    <DateContext.Provider value={{ dates, addDate, removeDate }}>
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