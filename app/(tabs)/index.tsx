import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, StyleSheet } from 'react-native';
import { Calendar, Plus } from 'lucide-react-native';
import { useDates } from '@/contexts/DateContext';
import { DateList } from '@/components/DateList';
import { AddDateModal } from '@/components/AddDateModal';

export default function HomeScreen() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { dates } = useDates();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerText}>
              <Text style={styles.title}>My Dates</Text>
              <Text style={styles.subtitle}>
                {dates.length} {dates.length === 1 ? 'date' : 'dates'} tracked
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setIsModalVisible(true)}
              style={styles.addButton}
            >
              <Plus size={24} color="white" strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {dates.length === 0 ? (
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
          ) : (
            <DateList />
          )}
        </ScrollView>

        {/* Add Date Modal */}
        <AddDateModal
          visible={isModalVisible}
          onClose={() => setIsModalVisible(false)}
        />
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
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
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
  addButton: {
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