import { Tabs } from 'expo-router';
import { StatusBar } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function TabLayout() {
  return (
    <>
    <StatusBar hidden={false} />
    <StatusBar style="dark" />
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#ffd33d',
        headerStyle: {
            backgroundColor: '#2529e',
        },
        headerShown: false,
        headTintColor: '#fff',
        tabBarStyle: {
            backgroundColor: '#25292e',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home-sharp' : 'home-outline'} color={color} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="Create Account"
        options={{
          title: 'Create Account',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'add-circle' : 'add-circle'} color={color} size={24}/>
          ),
        }}
      />
      <Tabs.Screen
        name="Login"
        options={{
          title: 'Login',
          tabBarIcon: ({ color, focused }) => (
            <MaterialIcons name="login" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons name="face-man-profile" size={24} color={color} />
          ),
        }}
        />

        <Tabs.Screen
        name="Swipe"
        options={{
          title: 'Swipe',
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons name="gesture-swipe" size={24} color={color} />
          ),
        }}
        />

        <Tabs.Screen
        name="ProfileO"
        options={{
          title: 'ProfileO',
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons name="face" size={24} color={color} />  
             
          ),
          }}
          />
      

        <Tabs.Screen
        name="Matches"
        options={{
          title: 'Matches',
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons name="heart" size={24} color={color} />
          ),
        }}  
        />


        <Tabs.Screen
        name="ChatScreen"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons name="chat-outline" size={24} color={color} />
          ),
        }}
  
        />  
    </Tabs>
    </>
  );
}
