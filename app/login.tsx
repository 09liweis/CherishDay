import React from 'react';
import LoginScreen from '../screens/LoginScreen';
import { Stack } from 'expo-router';

const Login = () => {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <LoginScreen />
    </>
  );
};

export default Login;