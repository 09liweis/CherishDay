import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { useDates } from '@/contexts/DateContext';
import { getDaysUntil, getNextOccurrence } from '@/utils/dateUtils';
import { Calendar, Clock, RotateCcw, Trash2, ArrowLeft, Cake } from '@/constant/icons';
import { DateType } from '@/contexts/DateContext';

export default function DateDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { dates, removeDate } = useDates();
  
  const date = dates.find(d => d.id === id);

  if (!date) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundText}>Date not found</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const nextOccurrence = getNextOccurrence(date.date, date.type);
  const daysUntil = getDaysUntil(nextOccurrence);
  const isOverdue = daysUntil < 0;
  const isToday = daysUntil === 0;
  const isUpcoming = daysUntil > 0 && daysUntil <= 7;

  const getTypeIcon = (type: DateType) => {
    switch (type) {
      case 'yearly':
        return <RotateCcw size={24} color="#3b82f6" />;
      case 'monthly':
        return <Calendar size={24} color="#3b82f6" />;
      case 'one-time':
        return <Clock size={24} color="#3b82f6" />;
    }
  };

  const getStatusText = () => {
    if (isOverdue) return `${Math.abs(daysUntil)} day${Math.abs(daysUntil) === 1 ? '' : 's'} overdue`;
    if (isToday) return 'Today';
    if (daysUntil === 1) return 'Tomorrow';
    if (daysUntil <= 7) return `In ${daysUntil} day${daysUntil === 1 ? '' : 's'}`;
    return `In ${daysUntil} days`;
  };

  const getStatusColor = () => {
    if (isOverdue) return '#ef4444';
    if (isToday) return '#f59e0b';
    if (isUpcoming) return '#3b82f6';
    return '#6b7280';
  };

  const getYearsDuration = (originalDate: Date): string => {
    const now = new Date();
    let years = now.getFullYear() - originalDate.getFullYear();
    
    if (
      now.getMonth() < originalDate.getMonth() || 
      (now.getMonth() === originalDate.getMonth() && now.getDate() < originalDate.getDate())
    ) {
      years--;
    }
    const durations = Math.max(0, years);
    
    return `${durations} year${durations !== 1 ? 's' : ''}`;
  };

  const handleDelete = () => {
    if (Platform.OS === 'web') {
      if (confirm(`Are you sure you want to delete "${date.title}"?`)) {
        removeDate(date.id);
        router.back();
      }
      return;
    }
    
    Alert.alert(
      'Delete Date',
      `Are you sure you want to delete "${date.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            removeDate(date.id);
            router.back();
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <ArrowLeft size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Date Details</Text>
        <TouchableOpacity onPress={handleDelete} style={styles.headerButton}>
          <Trash2 size={24} color="#ef4444" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Main Card */}
        <View style={styles.mainCard}>
          <View style={styles.titleSection}>
            <Text style={styles.title}>{date.title}</Text>
            <View style={styles.typeRow}>
              {getTypeIcon(date.type)}
              <Text style={styles.typeText}>
                {date.type.charAt(0).toUpperCase() + date.type.slice(1).replace('-', ' ')}
              </Text>
            </View>
          </View>

          <View style={styles.statusSection}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor() + '20' }]}>
              <Text style={[styles.statusText, { color: getStatusColor() }]}>
                {getStatusText()}
              </Text>
            </View>
          </View>
        </View>

        {/* Date Information */}
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Date Information</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Original Date</Text>
            <Text style={styles.infoValue}>
              {new Date(date.date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Next Occurrence</Text>
            <Text style={styles.infoValue}>
              {nextOccurrence.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Days Until</Text>
            <Text style={[styles.infoValue, { color: getStatusColor(), fontWeight: '600' }]}>
              {getStatusText()}
            </Text>
          </View>

          {date.type === 'yearly' && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Duration</Text>
              <View style={styles.durationContainer}>
                <Cake size={16} color="#6b7280" />
                <Text style={styles.infoValue}>
                  {getYearsDuration(new Date(date.date))}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Recurrence Information */}
        {date.type !== 'one-time' && (
          <View style={styles.infoCard}>
            <Text style={styles.sectionTitle}>Recurrence</Text>
            
            <View style={styles.recurrenceInfo}>
              {getTypeIcon(date.type)}
              <View style={styles.recurrenceText}>
                <Text style={styles.recurrenceTitle}>
                  {date.type === 'yearly' ? 'Annual Recurrence' : 'Monthly Recurrence'}
                </Text>
                <Text style={styles.recurrenceDescription}>
                  {date.type === 'yearly' 
                    ? 'This date repeats every year on the same day'
                    : 'This date repeats every month on the same day'
                  }
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  mainCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  titleSection: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0f172a',
    lineHeight: 36,
    marginBottom: 12,
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeText: {
    fontSize: 16,
    color: '#3b82f6',
    marginLeft: 8,
    fontWeight: '600',
  },
  statusSection: {
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    minWidth: 120,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#0f172a',
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 2,
  },
  recurrenceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#eff6ff',
    borderRadius: 12,
  },
  recurrenceText: {
    marginLeft: 12,
    flex: 1,
  },
  recurrenceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1d4ed8',
    marginBottom: 4,
  },
  recurrenceDescription: {
    fontSize: 14,
    color: '#3b82f6',
    lineHeight: 20,
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  notFoundText: {
    fontSize: 18,
    color: '#64748b',
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
});