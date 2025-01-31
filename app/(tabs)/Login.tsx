import React, { useState, useEffect } from 'react';
import { Text, TextInput, Button, View, Alert, StyleSheet, ImageBackground } from 'react-native';
import { signInWithEmailAndPassword, onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../firebaseconfig.js'; // Correct the import path
import { useRouter } from 'expo-router';
import { useFonts } from 'expo-font'; // Import to load custom fonts

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  // Load the custom "Prince Valiant" font
  const [fontsLoaded] = useFonts({
    'PrinceValiant': require('../../assets/fonts/PrinceValiant.ttf'), // Make sure the path is correct
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Navigate to the Profile screen if the user is logged in
        router.push('/Profile'); // Adjust based on your app structure
      } else {
        setUser(null);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const handleLogin = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Successful login
        const user = userCredential.user;
        console.log('Logged in user:', user);
        // Navigate to the Profile screen after successful login
        router.push('/Profile'); // Adjust based on your app structure
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        // Handle login errors
        Alert.alert("Login Failed", errorMessage);
        console.error('Login error:', errorCode, errorMessage);
      });
  };

  if (!fontsLoaded) {
    return <Text>Loading fonts...</Text>; // Show a loading message until the font is loaded
  }

  return (
    <ImageBackground 
      source={require('../background.jpg')}  // Ensure the image is in the correct path
      style={styles.backgroundImage}
    >
      <View style={styles.container}>
        {user ? (
          <Text style={styles.welcomeText}>Welcome, {user.email}</Text>
        ) : (
          <>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <Button title="Login" onPress={handleLogin} />
          </>
        )}
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    resizeMode: 'cover', // Ensures the image covers the entire background
  },
  container: {
    width: '80%',
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.7)', // Semi-transparent background for the form
    borderRadius: 10, // Optional: Rounded corners for the form container
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    fontFamily: 'PrinceValiant', // Apply the custom font to the welcome text
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
    alignSelf: 'flex-start',
    fontFamily: 'PrinceValiant', // Apply the custom font to the label text
  },
  input: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 15,
    borderRadius: 5,
    backgroundColor: 'white',
  },
});

export default LoginScreen;
