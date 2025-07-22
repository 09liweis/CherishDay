import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useDates } from '../../contexts/DateContext';
import { LoginModal } from '@/components/LoginModal';
import { router } from 'expo-router';
import { Calendar, Clock, RotateCcw, TrendingUp, User, LogOut } from '@/constant/icons';
import { getNextOccurrence } from '@/utils/dateUtils';

const ProfileScreen = () => {
  const { user, logout, isLoading } = useAuth();
  const { dates } = useDates();
  const [showLoginModal, setShowLoginModal] = useState(false);

  /**
   * Handles user logout process.
   * Attempts to call the logout function and logs any errors that occur.
   * @async
   */
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('登出失败:', error);
    }
  };

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    router.back();
  };

  // Calculate date statistics
  const getDateStatistics = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    let totalDates = dates.length;
    let yearlyDates = 0;
    let monthlyDates = 0;
    let oneTimeDates = 0;
    let upcomingDates = 0;
    let todayDates = 0;
    let overdueDates = 0;

    dates.forEach(date => {
      // Count by type
      switch (date.type) {
        case 'yearly':
          yearlyDates++;
          break;
        case 'monthly':
          monthlyDates++;
          break;
        case 'one-time':
          oneTimeDates++;
          break;
      }

      // Count by status
      const nextOccurrence = getNextOccurrence(date.date, date.type);
      const targetDate = new Date(nextOccurrence.getFullYear(), nextOccurrence.getMonth(), nextOccurrence.getDate());
      const diffTime = targetDate.getTime() - today.getTime();
      const daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (daysUntil === 0) {
        todayDates++;
      } else if (daysUntil < 0) {
        overdueDates++;
      } else if (daysUntil <= 7) {
        upcomingDates++;
      }
    });

    return {
      totalDates,
      yearlyDates,
      monthlyDates,
      oneTimeDates,
      upcomingDates,
      todayDates,
      overdueDates
    };
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (!user) {
    // 如果用户未登录，显示登录模态框
    return (
      <View style={styles.loginContainer}>
        <View style={styles.loginCard}>
          <View style={styles.loginIconContainer}>
            <User size={48} color="#3b82f6" />
          </View>
          <Text style={styles.loginTitle}>Welcome to CherishDays</Text>
          <Text style={styles.loginSubtitle}>
            Sign in to sync your dates across devices and never lose track of important moments
          </Text>
          <TouchableOpacity 
            style={styles.loginButton} 
            onPress={() => setShowLoginModal(true)}
          >
            <Text style={styles.loginButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
        
        <LoginModal 
          visible={showLoginModal} 
          onClose={() => setShowLoginModal(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      </View>
    );
  }

  const stats = getDateStatistics();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      {/* User Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{user.name?.charAt(0).toUpperCase() || '?'}</Text>
        </View>
        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.userEmail}>{user.email}</Text>
        <Text style={styles.memberSince}>
          Member since {new Date(user.$createdAt).toLocaleDateString('en-US', { 
            month: 'long', 
            year: 'numeric' 
          })}
        </Text>
      </View>

      {/* Statistics Overview */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Your Dates Overview</Text>
        
        {/* Main Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Calendar size={24} color="#3b82f6" />
            </View>
            <Text style={styles.statNumber}>{stats.totalDates}</Text>
            <Text style={styles.statLabel}>Total Dates</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <TrendingUp size={24} color="#10b981" />
            </View>
            <Text style={styles.statNumber}>{stats.upcomingDates}</Text>
            <Text style={styles.statLabel}>Upcoming</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Clock size={24} color="#f59e0b" />
            </View>
            <Text style={styles.statNumber}>{stats.todayDates}</Text>
            <Text style={styles.statLabel}>Today</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Calendar size={24} color="#ef4444" />
            </View>
            <Text style={styles.statNumber}>{stats.overdueDates}</Text>
            <Text style={styles.statLabel}>Overdue</Text>
          </View>
        </View>

        {/* Date Types Breakdown */}
        <View style={styles.breakdownCard}>
          <Text style={styles.breakdownTitle}>Date Types</Text>
          
          <View style={styles.breakdownItem}>
            <View style={styles.breakdownLeft}>
              <RotateCcw size={20} color="#8b5cf6" />
              <Text style={styles.breakdownLabel}>Yearly Events</Text>
            </View>
            <Text style={styles.breakdownValue}>{stats.yearlyDates}</Text>
          </View>

          <View style={styles.breakdownItem}>
            <View style={styles.breakdownLeft}>
              <Calendar size={20} color="#06b6d4" />
              <Text style={styles.breakdownLabel}>Monthly Events</Text>
            </View>
            <Text style={styles.breakdownValue}>{stats.monthlyDates}</Text>
          </View>

          <View style={styles.breakdownItem}>
            <View style={styles.breakdownLeft}>
              <Clock size={20} color="#84cc16" />
              <Text style={styles.breakdownLabel}>One-time Events</Text>
            </View>
            <Text style={styles.breakdownValue}>{stats.oneTimeDates}</Text>
          </View>
        </View>
      </View>

      {/* Account Actions */}
      <View style={styles.actionsSection}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color="#ef4444" />
          <Text style={styles.logoutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Spacing */}
      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loginContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 24,
    justifyContent: 'center',
  },
  loginCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  loginIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 12,
    textAlign: 'center',
  },
  loginSubtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  loginButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    minWidth: 160,
  },
  loginButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0f172a',
  },
  profileCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 24,
    marginTop: 24,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    color: '#ffffff',
    fontWeight: '700',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 8,
  },
  memberSince: {
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '500',
  },
  statsSection: {
    paddingHorizontal: 24,
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    flex: 1,
    minWidth: '45%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
    textAlign: 'center',
  },
  breakdownCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  breakdownTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 16,
  },
  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  breakdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  breakdownLabel: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 12,
    fontWeight: '500',
  },
  breakdownValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  actionsSection: {
    paddingHorizontal: 24,
    marginTop: 32,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: '#fecaca',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  logoutButtonText: {
    color: '#ef4444',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  bottomSpacing: {
    height: 100,
  },
});

export default ProfileScreen;