import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Image, Alert, StyleSheet, ScrollView, ImageBackground, TouchableOpacity, ActivityIndicator } from 'react-native';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import { useFonts } from 'expo-font';
import { auth, db } from '../firebaseconfig.js'; // Correct the import path
import { useRouter } from 'expo-router';
import { RadioButton } from 'react-native-paper'; // Import RadioButton for gender selection

// Import the local background image
import backgroundImg from '../background.jpg';

const ProfileScreen = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({
    name: '',
    bio: '',
    major: '',
    gender: '', // New gender field
    image: '',
    backgroundImage: ''
  });
  const [loading, setLoading] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    'PrinceValiant': require('../../assets/fonts/PrinceValiant.ttf'),
  });

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Fetch user profile from Firestore
        const userRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          setProfile(userDoc.data());
        } else {
          console.log("No such document!");
        }
      } else {
        setUser(null);
        // Navigate to the Login screen if the user is not logged in
        router.push('/Login'); // Adjust based on your app structure
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = () => {
    signOut(auth).then(() => {
      router.push('/Login'); // Adjust based on your app structure
    }).catch((error) => {
      Alert.alert('Error', error.message);
    });
  };

  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const { uri } = result.assets[0];
      setProfile({ ...profile, image: uri });
      // Upload image to Firebase Storage and update Firestore
      const storage = getStorage();
      const storageRef = ref(storage, `profileImages/${user.uid}`);
      const response = await fetch(uri);
      const blob = await response.blob();
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);
      await setDoc(doc(db, "users", user.uid), { ...profile, image: downloadURL });
      setShowButton(false); // Hide the button after uploading a new profile picture
    }
  };

  const handleShowButton = () => {
    setShowButton(true);
    setTimeout(() => {
      setShowButton(false);
    }, 3000); // Hide the button after 2 seconds if not clicked
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      await setDoc(doc(db, "users", user.uid), profile);
      Alert.alert('Profile updated successfully');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground source={profile.backgroundImage ? { uri: profile.backgroundImage } : backgroundImg} style={styles.backgroundImage} resizeMode="cover">
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <TouchableOpacity onPress={handleShowButton}>
            <Image source={{ uri: profile.image || 'https://example.com/fallback.jpg' }} style={styles.profileImage} />
          </TouchableOpacity>
          {showButton && (
            <TouchableOpacity style={styles.imageButton} onPress={handleImagePick}>
              <Text style={{ fontFamily: 'PrinceValiant', color: 'rgba(0,0,0,1)' }}>Pick Profile Image</Text>
            </TouchableOpacity>
          )}
          <Text style={{ fontFamily: 'PrinceValiant', fontSize: 32, fontWeight: 'bold', marginBottom: 10 }}>{profile.name}</Text>
          <Text style={{ fontFamily: 'PrinceValiant', fontSize: 26, fontWeight: 'bold', color: '#333', marginTop: 5 }}>Bio:</Text>
          <Text style={{ fontFamily: 'PrinceValiant', fontSize: 24, color: '#666', textAlign: 'center', marginBottom: 5 }}>{profile.bio}</Text>
          <Text style={{ fontFamily: 'PrinceValiant', fontSize: 26, fontWeight: 'bold', color: '#333', marginTop: 5, marginBottom: 5 }}>Major:</Text>
          <Text style={{ fontFamily: 'PrinceValiant', fontSize: 20, color: '#666', textAlign: 'center', marginBottom: 10 }}>{profile.major}</Text>
          
          {/* Gender Field */}
          <Text style={{ fontFamily: 'PrinceValiant', fontSize: 26, fontWeight: 'bold', color: '#333', marginTop: 5, marginBottom: 5 }}>Gender:</Text>
          <RadioButton.Group onValueChange={value => setProfile({ ...profile, gender: value })} value={profile.gender}>
            <View style={styles.radioButtonWrapper}>
              <Text style={[styles.radioButtonLabel, { fontSize: 18 }]}>Male</Text> {/* Increased font size */}
              <View style={[styles.radioButtonCircle, profile.gender === 'Male' && styles.selectedCircle]}>
                <RadioButton value="Male" />
              </View>
            </View>
            <View style={styles.radioButtonWrapper}>
              <Text style={[styles.radioButtonLabel, { fontSize: 18 }]}>Female</Text> {/* Increased font size */}
              <View style={[styles.radioButtonCircle, profile.gender === 'Female' && styles.selectedCircle]}>
                <RadioButton value="Female" />
              </View>
            </View>
            <View style={styles.radioButtonWrapper}>
              <Text style={[styles.radioButtonLabel, { fontSize: 18 }]}>Non-Binary</Text> {/* Increased font size */}
              <View style={[styles.radioButtonCircle, profile.gender === 'Non-Binary' && styles.selectedCircle]}>
                <RadioButton value="Non-Binary" />
              </View>
            </View>
          </RadioButton.Group>

          <TextInput
            style={[styles.input, { fontFamily: 'PrinceValiant' }]}
            placeholder="Name"
            value={profile.name}
            onChangeText={(text) => setProfile({ ...profile, name: text })}
          />
          <TextInput
            style={[styles.input, { fontFamily: 'PrinceValiant' }]}
            placeholder="Bio"
            value={profile.bio}
            onChangeText={(text) => setProfile({ ...profile, bio: text })}
          />
          <TextInput
            style={[styles.input, { fontFamily: 'PrinceValiant' }]}
            placeholder="Major"
            value={profile.major}
            onChangeText={(text) => setProfile({ ...profile, major: text })}
          />
          <TouchableOpacity style={styles.button} onPress={handleSaveProfile} disabled={loading}>
            <Text style={styles.buttonText}>Save Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleSignOut}>
            <Text style={styles.buttonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  card: {
    width: '90%',
    backgroundColor: 'rgba(230, 230, 250, 0.6)', // Lavender hue with semi-transparency
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 10,
    elevation: 0,
    position: 'relative',
    marginTop: '40',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#fff',
  },
  imageButton: {
    position: 'absolute',
    top: 55, // Adjust based on your layout
    left: '53.5%',
    transform: [{ translateX: -50 }],
    padding: 10,
    borderWidth: 1,
    borderColor: '#fff', // White border
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // Semi-transparent background
    alignItems: 'center',
  },
  input: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#333', // Darker border color
    borderRadius: 5,
    marginBottom: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.1)', // Darker background color with semi-transparency
    color: '#333', // Darker text color
  },
  button: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#fff', // White border
    borderRadius: 5,
    marginBottom: 10,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // Semi-transparent background
  },
  buttonText: {
    color: '#fff', // White text color
    fontWeight: 'bold',
  },
  radioButtonWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    justifyContent: 'flex-start', // Align radio buttons to the left
  },
  radioButtonLabel: {
    fontFamily: 'PrinceValiant',
    marginRight: 10, // Space between text and circle
  },
  radioButtonCircle: {
    borderWidth: 2,
    borderRadius: 50, // Circle shape
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#5C2B8D', // Lavender color outline for all circles
  },
  selectedCircle: {
    backgroundColor: '#5C2B8D', // Fill the circle with the selected color (lavender)
  },
});

export default ProfileScreen;
