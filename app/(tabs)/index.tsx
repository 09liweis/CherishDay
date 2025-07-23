import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView, 
  StyleSheet, 
  ActivityIndicator, 
  RefreshControl,
  Alert,
  Dimensions
} from 'react-native';
import { Calendar, Plus, AlertCircle, LayoutGrid, List } from '@/constant/icons';
import { useDates, DateType } from '@/contexts/DateContext';
import { DateList } from '@/components/DateList';
import { AddDateModal } from '@/components/AddDateModal';
import { APP_NAME } from '@/constant/text';

const { width } = Dimensions.get('window');

interface FilterOption {
  value: DateType | 'all';
  label: string;
}

const filterOptions: FilterOption[] = [
  { value: 'all', label: 'All' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'one-time', label: 'One-time' },
];

export default function HomeScreen() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<DateType | 'all'>('all');
  const [isGridView, setIsGridView] = useState(false);
  const { dates, isLoading, error, refreshDates } = useDates();
  
  // Filter dates based on selected filter
  const filteredDates = selectedFilter === 'all' 
    ? dates 
    : dates.filter(date => date.type === selectedFilter);
  
  const onRefresh = async () => {
    setRefreshing(true);
    await refreshDates();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerText}>
              <Text style={styles.title}>{APP_NAME}</Text>
              <Text style={styles.subtitle}>
                {filteredDates.length} of {dates.length} {dates.length === 1 ? 'date' : 'dates'} shown
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setIsGridView(!isGridView)}
              style={styles.viewToggle}
            >
              {isGridView ? (
                <List size={24} color="#64748b" />
              ) : (
                <LayoutGrid size={24} color="#64748b" />
              )}
            </TouchableOpacity>
          </View>
          
          {/* Filter Tabs */}
          <View style={styles.filterContainer}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterScrollContent}
            >
              {filterOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => setSelectedFilter(option.value)}
                  style={[
                    styles.filterTab,
                    selectedFilter === option.value ? styles.filterTabActive : styles.filterTabInactive
                  ]}
                >
                  <Text style={[
                    styles.filterTabText,
                    selectedFilter === option.value ? styles.filterTabTextActive : styles.filterTabTextInactive
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* Content */}
        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#3b82f6']}
              tintColor="#3b82f6"
            />
          }
        >
          {/* 错误提示 */}
          {error && (
            <View style={styles.errorContainer}>
              <AlertCircle size={24} color="#ef4444" />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity 
                style={styles.retryButton}
                onPress={refreshDates}
              >
                <Text style={styles.retryButtonText}>重试</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {/* 加载指示器 */}
          {isLoading && !refreshing ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3b82f6" />
              <Text style={styles.loadingText}>加载中...</Text>
            </View>
          ) : dates.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Calendar size={32} color="#64748b" />
              </View>
              <Text style={styles.emptyTitle}>No dates yet</Text>
              <Text style={styles.emptyDescription}>
                Start tracking your important dates by adding your first one
              </Text>
              <TouchableOpacity
                onPress={() => setIsModalVisible(true)}
                style={styles.emptyButton}
              >
                <Text style={styles.emptyButtonText}>Add Your First Date</Text>
              </TouchableOpacity>
            </View>
          ) : filteredDates.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Calendar size={32} color="#64748b" />
              </View>
              <Text style={styles.emptyTitle}>No {selectedFilter} dates</Text>
              <Text style={styles.emptyDescription}>
                No dates match the selected filter. Try selecting a different filter or add a new date.
              </Text>
            </View>
          ) : (
            <DateList dates={filteredDates} isGridView={isGridView} />
          )}
        </ScrollView>

        {/* Add Date Modal */}
        <AddDateModal
          visible={isModalVisible}
          onClose={() => setIsModalVisible(false)}
        />

        {/* Floating Add Button */}
        <TouchableOpacity
          onPress={() => setIsModalVisible(true)}
          style={styles.floatingAddButton}
        >
          <Plus size={24} color="white" strokeWidth={2} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748b',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fee2e2',
    borderRadius: 8,
    padding: 16,
    margin: 16,
  },
  errorText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#b91c1c',
  },
  retryButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginLeft: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  viewToggle: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: '#f8fafc',
    marginLeft: 16,
  },
  filterContainer: {
    marginTop: 16,
  },
  filterScrollContent: {
    paddingHorizontal: 4,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 4,
    minWidth: 60,
    alignItems: 'center',
  },
  filterTabActive: {
    backgroundColor: '#3b82f6',
  },
  filterTabInactive: {
    backgroundColor: '#f1f5f9',
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  filterTabTextActive: {
    color: '#ffffff',
  },
  filterTabTextInactive: {
    color: '#64748b',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  floatingAddButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#3b82f6',
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1000,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyIcon: {
    backgroundColor: '#f1f5f9',
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 8,
  },
  emptyDescription: {
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  emptyButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
});