import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Calendar, Clock, RotateCcw } from 'lucide-react-native';
import { DateType } from '@/contexts/DateContext';

interface TypeSelectorProps {
  selectedType: DateType;
  onTypeChange: (type: DateType) => void;
}

const typeOptions = [
  {
    value: 'one-time' as DateType,
    label: 'One-time',
    description: 'Deadlines, appointments',
    icon: Clock,
  },
  {
    value: 'monthly' as DateType,
    label: 'Monthly',
    description: 'Bills, recurring payments',
    icon: Calendar,
  },
  {
    value: 'yearly' as DateType,
    label: 'Yearly',
    description: 'Birthdays, anniversaries',
    icon: RotateCcw,
  },
];

export function TypeSelector({ selectedType, onTypeChange }: TypeSelectorProps) {
  return (
    <View style={styles.container}>
      {typeOptions.map((option) => {
        const Icon = option.icon;
        const isSelected = selectedType === option.value;
        
        return (
          <TouchableOpacity
            key={option.value}
            onPress={() => onTypeChange(option.value)}
            style={[
              styles.option,
              isSelected ? styles.selectedOption : styles.unselectedOption
            ]}
          >
            <View style={styles.optionContent}>
              <View style={styles.optionText}>
                <View style={{flexDirection:'row',gap: 4}}>
                  <Icon 
                    size={20} 
                    color={isSelected ? '#3b82f6' : '#64748b'} 
                  />
                  <Text style={[
                    styles.optionLabel,
                    isSelected ? styles.selectedLabel : styles.unselectedLabel
                  ]}>
                    {option.label}
                  </Text>
                </View>
                <Text style={[
                  styles.optionDescription,
                  isSelected ? styles.selectedDescription : styles.unselectedDescription
                ]}>
                  {option.description}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
    flexDirection: 'row'
  },
  option: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
  },
  selectedOption: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  unselectedOption: {
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative'
  },
  optionText: {
    flex: 1,
  },
  optionLabel: {
    fontWeight: '600',
    fontSize: 16,
  },
  selectedLabel: {
    color: '#1d4ed8',
  },
  unselectedLabel: {
    color: '#0f172a',
  },
  optionDescription: {
    fontSize: 14,
    marginTop: 2,
  },
  selectedDescription: {
    color: '#2563eb',
  },
  unselectedDescription: {
    color: '#64748b',
  }
});