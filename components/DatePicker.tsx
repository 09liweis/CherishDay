import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform, StyleSheet } from 'react-native';
import { Calendar, ChevronDown } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

interface DatePickerProps {
  date: string;
  onDateChange: (date: string) => void;
}

export function DatePicker({ date, onDateChange }: DatePickerProps) {
  const [showPicker, setShowPicker] = useState(false);

  const formatDate = (date: string) => {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatInputDate = (date: string) => {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Simple web-compatible date picker
  if (Platform.OS === 'web') {
    return (
      <View>
        <input
          type="date"
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
          style={{
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            padding: '12px 16px',
            fontSize: '16px',
            color: '#0f172a',
            backgroundColor: '#ffffff',
          }}
        />
      </View>
    );
  }

  // For mobile platforms, create a simple date selector
  return (
    <View>
      <TouchableOpacity
        onPress={() => setShowPicker(!showPicker)}
        style={styles.dateButton}
      >
        <View style={styles.dateButtonContent}>
          <Calendar size={20} color="#64748b" />
          <Text style={styles.dateButtonText}>{formatInputDate(date)}</Text>
        </View>
        <ChevronDown size={20} color="#64748b" />
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={new Date(date)}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedDate) => {
            setShowPicker(false);
            if (selectedDate) {
              onDateChange(selectedDate.toISOString());
            }
          }}
          style={styles.picker}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
  },
  dateButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateButtonText: {
    color: '#0f172a',
    marginLeft: 8,
    fontSize: 16,
  },
  picker: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    padding: 16,
  },
  pickerTitle: {
    textAlign: 'center',
    color: '#374151',
    marginBottom: 16,
    fontSize: 16,
  },
  quickOptions: {
    gap: 8,
  },
  quickOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#f8fafc',
  },
  quickOptionText: {
    textAlign: 'center',
    color: '#374151',
    fontSize: 16,
  },
});