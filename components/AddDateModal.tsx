import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
  Alert
} from 'react-native';
import { X, AlertCircle } from 'lucide-react-native';
import { useDates, DateType } from '@/contexts/DateContext';
import { DatePicker } from './DatePicker';
import { TypeSelector } from './TypeSelector';

interface AddDateModalProps {
  visible: boolean;
  onClose: () => void;
}

export function AddDateModal({ visible, onClose }: AddDateModalProps) {
  const { addDate, isLoading, error } = useDates();
  const [title, setTitle] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [type, setType] = useState<DateType>('one-time');
  const [errors, setErrors] = useState<{ title?: string; date?: string }>({});

  const resetForm = () => {
    setTitle('');
    setSelectedDate('');
    setType('one-time');
    setErrors({});
  };

  const validateForm = () => {
    const newErrors: { title?: string; date?: string } = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await addDate({
        title: title.trim(),
        date: selectedDate,
        type,
      });
      
      resetForm();
      onClose();
    } catch (err) {
      // 错误已经在 DateContext 中处理，这里不需要额外处理
      console.error('Failed to add date:', err);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
              <View style={styles.modal}>
                {/* Header */}
                <View style={styles.header}>
                  <Text style={styles.headerTitle}>Add New Date</Text>
                  <TouchableOpacity
                    onPress={handleClose}
                    style={styles.closeButton}
                  >
                    <X size={20} color="#64748b" />
                  </TouchableOpacity>
                </View>

                {/* Error Message */}
                {error && (
                  <View style={styles.errorContainer}>
                    <AlertCircle size={20} color="#b91c1c" />
                    <Text style={styles.errorMessage}>{error}</Text>
                  </View>
                )}
                
                {/* Form Fields */}
                <View style={styles.form}>
                  {/* Title Input */}
                  <View style={styles.field}>
                    <Text style={styles.label}>
                      Title *
                    </Text>
                    <TextInput
                      value={title}
                      onChangeText={(text) => {
                        setTitle(text);
                        if (errors.title) {
                          setErrors(prev => ({ ...prev, title: undefined }));
                        }
                      }}
                      placeholder="Enter date title"
                      style={[
                        styles.textInput,
                        errors.title ? styles.textInputError : null
                      ]}
                      placeholderTextColor="#9ca3af"
                    />
                    {errors.title && (
                      <Text style={styles.errorText}>{errors.title}</Text>
                    )}
                  </View>

                  {/* Date Picker */}
                  <View style={styles.field}>
                    <Text style={styles.label}>
                      Date *
                    </Text>
                    <DatePicker
                      date={selectedDate}
                      onDateChange={setSelectedDate}
                    />
                  </View>

                  {/* Type Selector */}
                  <View style={styles.field}>
                    <Text style={styles.label}>
                      Type *
                    </Text>
                    <TypeSelector
                      selectedType={type}
                      onTypeChange={setType}
                    />
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actions}>
                  <TouchableOpacity
                    onPress={handleClose}
                    style={styles.cancelButton}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleSave}
                    style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <Text style={styles.saveButtonText}>Save Date</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modal: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
  form: {
    marginBottom: 32,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#0f172a',
    backgroundColor: '#ffffff',
  },
  textInputError: {
    borderColor: '#fca5a5',
    backgroundColor: '#fef2f2',
  },
  errorText: {
    fontSize: 14,
    color: '#dc2626',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
  },
  cancelButtonText: {
    textAlign: 'center',
    fontWeight: '600',
    color: '#374151',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#3b82f6',
  },
  saveButtonText: {
    textAlign: 'center',
    fontWeight: '600',
    color: '#ffffff',
  },
  saveButtonDisabled: {
    backgroundColor: '#93c5fd',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorMessage: {
    color: '#b91c1c',
    marginLeft: 8,
    fontSize: 14,
    flex: 1,
  },
});