import React from 'react';
import RegisterScreen from '../screens/RegisterScreen';
import { Stack } from 'expo-router';

const Register = () => {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <RegisterScreen />
    </>
  );
};

export default Register;