import React, { useState, useEffect } from 'react';
import {StyleSheet, FlatList, View, Text, TextInput, KeyboardAvoidingView, Platform, ImageBackground, Keyboard, TouchableOpacity } from 'react-native';
import { sendMessage, listenForMessages } from '../utility/chathelpers'; 
import { useRoute } from '@react-navigation/native';
import { getDoc, doc } from 'firebase/firestore'; 
import { getAuth } from 'firebase/auth';  
import { db } from '../firebaseconfig'; 

function ChatScreen() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [matchedUser, setMatchedUser] = useState(null); 
  const [currentUserProfile, setCurrentUserProfile] = useState(null); 
  const route = useRoute();
  const { userId1, userId2 } = route.params || {}; 

  useEffect(() => {
    console.log("userId1:", userId1);
    console.log("userId2:", userId2);

    if (userId1 && userId2) {
      try {
        listenForMessages(userId1, userId2, (fetchedMessages) => {
          console.log('Messages in ChatScreen:', fetchedMessages); 
          setMessages(fetchedMessages);
        });
      } catch (error) {
        console.error('Error listening for messages:', error);
      }

      // Fetch matched user details (userId2)
      const fetchMatchedUser = async () => {
        try {
          const userDoc = await getDoc(doc(db, 'users', userId2)); 
          if (userDoc.exists()) {
            setMatchedUser(userDoc.data()); 
          } else {
            console.log('No matched user data found');
          }
        } catch (error) {
          console.error('Error fetching matched user data:', error);
        }
      };

      fetchMatchedUser();

      // Fetch current user's profile (userId1)
      const fetchCurrentUserProfile = async () => {
        try {
          const userDoc = await getDoc(doc(db, 'users', userId1)); 
          if (userDoc.exists()) {
            setCurrentUserProfile(userDoc.data()); 
          } else {
            console.log('No current user data found');
          }
        } catch (error) {
          console.error('Error fetching current user data:', error);
        }
      };

      fetchCurrentUserProfile();
    }
  }, [userId1, userId2]);

  const handleSend = async () => {
    const currentUser = getAuth().currentUser; 

    if (currentUser) {
      console.log('User is authenticated:', currentUser.uid);  
      if (userId1 && userId2 && message.trim()) {
        console.log("Sending message:", { userId1, userId2, message });
        try {
          await sendMessage(userId1, userId2, message); 
          setMessage(''); 
          Keyboard.dismiss(); 
        } catch (error) {
          console.error("Error sending message:", error);
        }
      } else {
        console.log('userId1, userId2 or message is missing');
      }
    } else {
      console.log('User is not authenticated');
    }
  };

  useEffect(() => {
    const currentUser = getAuth().currentUser;  

    if (currentUser) {
      console.log('User is authenticated:', currentUser.uid);
    } else {
      console.log('User is not authenticated');
    }
  }, []);

  return (
    <ImageBackground
      source={require('../background.jpg')}  
      style={styles.backgroundImage} 
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {/* Display matched user at the top */}
        {matchedUser && (
          <View style={styles.header}>
            <Text style={styles.headerText}>
              {matchedUser.name || 'Unknown User'}
            </Text>
          </View>
        )}

        <FlatList
          data={messages}
          renderItem={({ item }) => (
            <View
              style={[
                styles.message,
                {
                  alignSelf: item.sender === userId1 ? 'flex-end' : 'flex-start', 
                  backgroundColor: item.sender === userId1 ? '#B497D6' : '#e5e5ea', 
                  borderRadius: 20,
                }
              ]}
            >
              <Text style={[styles.messageText, { color: item.sender === userId1 ? 'white' : 'black' }]}>
                {item.text}
              </Text>
              {/* Display "Read" status */}
              {item.read && item.sender !== userId1 && (
                <Text style={styles.readStatus}>Read</Text>
              )}
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.noMessagesContainer}>
              <Text style={styles.noMessagesText}>No Messages Yet</Text>
            </View>
          }
          keyExtractor={(item, index) => index.toString()}
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={message}
            onChangeText={setMessage}
            placeholder="Type a message"
            placeholderTextColor="#8e8e93"
          />
          
          {/* X Button to dismiss the keyboard */}
          <TouchableOpacity onPress={() => Keyboard.dismiss()} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>X</Text>
          </TouchableOpacity>

          {/* Send Button */}
          <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

export default ChatScreen;

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    width: '100%',
    paddingTop: 40,  
  },
  header: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: 'rgba(242, 242, 247, 0.7)',
    width: '80%',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginTop: 20,
    borderRadius: 25,
    marginHorizontal: 30,
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1d1d1f',
    fontFamily: 'Prince Valiant', 
    transform: [{ scaleX: 1.3 }], 
  },
  message: {
    padding: 15,
    marginVertical: 5,
    maxWidth: '80%',
    alignSelf: 'flex-start',
    borderRadius: 20,
    marginTop: 15,
  },
  messageText: {
    fontSize: 16,
    fontFamily: 'System',  // Default system font for message text
  },
  readStatus: {
    fontSize: 12,
    color: 'green',
    marginTop: 5,
  },
  noMessagesContainer: {
    borderWidth: 1,
    borderColor: '#fff',
    backgroundColor: 'rgba(255, 255, 255, 0.5)', // Semi-transparent white
    padding: 20,
    borderRadius: 10,
    marginTop: 50,
  },
  noMessagesText: {
    fontSize: 18,
    color: '#1d1d1f',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    backgroundColor: 'rgba(242, 242, 247, 0.7)', 
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginRight: 10,
    backgroundColor: '#f2f2f7',  
    fontSize: 16,
    fontFamily: 'System',  // Default system font for input
  },
  closeButton: {
    marginRight: 10,
    padding: 5,
    backgroundColor: '#e5e5ea', 
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#8e8e93',
  },
  sendButton: {
    padding: 10,
    backgroundColor: '#B497D6',  
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
