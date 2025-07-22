import React from 'react';
import { View, Alert, StyleSheet, Platform } from 'react-native';
import { useDates, TrackedDate } from '@/contexts/DateContext';
import { DateCard } from './DateCard';
import { getNextOccurrence } from '@/utils/dateUtils';

interface DateListProps {
  dates?: TrackedDate[];
}

export function DateList({ dates: propDates }: DateListProps) {
  const { dates: contextDates, removeDate } = useDates();
  
  // Use prop dates if provided, otherwise use context dates
  const dates = propDates || contextDates;

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

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
});