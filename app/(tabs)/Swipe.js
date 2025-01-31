import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, Animated, SafeAreaView, ImageBackground, TouchableOpacity, TextInput } from 'react-native';
import Swiper from 'react-native-deck-swiper';
import { doc, updateDoc, arrayUnion, collection, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebaseconfig.js';
import Modal from 'react-native-modal';
//import LottieView from 'lottie-react-native'; // Import Lottie

const SwipeScreen = () => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [genderFilter, setGenderFilter] = useState('');
  const [majorFilter, setMajorFilter] = useState('');
  const [selectedGender, setSelectedGender] = useState('');  // Temporary state for gender selection
  const [typingMajor, setTypingMajor] = useState('');  // State for typing the major
  const [showFilters, setShowFilters] = useState(false);  // State to toggle filters visibility
  const [showShootingStar, setShowShootingStar] = useState(false);  // State to trigger shooting star animation
  const overlayColor = useRef(new Animated.Value(0)).current;
  const [overlayType, setOverlayType] = useState('none');

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      console.log('Fetching profiles...');
      const profilesSnapshot = await getDocs(collection(db, 'users'));
      const profilesList = profilesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
      let filteredProfiles = profilesList;
  
      if (genderFilter) {
        filteredProfiles = filteredProfiles.filter(profile => profile.gender === genderFilter);
      }
  
      if (majorFilter) {
        filteredProfiles = filteredProfiles.filter(profile =>
          profile.major && profile.major.toLowerCase() === majorFilter.toLowerCase()
        );
      }
  
      console.log('Filtered profiles:', filteredProfiles);
      setProfiles(filteredProfiles);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleFilterApply = () => {
    // Apply the selected gender filter
    setGenderFilter(selectedGender);  // Update the gender filter state
    if (typingMajor) {
      setMajorFilter(typingMajor.toLowerCase());
    } else {
      setMajorFilter('');
    }
    fetchProfiles();
    setShowFilters(false); // Close the filter modal after applying
  };

  const resetFilters = () => {
    setSelectedGender('');  // Reset the temporary gender state
    setGenderFilter('');
    setMajorFilter('');
    setTypingMajor('');
    fetchProfiles();
  };

  useEffect(() => {
    fetchProfiles();
  }, [genderFilter, majorFilter]);

  const animateOverlay = (type) => {
    setOverlayType(type);
    Animated.timing(overlayColor, {
      toValue: 1,
      duration: 500,
      useNativeDriver: false,
    }).start(() => {
      setTimeout(() => {
        Animated.timing(overlayColor, {
          toValue: 0,
          duration: 500,
          useNativeDriver: false,
        }).start();
      }, 1000);
    });
  };

  const onSwipeRight = async (cardIndex) => {
    const profile = profiles[cardIndex];
    console.log(`Swiped right on ${profile.name}`);
    const currentUserId = auth.currentUser.uid;
    const otherUserId = profile.id;

    try {
      const currentUserRef = doc(db, 'users', currentUserId);
      await updateDoc(currentUserRef, {
        matchedUsers: arrayUnion(otherUserId),
      });

      const otherUserRef = doc(db, 'users', otherUserId);
      await updateDoc(otherUserRef, {
        matchedUsers: arrayUnion(currentUserId),
      });

      // If a match is made, trigger the shooting star animation
      //setShowShootingStar(true);
      //setTimeout(() => setShowShootingStar(false), 3000); // Hide after 3 seconds
    } catch (error) {
      console.error('Error updating matched users:', error);
    }

    animateOverlay('green');
  };

  const onSwipeLeft = (cardIndex) => {
    const card = profiles[cardIndex];

    // Ensure that card is defined before accessing its properties
    if (!card) {
      console.error('Card is undefined');
      return;
    }

    // Check if the card is the fallback one
    if (card.id === 'fallback') {
      console.log('Swiped left on the fallback card');
      animateOverlay('red');
      return;  // Avoid accessing profile properties for the fallback card
    }

    console.log(`Swiped left on ${card.name}`);
    animateOverlay('red');
  };

  const onSwipedAll = () => {
    console.log('All profiles swiped, fetching more...');
    fetchProfiles();
  };

  const overlayBackgroundColor = overlayColor.interpolate({
    inputRange: [0, 1],
    outputRange: ['transparent', overlayType === 'green' ? 'rgba(0, 255, 0, 0.3)' : 'rgba(255, 0, 0, 0.3)'],
  });

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <Text style={styles.loadingText}>Loading profiles...</Text>
      ) : (
        <>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Text style={styles.filterButtonText}>Filter</Text>
          </TouchableOpacity>

          <ImageBackground
            source={require('../background.jpg')}
            style={styles.backgroundImage}
            imageStyle={styles.imageStyle}
            resizeMode="cover"
          >
            <Animated.View style={[styles.overlay, { backgroundColor: overlayBackgroundColor }]} />

            {/* Show shooting star animation when a match occurs */}
            {showShootingStar && (
              <LottieView
                source={require('../shooting_star.json')} // Your shooting star animation
                autoPlay
                loop={false}
                style={styles.shootingStarAnimation}
              />
            )}

            <Modal
              isVisible={showFilters}
              onBackdropPress={() => setShowFilters(false)}
              backdropOpacity={0.5}
              animationIn="slideInUp"
              animationOut="slideOutDown"
              style={styles.modal}
            >
              <View style={styles.filterContainer}>
                <Text style={styles.filterLabel}>Filter by Gender:</Text>
                <View style={styles.genderButtonsContainer}>
                  <TouchableOpacity
                    style={[styles.optionButton, selectedGender === 'Male' && styles.selectedOption]}
                    onPress={() => setSelectedGender(selectedGender === 'Male' ? '' : 'Male')}
                  >
                    <Text style={styles.optionText}>M</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.optionButton, selectedGender === 'Female' && styles.selectedOption]}
                    onPress={() => setSelectedGender(selectedGender === 'Female' ? '' : 'Female')}
                  >
                    <Text style={styles.optionText}>F</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.optionButton, selectedGender === 'Non-Binary' && styles.selectedOption]}
                    onPress={() => setSelectedGender(selectedGender === 'Non-Binary' ? '' : 'Non-Binary')}
                  >
                    <Text style={styles.optionText}>N/B</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.filterLabel}>Filter by Major:</Text>
                <TextInput
                  style={styles.majorInput}
                  placeholder="Enter major"
                  value={typingMajor}
                  onChangeText={setTypingMajor}
                />

                {/* Apply Filters Button */}
                <TouchableOpacity
                  style={styles.enterButton}
                  onPress={handleFilterApply}
                >
                  <Text style={styles.enterButtonText}>Apply Filters</Text>
                </TouchableOpacity>

                {/* Reset Filters Button */}
                <TouchableOpacity
                  style={styles.resetButton}
                  onPress={resetFilters}
                >
                  <Text style={styles.resetButtonText}>Reset Filters</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowFilters(false)}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </Modal>

            <View style={styles.swiperWrapper}>
              <Swiper
                cards={profiles.length > 0 ? profiles : [{ id: 'fallback', name: 'No Profiles Found' }]}
                renderCard={(card) => (
                  <View style={styles.card}>
                    <View style={styles.profileContainer}>
                      <Image
                        source={card.id === 'fallback'
                          ? require('../noprofile.jpg') // Image for fallback profile
                          : { uri: card.image || 'https://example.com/fallback.jpg' }} // Profile image URL
                        style={card.id === 'fallback' ? styles.fallbackImage : styles.profileImage}
                        resizeMode="contain"
                      />

                      {/* Display the name, major, and bio */}
                      <Text style={styles.name}>{card.name}</Text>
                      {card.id !== 'fallback' && card.major && (
                        <View style={styles.majorBox}>
                          <Text style={styles.label}>Major</Text>
                          <Text style={styles.major}>{card.major}</Text>
                        </View>
                      )}

                      {card.id !== 'fallback' && card.bio && (
                        <View style={styles.bioBox}>
                          <Text style={styles.label}>Bio</Text>
                          <Text style={styles.bio}>{card.bio}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                )}
                onSwipedRight={onSwipeRight}
                onSwipedLeft={onSwipeLeft}
                onSwipedAll={onSwipedAll}
                cardIndex={0}
                backgroundColor="transparent"
                stackSize={3}
                animateOverlayLabelsOpacity
                cardVerticalMargin={80}
                stackSeparation={10}
              />
            </View>
          </ImageBackground>
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  backgroundImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    marginTop: '-60',
  },
  imageStyle: {
    opacity: 1,
  },
  filterButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: '#000',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 30,
    zIndex: 3,
  },
  filterButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  swiperWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  card: {
    width: '80%',
    height: '80%',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 10,
    elevation: 5,
    backgroundColor: 'rgba(230, 230, 255, 1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '10',
    marginLeft: '-165',
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,1)',
  },
  profileContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,1)',
  },
  fallbackImage: {
    width: '90%',
    height: '80%',
    borderRadius: 10,
    marginBottom: 10,
  },
  name: {
    fontSize: 30,
    fontWeight: 'bold',
    fontFamily: 'PrinceValiant',
    paddingBottom: 5,
  },
  majorBox: {
    width: '80%',
    marginBottom: 10,
    padding: 10,
    borderWidth: 2,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  bioBox: {
    width: '80%',
    marginBottom: 10,
    padding: 10,
    borderWidth: 2,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#444',
    marginBottom: 5,
  },
  major: {
    fontSize: 16,
    color: '#555',
    fontFamily: 'PrinceValiant',
  },
  bio: {
    fontSize: 14,
    color: '#666',
    textAlign: 'left',
    fontFamily: 'PrinceValiant',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  shootingStarAnimation: {
    position: 'absolute',
    top: '20%',
    left: '10%',
    width: 200,
    height: 200,
    zIndex: 10,
  },
  filterContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  filterLabel: {
    fontSize: 24,
    fontWeight: '100',
    marginBottom: 10,
  },
  genderButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  optionButton: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 20,
  },
  selectedOption: {
    backgroundColor: '#007BFF',
  },
  optionText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  majorInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 20,
    borderRadius: 10,
    fontSize: 16,
  },
  enterButton: {
    backgroundColor: 'rgba(0, 128, 0, 0.3)',
    borderColor: '#2d6a4f',
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  enterButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '400',
  },
  resetButton: {
    backgroundColor: 'rgba(255, 0, 0, 0.3)', // Red background for reset
    borderColor: '#d43f00',
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  resetButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '400',
  },
  closeButton: {
    backgroundColor: 'rgba(158, 158, 158, 0.3)',
    borderColor: '#9e9e9e',
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '400',
  },
});

export default SwipeScreen;
