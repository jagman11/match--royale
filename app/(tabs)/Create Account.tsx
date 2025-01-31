import React, { useState } from 'react';
import { Text, TextInput, View, Alert, StyleSheet, ImageBackground, TouchableOpacity } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseconfig.js'; // Correct the import path
import { useRouter } from 'expo-router';
import { useFonts } from 'expo-font'; // For loading custom fonts
import Icon from 'react-native-vector-icons/FontAwesome'; // Import the icon library

const CreateAccountScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false); // State for password visibility toggle
  const router = useRouter();

  // Load the Prince Valiant font
  const [fontsLoaded] = useFonts({
    'PrinceValiant': require('../../assets/fonts/PrinceValiant.ttf'), // Update the path to the font file
  });

  if (!fontsLoaded) {
    return <Text>Loading...</Text>; // Return a loading screen while fonts are loading
  }

  // Handle Account Creation
  const handleCreateAccount = () => {
    setLoading(true);

    // Check if the email has the correct domain
    const emailDomain = email.split('@')[1];

    if (emailDomain !== 'callutheran.edu') {
      setLoading(false);
      Alert.alert('Invalid Email', 'Please use your Callutheran email to sign up.');
      return;
    }

    // Firebase create user with email and password
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Account created successfully
        const user = userCredential.user;
        console.log('User created:', user);

        // Display success message
        Alert.alert(
          'Success',
          'Account created successfully',
          [
            {
              text: 'OK',
              onPress: () => {
                // Navigate to the login screen after account creation
                router.push('/Login'); // Adjust navigation according to your app flow
              },
            },
          ],
          { cancelable: false }
        );
      })
      .catch((error) => {
        const errorMessage = error.message;
        setLoading(false);
        Alert.alert('Error', errorMessage); // Show error message if creation fails
        console.error('Create account error:', errorMessage);
      });
  };

  return (
    <ImageBackground
      source={require('../background.jpg')}  // Ensure the path is correct
      style={styles.backgroundImage}
      imageStyle={styles.imageStyle}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Create Account</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="Email"
          placeholderTextColor="#888"
        />
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!passwordVisible}  // Toggle visibility based on the state
            placeholder="Password"
            placeholderTextColor="#888"
          />
          <TouchableOpacity 
            style={styles.eyeIcon} 
            onPress={() => setPasswordVisible(!passwordVisible)}  // Toggle the state when clicked
          >
            <Icon name={passwordVisible ? 'eye-slash' : 'eye'} size={20} color="#888" />
          </TouchableOpacity>
        </View>
        
        {/* Create Account Button inside a semi-transparent box */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.createAccountButton}
            onPress={handleCreateAccount}
            disabled={loading}
          >
            <Text style={styles.createAccountButtonText}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 0.6, // Adjust the form container height to be more compact
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(230, 230, 250, 0.6)',  // Semi-transparent white background for form elements
    borderRadius: 10,  // Rounded corners for the form box
    width: '80%', // Make the form box smaller
    height: '40%', // Adjust the height of the form container to be shorter
  },
  title: {
    fontSize: 26,
    fontFamily: 'PrinceValiant', // Use the custom Prince Valiant font
    marginBottom: 20,
    color: '#333',
  },
  input: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
    borderRadius: 5,
    backgroundColor: 'white',
  },
  passwordContainer: {
    width: '100%',
    flexDirection: 'row',  // Align password input and eye icon horizontally
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eyeIcon: {
    position: 'absolute',
    right: 10,
    top: 9.5,  // Adjust this if needed to center the icon in the middle of the input field
  },
  // Semi-transparent box around the button
  buttonContainer: {
    marginTop: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.0)',  // Transparent background for the button container
    borderRadius: 5,  // Rounded corners for the box
    width: '100%',
    padding: 10,
  },
  createAccountButton: {
    borderWidth: 2,  // White border around the button
    borderColor: '#fff',  // Set border color to white
    backgroundColor: 'transparent',  // Make the background transparent
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    width: '100%',
  },
  createAccountButtonText: {
    color: '#fff', // White text color
    fontWeight: 'bold',
    fontFamily: 'PrinceValiant', // Custom font for button text
  },
  backgroundImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  imageStyle: {
    opacity: 1,  // Increase opacity to make the background image less transparent
    resizeMode: 'cover',  // Ensures the image covers the screen without distortion
  },
});

export default CreateAccountScreen;
