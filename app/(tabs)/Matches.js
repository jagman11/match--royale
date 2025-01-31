import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseconfig';
import { useNavigation } from '@react-navigation/native';
import { ImageBackground, SafeAreaView } from 'react-native';

const Matches = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true);
      try {
        const currentUserId = auth.currentUser.uid;
        const userDoc = await getDoc(doc(db, 'users', currentUserId));
        const matchedUsers = userDoc.data().matchedUsers || [];

        const matchesPromises = matchedUsers.map(async (userId) => {
          const userDoc = await getDoc(doc(db, 'users', userId));
          return { id: userDoc.id, ...userDoc.data() };
        });

        const matchesList = await Promise.all(matchesPromises);
        setMatches(matchesList);
      } catch (error) {
        console.error('Error fetching matches:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => navigation.navigate('ChatScreen', { userId1: auth.currentUser.uid, userId2: item.id })}>
      <View style={styles.matchCard}>
        {/* Profile Image */}
        <Image source={{ uri: item.image || 'https://example.com/fallback.jpg' }} style={styles.profileImage} />
        
        {/* Profile Info Section */}
        <View style={styles.profileInfo}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.infoText}>• Major: {item.major}</Text>
          <Text style={styles.infoText}>• Bio: {item.bio || 'No bio available'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Set background image using ImageBackground */}
      <ImageBackground 
        source={require('..//background.jpg')} // Path to background image
        style={styles.backgroundImage} // Style the background image
      >
        {/* Add a semi-transparent overlay */}
        <View style={styles.overlay}>
          {/* Matches Section (Profile Rectangles) */}
          <View style={styles.matchesContainer}>
            {loading ? (
              <Text style={styles.loadingText}>Loading matches...</Text>
            ) : matches.length > 0 ? (
              <FlatList
                data={matches}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false} // Hides the vertical scroll bar
                contentContainerStyle={styles.listContainer}
              />
            ) : (
              <Text style={styles.noMatchesText}>No matches found</Text>
            )}
          </View>

          {/* You can add other content here below the match cards */}
          <View style={styles.bottomContent}>
            {/* Example of additional content */}
            {/* <Text style={styles.otherContentText}>Other content can go here</Text> */}
          </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    justifyContent: 'flex-start', // Ensure the content starts at the top
    alignItems: 'center',
    resizeMode: 'cover', // Ensure the background image covers the screen
    marginTop: -60,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // Semi-transparent overlay (black with 30% opacity)
    width: '100%',
    height: '100%',
    justifyContent: 'flex-start', // Align content from top
    paddingTop: 20, // Adjust for spacing from the top
  },
  loadingText: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
  },
  noMatchesText: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
  },
  matchesContainer: {
    marginTop: 20, // Adds spacing from top
    paddingHorizontal: 10, // Padding around the FlatList
  },
  matchCard: {
    flexDirection: 'row', // Layout profiles side-by-side (image + details)
    justifyContent: 'flex-start',
    alignItems: 'center', // Align items vertically in the center
    marginBottom: 15, // Space between profile cards
    backgroundColor: 'white', // White background for the card
    borderRadius: 10, // Rounded corners for the card
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 10,
    elevation: 0,
    marginTop: 20, // Space from the top
    padding: 5,
    width: '90%', // Set width to a percentage of the screen
    alignSelf: 'center', // Center the card horizontally
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,1)'
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35, // Circle shape
    marginRight: 15, // Space between image and profile info
    resizeMode: 'cover', // Ensure image scales properly inside circle
  },
  profileInfo: {
    flex: 1, // Take up remaining space for profile info
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  listContainer: {
    paddingVertical: 10,
  },
  bottomContent: {
    marginTop: 20,
    alignItems: 'center', // Center additional content (if any)
  },
});

export default Matches;
