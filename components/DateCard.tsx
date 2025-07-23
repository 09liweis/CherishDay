import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Calendar, Clock, RotateCcw, Trash2, Cake } from '@/constant/icons';
import { TrackedDate, DateType } from '@/contexts/DateContext';
import { formatDate, getDaysUntil, getNextOccurrence, getYearsDuration } from '@/utils/dateUtils';

interface DateCardProps {
  date: TrackedDate;
  onDelete: () => void;
}

export function DateCard({ date, onDelete }: DateCardProps) {
  const nextOccurrence = getNextOccurrence(date.date, date.type);
  const daysUntil = getDaysUntil(nextOccurrence);
  const isOverdue = daysUntil < 0;
  const isToday = daysUntil === 0;
  const isUpcoming = daysUntil > 0 && daysUntil <= 7;

  const getTypeIcon = (type: DateType) => {
    switch (type) {
      case 'yearly':
        return <RotateCcw size={18} color="#6b7280" />;
      case 'monthly':
        return <Calendar size={18} color="#6b7280" />;
      case 'one-time':
        return <Clock size={18} color="#6b7280" />;
    }
  };

  const getCardStyle = () => {
    if (isOverdue) return [styles.card, styles.overdueCard];
    if (isToday) return [styles.card, styles.todayCard];
    if (isUpcoming) return [styles.card, styles.upcomingCard];
    return styles.card;
  };

  const getStatusText = () => {
    if (isOverdue) return `${Math.abs(daysUntil)} day${Math.abs(daysUntil) === 1 ? '' : 's'} overdue`;
    if (isToday) return 'Today';
    if (daysUntil === 1) return 'Tomorrow';
    if (daysUntil <= 7) return `In ${daysUntil} day${daysUntil === 1 ? '' : 's'}`;
    return formatDate(nextOccurrence);
  };

  const getStatusColor = () => {
    if (isOverdue) return '#ef4444';
    if (isToday) return '#f59e0b';
    if (isUpcoming) return '#3b82f6';
    return '#6b7280';
  };

  const getStatusBadgeStyle = () => {
    if (isOverdue) return [styles.statusBadge, styles.overdueBadge];
    if (isToday) return [styles.statusBadge, styles.todayBadge];
    if (isUpcoming) return [styles.statusBadge, styles.upcomingBadge];
    return [styles.statusBadge, styles.defaultBadge];
  };

  const handleCardPress = () => {
    router.push(`/date/${date.id}`);
  };

  return (
    <TouchableOpacity style={getCardStyle()} onPress={handleCardPress} activeOpacity={0.7}>
      <View style={styles.cardHeader}>
        <View style={styles.titleSection}>
          <Text style={styles.title} numberOfLines={2}>
            {date.title}
          </Text>
          <View style={styles.typeRow}>
            {getTypeIcon(date.type)}
            <Text style={styles.typeText}>
              {date.type.charAt(0).toUpperCase() + date.type.slice(1).replace('-', ' ')}
            </Text>
          </View>
        </View>
        
        <TouchableOpacity
          onPress={onDelete}
          style={styles.deleteButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Trash2 size={18} color="#9ca3af" />
        </TouchableOpacity>
      </View>

      <View style={styles.cardFooter}>
        <View style={getStatusBadgeStyle()}>
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {getStatusText()}
          </Text>
        </View>
        
        {date.type === 'yearly' && (
          <View style={styles.durationBadge}>
            <Cake size={14} color="#6b7280" />
            <Text style={styles.durationText}>
              {getYearsDuration(new Date(date.date))}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  overdueCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
    backgroundColor: '#fefefe',
  },
  todayCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
    backgroundColor: '#fefefe',
  },
  upcomingCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
    backgroundColor: '#fefefe',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  titleSection: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    lineHeight: 24,
    marginBottom: 8,
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 6,
    fontWeight: '500',
  },
  deleteButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flex: 1,
    marginRight: 8,
  },
  defaultBadge: {
    backgroundColor: '#f8fafc',
  },
  overdueBadge: {
    backgroundColor: '#fef2f2',
  },
  todayBadge: {
    backgroundColor: '#fffbeb',
  },
  upcomingBadge: {
    backgroundColor: '#eff6ff',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  durationText: {
    fontSize: 13,
    color: '#6b7280',
    marginLeft: 4,
    fontWeight: '500',
  },
});