import React from 'react';
import { View, Alert, StyleSheet, Platform } from 'react-native';
import { useDates, DateType } from '@/contexts/DateContext';
import { DateCard } from './DateCard';

export function DateList() {
  const { dates, removeDate } = useDates();

  const sortedDates = [...dates].sort((a, b) => {
    const aNext = getNextOccurrence(a.date, a.type);
    const bNext = getNextOccurrence(b.date, b.type);
    
    return aNext.getTime() - bNext.getTime();
  });

  const handleDeleteDate = (id: string, title: string) => {
    if (Platform.OS === 'web') {
      if (confirm(`Are you sure you want to delete "${title}"?`)) {
        removeDate(id);
      }
      return;
    }
    Alert.alert(
      'Delete Date',
      `Are you sure you want to delete "${title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => removeDate(id)
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {sortedDates.map((date) => (
        <DateCard
          key={date.id}
          date={date}
          onDelete={() => handleDeleteDate(date.id, date.title)}
        />
      ))}
    </View>
  );
}

function getNextOccurrence(date: Date, type: DateType): Date {
  const now = new Date();
  const originalDate = new Date(date);
  
  switch (type) {
    case 'yearly':
      let nextYear = new Date(now.getFullYear(), originalDate.getMonth(), originalDate.getDate());
      if (nextYear <= now) {
        nextYear = new Date(now.getFullYear() + 1, originalDate.getMonth(), originalDate.getDate());
      }
      return nextYear;
      
    case 'monthly':
      let nextMonth = new Date(now.getFullYear(), now.getMonth(), originalDate.getDate());
      if (nextMonth <= now) {
        nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, originalDate.getDate());
      }
      return nextMonth;
      
    case 'one-time':
      return originalDate;
      
    default:
      return originalDate;
  }
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
});