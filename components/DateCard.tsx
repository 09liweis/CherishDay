import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Calendar, Clock, RotateCcw, Trash2, Cake } from 'lucide-react-native';
import { TrackedDate, DateType } from '@/contexts/DateContext';

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
        return <RotateCcw size={16} color="#64748b" />;
      case 'monthly':
        return <Calendar size={16} color="#64748b" />;
      case 'one-time':
        return <Clock size={16} color="#64748b" />;
    }
  };

  const getTypeLabel = (type: DateType) => {
    switch (type) {
      case 'yearly':
        return 'Yearly';
      case 'monthly':
        return 'Monthly';
      case 'one-time':
        return 'One-time';
    }
  };

  const getCardStyle = () => {
    if (isOverdue) return [styles.card, styles.overdueCard];
    if (isToday) return [styles.card, styles.todayCard];
    if (isUpcoming) return [styles.card, styles.upcomingCard];
    return [styles.card, styles.defaultCard];
  };

  const getStatusText = () => {
    if (isOverdue) return `${Math.abs(daysUntil)} day${Math.abs(daysUntil) === 1 ? '' : 's'} overdue`;
    if (isToday) return 'Today';
    if (daysUntil === 1) return 'Tomorrow';
    if (daysUntil <= 7) return `In ${daysUntil} day${daysUntil === 1 ? '' : 's'}`;
    return formatDate(nextOccurrence);
  };

  const getStatusTextStyle = () => {
    if (isOverdue) return styles.overdueText;
    if (isToday) return styles.todayText;
    if (isUpcoming) return styles.upcomingText;
    return styles.defaultText;
  };

  return (
    <View style={getCardStyle()}>
      <View style={styles.cardContent}>
        <View style={styles.cardMain}>
          <Text style={styles.title}>
            {date.title}
          </Text>
          
          <View style={styles.typeContainer}>
            {getTypeIcon(date.type)}
            <Text style={styles.typeText}>
              {getTypeLabel(date.type)}
            </Text>
          </View>

          <Text style={[styles.statusText, getStatusTextStyle()]}>
            {getStatusText()}
          </Text>
          
          {date.type === 'yearly' && (
            <View style={styles.durationContainer}>
              <Cake size={14} color="#64748b" />
              <Text style={styles.durationText}>
                {getYearsDuration(new Date(date.date))} year{getYearsDuration(new Date(date.date)) !== 1 ? 's' : ''} duration
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          onPress={onDelete}
          style={styles.deleteButton}
        >
          <Trash2 size={16} color="#64748b" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function getNextOccurrence(date: string, type: DateType): Date {
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

function getDaysUntil(date: Date): number {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  const diffTime = targetDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function getYearsDuration(originalDate: Date): number {
  const now = new Date();
  let years = now.getFullYear() - originalDate.getFullYear();
  
  // 如果今年的纪念日还没到，则减去1年
  if (
    now.getMonth() < originalDate.getMonth() || 
    (now.getMonth() === originalDate.getMonth() && now.getDate() < originalDate.getDate())
  ) {
    years--;
  }
  
  return Math.max(0, years);
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  defaultCard: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
  },
  overdueCard: {
    borderWidth: 1,
    borderColor: '#fecaca',
    backgroundColor: '#fef2f2',
  },
  todayCard: {
    borderWidth: 1,
    borderColor: '#fed7aa',
    backgroundColor: '#fff7ed',
  },
  upcomingCard: {
    borderWidth: 1,
    borderColor: '#fde68a',
    backgroundColor: '#fffbeb',
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardMain: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 4,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeText: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  defaultText: {
    color: '#64748b',
  },
  overdueText: {
    color: '#dc2626',
  },
  todayText: {
    color: '#ea580c',
  },
  upcomingText: {
    color: '#d97706',
  },
  deleteButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  durationText: {
    fontSize: 13,
    color: '#64748b',
    marginLeft: 4,
    fontStyle: 'italic',
  },
});