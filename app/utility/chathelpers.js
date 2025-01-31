// Import necessary Firebase modules for Firebase v9+
import { getDatabase, ref, push, onValue } from 'firebase/database';  // Import database functions
import { getAuth } from 'firebase/auth';  // Import auth functions for authentication
import { app } from '../firebaseconfig';  // Import the Firebase app (assuming you initialized it in firebaseconfig)

// Utility to get chat room ID (by sorting user IDs alphabetically to avoid duplicates)
export const getChatId = (userId1, userId2) => {
  const ids = [userId1, userId2].sort();
  return `${ids[0]}_${ids[1]}`;  // This ensures no duplicates like userId1_userId2 vs userId2_userId1
};

// Send a message to a chat room
export const sendMessage = async (userId1, userId2, messageText) => {
  try {
    const chatId = getChatId(userId1, userId2);
    const db = getDatabase(app); // Getting the database instance from the app

    const newMessage = {
      sender: userId1,
      text: messageText,
      timestamp: Date.now(),
    };

    // Push message to the chat room in the messages node
    const messagesRef = ref(db, `chats/${chatId}/messages`);
    await push(messagesRef, newMessage);
    console.log("Message sent successfully.");
  } catch (error) {
    console.error("Error sending message:", error);
  }
};

// Listen for new messages in a chat room (for real-time updates)
export const listenForMessages = (userId1, userId2, callback) => {
  const chatId = getChatId(userId1, userId2);
  const db = getDatabase(app); // Getting the database instance from the app

  // Firebase listener for new messages in the chat room
  const messagesRef = ref(db, `chats/${chatId}/messages`);
  onValue(messagesRef, (snapshot) => {
    const messages = [];
    snapshot.forEach((childSnapshot) => {
      const message = childSnapshot.val();
      messages.push(message);
    });
    // Call the callback with the updated list of messages
    callback(messages);
  });
};

// Example of how you can use these functions in your component
const ChatScreen = () => {
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const auth = getAuth();  // Initialize authentication

  const userId1 = auth.currentUser?.uid; // Assuming user1 is the authenticated user
  const userId2 = 'someOtherUserId';    // This should be dynamically fetched (e.g., matched user)

  // Send message function called on submit
  const handleSendMessage = () => {
    if (messageText.trim()) {
      // Log the message data being sent
      console.log('Sending message with:', { userId1, userId2, messageText });
  
      sendMessage(userId1, userId2, messageText); // Send the message to the chatroom
      setMessageText('');  // Clear input after sending the message
    }
  };
  

  // Listen for new messages in the chatroom
  useEffect(() => {
    if (userId1 && userId2) {
      listenForMessages(userId1, userId2, (newMessages) => {
        setMessages(newMessages); // Update state with the new messages
      });
    }
  }, [userId1, userId2]);  // Ensure that the listener updates when either userId changes

  return (
    <View style={{ flex: 1, padding: 10 }}>
      {/* Message list */}
      <FlatList
        data={messages}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={{ marginBottom: 10 }}>
            <Text style={{ fontWeight: 'bold' }}>{item.sender}: </Text>
            <Text>{item.text}</Text>
          </View>
        )}
      />

      {/* Message input and send button */}
      <TextInput
        value={messageText}
        onChangeText={setMessageText}
        placeholder="Type a message"
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
      />
      <Button title="Send" onPress={handleSendMessage} />
    </View>
  );
};

export default ChatScreen;
