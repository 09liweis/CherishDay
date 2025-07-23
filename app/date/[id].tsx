import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Platform, Dimensions } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { useDates } from '@/contexts/DateContext';
import { formatDate, getDaysUntil, getNextOccurrence, getYearsDuration } from '@/utils/dateUtils';
import { Calendar, Clock, RotateCcw, Trash2, ArrowLeft, Cake } from '@/constant/icons';
import { DateType } from '@/contexts/DateContext';

const { width } = Dimensions.get('window');

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
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroBackground}>
            <View style={styles.heroContent}>
              <Text style={styles.heroTitle}>{date.title}</Text>
              <View style={styles.heroDateContainer}>
                <Text style={styles.heroDate}>{formatDate(nextOccurrence)}</Text>
                <View style={styles.heroTypeTag}>
                  {getTypeIcon(date.type)}
                  <Text style={styles.heroTypeText}>
                    {date.type.charAt(0).toUpperCase() + date.type.slice(1).replace('-', ' ')}
                  </Text>
                </View>
              </View>
            </View>
          </View>
          
          {/* Countdown Circle */}
          <View style={styles.countdownContainer}>
            <View style={[styles.countdownCircle, { borderColor: getStatusColor() }]}>
              <Text style={[styles.countdownNumber, { color: getStatusColor() }]}>
                {Math.abs(daysUntil)}
              </Text>
              <Text style={[styles.countdownLabel, { color: getStatusColor() }]}>
                {isOverdue ? 'OVERDUE' : isToday ? 'TODAY' : 'DAYS'}
              </Text>
            </View>
            <Text style={[styles.countdownStatus, { color: getStatusColor() }]}>
              {getStatusText()}
            </Text>
          </View>
        </View>

        {/* Info Cards Grid */}
        <View style={styles.infoGrid}>
          <View style={styles.infoCard}>
            <View style={styles.infoCardHeader}>
              <Calendar size={20} color="#3b82f6" />
              <Text style={styles.infoCardTitle}>Original Date</Text>
            </View>
            <Text style={styles.infoCardValue}>
              {formatDate(new Date(date.date))}
            </Text>
          </View>
          
          <View style={styles.infoCard}>
            <View style={styles.infoCardHeader}>
              <Clock size={20} color="#10b981" />
              <Text style={styles.infoCardTitle}>Next Event</Text>
            </View>
            <Text style={styles.infoCardValue}>
              {formatDate(nextOccurrence)}
            </Text>
          </View>
          
          {date.type === 'yearly' && (
            <View style={styles.infoCard}>
              <View style={styles.infoCardHeader}>
                <Cake size={20} color="#f59e0b" />
                <Text style={styles.infoCardTitle}>Duration</Text>
              </View>
              <Text style={styles.infoCardValue}>
                {getYearsDuration(new Date(date.date))}
              </Text>
            </View>
          )}
          
          <View style={styles.infoCard}>
            <View style={styles.infoCardHeader}>
              <RotateCcw size={20} color="#8b5cf6" />
              <Text style={styles.infoCardTitle}>Recurrence</Text>
            </View>
            <Text style={styles.infoCardValue}>
              {date.type === 'yearly' ? 'Annual' : date.type === 'monthly' ? 'Monthly' : 'One-time'}
            </Text>
          </View>
        </View>

        {/* Timeline Section */}
        {date.type !== 'one-time' && (
          <View style={styles.timelineSection}>
            <Text style={styles.sectionTitle}>Timeline</Text>
            <View style={styles.timelineCard}>
              <View style={styles.timelineItem}>
                <View style={styles.timelineDot} />
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTitle}>Original Event</Text>
                  <Text style={styles.timelineDate}>{formatDate(new Date(date.date))}</Text>
                </View>
              </View>
              
              <View style={styles.timelineLine} />
              
              <View style={styles.timelineItem}>
                <View style={[styles.timelineDot, styles.timelineDotActive]} />
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTitle}>Next Occurrence</Text>
                  <Text style={styles.timelineDate}>{formatDate(nextOccurrence)}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Statistics Section */}
        {date.type === 'yearly' && (
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>Statistics</Text>
            <View style={styles.statsCard}>
            <View style={styles.infoRow}>
                <Text style={styles.statsLabel}>Years Celebrated</Text>
                <Text style={styles.statsValue}>{getYearsDuration(new Date(date.date))}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.statsLabel}>Days Since First</Text>
                <Text style={styles.statsValue}>
                  {Math.floor((new Date().getTime() - new Date(date.date).getTime()) / (1000 * 60 * 60 * 24))}
                </Text>
              </View>
            </View>
          </View>
        )}
        
        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: '#f8fafc',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
  },
  content: {
    flex: 1,
  },
  heroSection: {
    backgroundColor: '#ffffff',
    paddingTop: 32,
    paddingBottom: 40,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  heroBackground: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  heroContent: {
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 40,
  },
  heroDateContainer: {
    alignItems: 'center',
  },
  heroDate: {
    fontSize: 18,
    color: '#64748b',
    marginBottom: 12,
    textAlign: 'center',
  },
  heroTypeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  heroTypeText: {
    fontSize: 14,
    color: '#3b82f6',
    marginLeft: 6,
    fontWeight: '600',
  },
  countdownContainer: {
    alignItems: 'center',
  },
  countdownCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  countdownNumber: {
    fontSize: 36,
    fontWeight: '700',
  },
  countdownLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
  },
  countdownStatus: {
    fontSize: 18,
    fontWeight: '600',
  },
  infoGrid: {
    paddingHorizontal: 24,
    marginBottom: 24,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    flex: 1,
    minWidth: (width - 60) / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginLeft: 8,
  },
  infoCardValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    lineHeight: 22,
  },
  timelineSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 20,
  },
  timelineCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#e2e8f0',
    marginRight: 16,
  },
  timelineDotActive: {
    backgroundColor: '#3b82f6',
  },
  timelineLine: {
    width: 2,
    height: 24,
    backgroundColor: '#e2e8f0',
    marginLeft: 5,
    marginVertical: 8,
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 4,
  },
  timelineDate: {
    fontSize: 14,
    color: '#64748b',
  },
  statsSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  statsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  statsLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  statsValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  bottomSpacing: {
    height: 40,
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
  }
});