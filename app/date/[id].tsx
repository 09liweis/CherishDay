import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Platform, Dimensions } from 'react-native';
import Animated, { 
  FadeInDown, 
  FadeInUp, 
  FadeIn,
  SlideInLeft,
  SlideInRight,
  BounceIn,
  ZoomIn,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  runOnJS
} from 'react-native-reanimated';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { useDates } from '@/contexts/DateContext';
import { formatDate, getDaysUntil, getNextOccurrence, getYearsDuration } from '@/utils/dateUtils';
import { Calendar, Clock, RotateCcw, Trash2, ArrowLeft, Cake } from '@/constant/icons';
import { DateType } from '@/types/date';

const { width } = Dimensions.get('window');

// Animated components
const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

export default function DateDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { dates, removeDate } = useDates();
  
  const date = dates.find(d => d.id === id);

  // Animation values
  const headerScale = useSharedValue(0.9);
  const deleteButtonScale = useSharedValue(1);
  const countdownPulse = useSharedValue(1);

  // Initialize animations
  React.useEffect(() => {
    headerScale.value = withSpring(1, { damping: 15, stiffness: 100 });
    
    // Pulse animation for countdown circle
    const startPulse = () => {
      countdownPulse.value = withSequence(
        withTiming(1.05, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      );
    };
    
    const interval = setInterval(startPulse, 2000);
    return () => clearInterval(interval);
  }, []);

  // Header animation styles
  const headerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: headerScale.value }],
  }));

  // Delete button animation styles
  const deleteButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: deleteButtonScale.value }],
  }));

  // Countdown pulse animation styles
  const countdownAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: countdownPulse.value }],
  }));

  if (!date) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <Animated.View 
          style={styles.notFoundContainer}
          entering={FadeIn.duration(600)}
        >
          <Text style={styles.notFoundText}>Date not found</Text>
          <AnimatedTouchableOpacity 
            onPress={() => router.back()} 
            style={styles.backButton}
            entering={BounceIn.delay(300)}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </AnimatedTouchableOpacity>
        </Animated.View>
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

  // Handle delete with animation
  const handleDelete = () => {
    deleteButtonScale.value = withSequence(
      withTiming(0.8, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );
    
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
      <Animated.View 
        style={[styles.header, headerAnimatedStyle]}
        entering={SlideInLeft.duration(500)}
      >
        <AnimatedTouchableOpacity 
          onPress={() => router.back()} 
          style={styles.headerButton}
          entering={FadeIn.delay(200)}
        >
          <ArrowLeft size={24} color="#0f172a" />
        </AnimatedTouchableOpacity>
        <Animated.Text 
          style={styles.headerTitle}
          entering={FadeIn.delay(300)}
        >
          Date Details
        </Animated.Text>
        <AnimatedTouchableOpacity 
          onPress={handleDelete} 
          style={[styles.headerButton, deleteButtonAnimatedStyle]}
          entering={FadeIn.delay(400)}
        >
          <Trash2 size={24} color="#ef4444" />
        </AnimatedTouchableOpacity>
      </Animated.View>

      <AnimatedScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        entering={FadeInUp.delay(300).duration(600)}
      >
        {/* Hero Section */}
        <Animated.View 
          style={styles.heroSection}
          entering={FadeInDown.delay(400).duration(800)}
        >
          <Animated.View 
            style={styles.heroBackground}
            entering={SlideInRight.delay(500).duration(600)}
          >
            <View style={styles.heroContent}>
              <Animated.Text 
                style={styles.heroTitle}
                entering={FadeIn.delay(600).duration(500)}
              >
                {date.title}
              </Animated.Text>
              <Animated.View 
                style={styles.heroDateContainer}
                entering={FadeIn.delay(700).duration(500)}
              >
                <Animated.Text 
                  style={styles.heroDate}
                  entering={FadeIn.delay(800).duration(400)}
                >
                  {formatDate(nextOccurrence)}
                </Animated.Text>
                <Animated.View 
                  style={styles.heroTypeTag}
                  entering={BounceIn.delay(900)}
                >
                  {getTypeIcon(date.type)}
                  <Animated.Text 
                    style={styles.heroTypeText}
                    entering={FadeIn.delay(1000)}
                  >
                    {date.type.charAt(0).toUpperCase() + date.type.slice(1).replace('-', ' ')}
                  </Animated.Text>
                </Animated.View>
              </Animated.View>
            </View>
          </Animated.View>
          
          {/* Countdown Circle */}
          <Animated.View 
            style={styles.countdownContainer}
            entering={ZoomIn.delay(800).duration(600)}
          >
            <Animated.View 
              style={[styles.countdownCircle, { borderColor: getStatusColor() }, countdownAnimatedStyle]}
            >
              <Animated.Text 
                style={[styles.countdownNumber, { color: getStatusColor() }]}
                entering={BounceIn.delay(1000)}
              >
                {Math.abs(daysUntil)}
              </Animated.Text>
              <Animated.Text 
                style={[styles.countdownLabel, { color: getStatusColor() }]}
                entering={FadeIn.delay(1100)}
              >
                {isOverdue ? 'OVERDUE' : isToday ? 'TODAY' : 'DAYS'}
              </Animated.Text>
            </Animated.View>
            <Animated.Text 
              style={[styles.countdownStatus, { color: getStatusColor() }]}
              entering={FadeIn.delay(1200)}
            >
              {getStatusText()}
            </Animated.Text>
          </Animated.View>
        </Animated.View>

        {/* Info Cards Grid */}
        <Animated.View 
          style={styles.infoGrid}
          entering={FadeInUp.delay(600).duration(600)}
        >
          <Animated.View 
            style={styles.infoCard}
            entering={SlideInLeft.delay(700).duration(500)}
          >
            <Animated.View 
              style={styles.infoCardHeader}
              entering={FadeIn.delay(800)}
            >
              <Calendar size={20} color="#3b82f6" />
              <Animated.Text 
                style={styles.infoCardTitle}
                entering={FadeIn.delay(850)}
              >
                Original Date
              </Animated.Text>
            </Animated.View>
            <Animated.Text 
              style={styles.infoCardValue}
              entering={FadeIn.delay(900)}
            >
              {formatDate(new Date(date.date))}
            </Animated.Text>
          </Animated.View>
          
          <Animated.View 
            style={styles.infoCard}
            entering={SlideInRight.delay(750).duration(500)}
          >
            <Animated.View 
              style={styles.infoCardHeader}
              entering={FadeIn.delay(850)}
            >
              <Clock size={20} color="#10b981" />
              <Animated.Text 
                style={styles.infoCardTitle}
                entering={FadeIn.delay(900)}
              >
                Next Event
              </Animated.Text>
            </Animated.View>
            <Animated.Text 
              style={styles.infoCardValue}
              entering={FadeIn.delay(950)}
            >
              {formatDate(nextOccurrence)}
            </Animated.Text>
          </Animated.View>
          
          {date.type === 'yearly' && (
            <Animated.View 
              style={styles.infoCard}
              entering={SlideInLeft.delay(800).duration(500)}
            >
              <Animated.View 
                style={styles.infoCardHeader}
                entering={FadeIn.delay(900)}
              >
                <Cake size={20} color="#f59e0b" />
                <Animated.Text 
                  style={styles.infoCardTitle}
                  entering={FadeIn.delay(950)}
                >
                  Duration
                </Animated.Text>
              </Animated.View>
              <Animated.Text 
                style={styles.infoCardValue}
                entering={FadeIn.delay(1000)}
              >
                {getYearsDuration(new Date(date.date))}
              </Animated.Text>
            </Animated.View>
          )}
          
          <Animated.View 
            style={styles.infoCard}
            entering={SlideInRight.delay(850).duration(500)}
          >
            <Animated.View 
              style={styles.infoCardHeader}
              entering={FadeIn.delay(950)}
            >
              <RotateCcw size={20} color="#8b5cf6" />
              <Animated.Text 
                style={styles.infoCardTitle}
                entering={FadeIn.delay(1000)}
              >
                Recurrence
              </Animated.Text>
            </Animated.View>
            <Animated.Text 
              style={styles.infoCardValue}
              entering={FadeIn.delay(1050)}
            >
              {date.type === 'yearly' ? 'Annual' : date.type === 'monthly' ? 'Monthly' : 'One-time'}
            </Animated.Text>
          </Animated.View>
        </Animated.View>

        {/* Timeline Section */}
        {date.type !== 'one-time' && (
          <Animated.View 
            style={styles.timelineSection}
            entering={FadeInUp.delay(900).duration(600)}
          >
            <Animated.Text 
              style={styles.sectionTitle}
              entering={SlideInLeft.delay(1000).duration(400)}
            >
              Timeline
            </Animated.Text>
            <Animated.View 
              style={styles.timelineCard}
              entering={FadeIn.delay(1100).duration(500)}
            >
              <Animated.View 
                style={styles.timelineItem}
                entering={SlideInLeft.delay(1200).duration(400)}
              >
                <Animated.View 
                  style={styles.timelineDot}
                  entering={ZoomIn.delay(1300)}
                />
                <Animated.View 
                  style={styles.timelineContent}
                  entering={FadeIn.delay(1350)}
                >
                  <Text style={styles.timelineTitle}>Original Event</Text>
                  <Text style={styles.timelineDate}>{formatDate(new Date(date.date))}</Text>
                </Animated.View>
              </Animated.View>
              
              <Animated.View 
                style={styles.timelineLine}
                entering={FadeIn.delay(1400).duration(300)}
              />
              
              <Animated.View 
                style={styles.timelineItem}
                entering={SlideInLeft.delay(1450).duration(400)}
              >
                <Animated.View 
                  style={[styles.timelineDot, styles.timelineDotActive]}
                  entering={BounceIn.delay(1500)}
                />
                <Animated.View 
                  style={styles.timelineContent}
                  entering={FadeIn.delay(1550)}
                >
                  <Text style={styles.timelineTitle}>Next Occurrence</Text>
                  <Text style={styles.timelineDate}>{formatDate(nextOccurrence)}</Text>
                </Animated.View>
              </Animated.View>
            </Animated.View>
          </Animated.View>
        )}

        {/* Statistics Section */}
        {date.type === 'yearly' && (
          <Animated.View 
            style={styles.statsSection}
            entering={FadeInUp.delay(1000).duration(600)}
          >
            <Animated.Text 
              style={styles.sectionTitle}
              entering={SlideInLeft.delay(1100).duration(400)}
            >
              Statistics
            </Animated.Text>
            <Animated.View 
              style={styles.statsCard}
              entering={FadeIn.delay(1200).duration(500)}
            >
              <Animated.View 
                style={styles.infoRow}
                entering={SlideInLeft.delay(1300).duration(400)}
              >
                <Animated.Text 
                  style={styles.statsLabel}
                  entering={FadeIn.delay(1350)}
                >
                  Years Celebrated
                </Animated.Text>
                <Animated.Text 
                  style={styles.statsValue}
                  entering={BounceIn.delay(1400)}
                >
                  {getYearsDuration(new Date(date.date))}
                </Animated.Text>
              </Animated.View>
              <Animated.View 
                style={styles.infoRow}
                entering={SlideInLeft.delay(1350).duration(400)}
              >
                <Animated.Text 
                  style={styles.statsLabel}
                  entering={FadeIn.delay(1400)}
                >
                  Days Since First
                </Animated.Text>
                <Animated.Text 
                  style={styles.statsValue}
                  entering={BounceIn.delay(1450)}
                >
                  {Math.floor((new Date().getTime() - new Date(date.date).getTime()) / (1000 * 60 * 60 * 24))}
                </Animated.Text>
              </Animated.View>
            </Animated.View>
          </Animated.View>
        )}
        
        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </AnimatedScrollView>
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