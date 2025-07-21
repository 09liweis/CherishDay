import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { router } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

interface LoginScreenProps {
  isModal?: boolean;
  onLoginSuccess?: () => void;
}

const LoginScreen = ({ isModal = false, onLoginSuccess }: LoginScreenProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loginWithGoogle, isLoading, error } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('错误', '请填写所有字段');
      return;
    }

    try {
      await login(email, password);
      if (isModal && onLoginSuccess) {
        onLoginSuccess();
      } else {
        router.replace('/(tabs)');
      }
    } catch (err) {
      // 错误已在 AuthContext 中处理
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      if (isModal && onLoginSuccess) {
        onLoginSuccess();
      } else {
        router.replace('/(tabs)');
      }
    } catch (err) {
      // 错误已在 AuthContext 中处理
    }
  };

  const navigateToRegister = () => {
    // router.push(`/register`);
  };

  return (
    <View style={styles.container}>      
      {error && <Text style={styles.errorText}>{error}</Text>}
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={handleLogin}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Login</Text>
        )}
      </TouchableOpacity>
      
      <View style={styles.dividerContainer}>
        <View style={styles.divider} />
        <Text style={styles.dividerText}>或</Text>
        <View style={styles.divider} />
      </View>
      
      <TouchableOpacity 
        style={styles.googleButton} 
        onPress={handleGoogleLogin}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#4285F4" />
        ) : (
          <View style={styles.googleButtonContent}>
            <FontAwesome name="google" size={20} color="#4285F4" />
            <Text style={styles.googleButtonText}>使用Google登录</Text>
          </View>
        )}
      </TouchableOpacity>
      
      <TouchableOpacity onPress={navigateToRegister}>
        <Text style={styles.linkText}>
          还没有账号？点击注册
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 5,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  button: {
    backgroundColor: '#007bff',
    borderRadius: 5,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  dividerText: {
    marginHorizontal: 10,
    color: '#666',
    fontSize: 14,
  },
  googleButton: {
    backgroundColor: '#ffffff',
    borderRadius: 5,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  googleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleButtonText: {
    color: '#757575',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 10,
  },
  linkText: {
    color: '#007bff',
    textAlign: 'center',
    marginTop: 20,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 15,
  },
});

export default LoginScreen;