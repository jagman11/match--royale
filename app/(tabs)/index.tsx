import React, { useState } from 'react';
import { app, auth, db } from './firebaseconfig';  // Ensure this import happens before using Firebase services

import { Text, View, StyleSheet, Image, ImageBackground } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useFonts } from 'expo-font'; // Import font loading hook
import '../firebaseconfig.js';
import Button from 'components/Button.tsx';
import ImageViewer from '@/components/ImageViewer';
// Register the root component with Expo
import { registerRootComponent } from 'expo';
registerRootComponent(Index);

import { AppRegistry, Platform } from 'react-native';
import App from 'app';



// Correctly import the image
const HomeImage = require('../home-image1.jpg'); // Correct path to the image
const LogoImage = require('../logo.png'); // Correct path to logo image

export default function Index() {
  const [selectedImage, setSelectedImage] = useState<string | undefined>(undefined);

  // Function to pick an image
  const pickImageAsync = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      // Ensure the URI is handled correctly
      const imageUri = result.assets[0].uri;
      setSelectedImage(imageUri);
    }
  };

  // Load the Prince Valiant font
  const [fontsLoaded] = useFonts({
    'PrinceValiant': require('../../assets/fonts/PrinceValiant.ttf'), // Adjust path to font file
  });

  if (!fontsLoaded) {
    return <Text>Loading...</Text>; // Display a loading text until fonts are loaded
  }

  return (
    <ImageBackground source={HomeImage} style={styles.backgroundImage} imageStyle={styles.image}>
      <View style={styles.brightnessOverlay} />
      <View style={styles.overlay}>
        {/* Title with "Match Royale" text */}
        <Text style={styles.title}>Match Royale</Text>

        {/* Semi-transparent logo underneath the title */}
        <Image
          source={LogoImage} // Correct relative path to logo image
          style={styles.logo}
          resizeMode="contain" // Ensures the logo maintains its aspect ratio
        />

        {/* Dynamic Image Picker Example */}
        {selectedImage && (
          <Image source={{ uri: selectedImage }} style={{ width: 200, height: 200 }} />
        )}

        <Button title="Pick an Image" onPress={pickImageAsync} />
      </View>
    </ImageBackground>
  );
}



const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    justifyContent: 'center',
  },
  image: {
    resizeMode: 'cover',
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  brightnessOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Adjust the opacity to make the image brighter
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 48, // Larger font size for the title
    fontFamily: 'PrinceValiant', // Apply the Prince Valiant font
    fontWeight: 'bold', // Optional for extra boldness
    color: '#fff', // White color for the title text
    marginBottom: 20, // Space between title and logo
  },
  logo: {
    width: 200, // Adjust width for logo size
    height: 200, // Adjust height for logo size
    opacity: 0.7, // Semi-transparent logo
    marginTop: 20, // Space between title and logo
  },
});
