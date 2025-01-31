import React, { useState, useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import firebaseServices from './firebaseconfig';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // Load fonts asynchronously using the expo-font package
  const [fontsLoaded] = useFonts({
    'PrinceValiant': require('../assets/fonts/PrinceValiant.ttf'),
  });
  
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(null);  // Track if user is logged in

  // Check the user's login status with Firebase authentication
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), (user) => {
      if (user) {
        setIsUserLoggedIn(true);  // If the user is logged in
      } else {
        setIsUserLoggedIn(false); // If no user is logged in
      }
    });

    return () => unsubscribe();  // Cleanup when the component unmounts
  }, []);

  // Show splash screen until fonts are loaded and user authentication is checked
  useEffect(() => {
    if (fontsLoaded && isUserLoggedIn !== null) {
      SplashScreen.hideAsync();  // Hide splash screen once fonts and authentication are ready
    }
  }, [fontsLoaded, isUserLoggedIn]);

  if (!fontsLoaded || isUserLoggedIn === null) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false, // Hide the header for all screens
      }}
    >
      {/* Conditional rendering based on user login status */}
      {isUserLoggedIn ? (
        // If the user is logged in, show the main app screens
        <>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="Profile" options={{ title: 'Profile' }} />
          <Stack.Screen name="Swipe" options={{ title: 'Swipe' }} />
          <Stack.Screen name="Matches" options={{ title: 'Matches' }} />
          <Stack.Screen name="Chat" options={{ title: 'Chat' }} />
        </>
      ) : (
        // If the user is not logged in, show login or account creation screens
        <>
          <Stack.Screen name="Create Account" options={{ title: 'Create Account' }} />
          <Stack.Screen name="Login" options={{ title: 'Login' }} />
        </>
      )}
    </Stack>
  );
}

// Optional: Add styles to make sure the font is applied in text elements
const styles = StyleSheet.create({
  text: {
    fontFamily: 'PrinceValiant',  // Apply the custom font
    fontSize: 18,
  },
});