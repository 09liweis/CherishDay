import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Databases, ID, Query } from 'react-native-appwrite';
import { client } from '../constant/appwrite';
import { useAuth } from './AuthContext';

// Appwrite 数据库配置
const databases = new Databases(client);
const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID;
const FRIENDS_COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_FRIENDS_COLLECTION_ID || 'friends';
const FRIEND_REQUESTS_COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_FRIEND_REQUESTS_COLLECTION_ID || 'friend_requests';

interface Friend {
  $id: string;
  name: string;
  email: string;
  $createdAt: string;
}

interface FriendRequest {
  $id: string;
  fromUserId: string;
  toUserId: string;
  status: 'pending' | 'accepted' | 'rejected';
  fromUser?: Friend;
  toUser?: Friend;
  $createdAt: string;
}

interface FriendsContextType {
  friends: Friend[];
  friendRequests: FriendRequest[];
  searchUsers: (email: string) => Promise<any[]>;
  sendFriendRequest: (toUserId: string) => Promise<void>;
  acceptFriendRequest: (requestId: string) => Promise<void>;
  rejectFriendRequest: (requestId: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  refreshFriends: () => Promise<void>;
}

const FriendsContext = createContext<FriendsContextType | undefined>(undefined);

export function FriendsProvider({ children }: { children: ReactNode }) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Load friends and friend requests when user changes
  useEffect(() => {
    if (user) {
      loadFriends();
      loadFriendRequests();
    } else {
      setFriends([]);
      setFriendRequests([]);
    }
  }, [user]);

  const loadFriends = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // This is a simplified approach - in a real app, you'd have a proper friends relationship table
      // For now, we'll just load accepted friend requests to get friends
      const response = await databases.listDocuments(
        DATABASE_ID,
        FRIEND_REQUESTS_COLLECTION_ID,
        [
          Query.equal('status', 'accepted'),
          Query.or([
            Query.equal('fromUserId', user.$id),
            Query.equal('toUserId', user.$id)
          ])
        ]
      );
      
      // Extract friend user IDs and fetch their details
      const friendIds = response.documents.map(doc => 
        doc.fromUserId === user.$id ? doc.toUserId : doc.fromUserId
      );
      
      if (friendIds.length > 0) {
        // In a real implementation, you'd fetch user details from a users collection
        // For now, we'll simulate this with the friend request data
        const friendsData = response.documents.map(doc => {
          const isFromUser = doc.fromUserId === user.$id;
          return {
            $id: isFromUser ? doc.toUserId : doc.fromUserId,
            name: isFromUser ? doc.toUserName || 'Unknown' : doc.fromUserName || 'Unknown',
            email: isFromUser ? doc.toUserEmail || 'unknown@email.com' : doc.fromUserEmail || 'unknown@email.com',
            $createdAt: doc.$createdAt,
          };
        });
        
        setFriends(friendsData);
      } else {
        setFriends([]);
      }
    } catch (error) {
      console.error('Failed to load friends:', error);
      setError('Failed to load friends');
    } finally {
      setIsLoading(false);
    }
  };

  const loadFriendRequests = async () => {
    if (!user) return;
    
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        FRIEND_REQUESTS_COLLECTION_ID,
        [
          Query.equal('toUserId', user.$id),
          Query.equal('status', 'pending')
        ]
      );
      
      const requestsWithUserData = response.documents.map(doc => ({
        $id: doc.$id,
        fromUserId: doc.fromUserId,
        toUserId: doc.toUserId,
        status: doc.status,
        fromUser: {
          $id: doc.fromUserId,
          name: doc.fromUserName || 'Unknown',
          email: doc.fromUserEmail || 'unknown@email.com',
          $createdAt: doc.$createdAt,
        },
        $createdAt: doc.$createdAt,
      }));
      
      setFriendRequests(requestsWithUserData);
    } catch (error) {
      console.error('Failed to load friend requests:', error);
      setError('Failed to load friend requests');
    }
  };

  const searchUsers = async (email: string): Promise<any[]> => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      // In a real implementation, you'd search a users collection
      // For this demo, we'll simulate finding users by checking if they exist in the auth system
      // This is a simplified approach - you'd typically have a dedicated users collection
      
      // Return empty array for now since we don't have access to search all users
      // In a real app, you'd implement this with a proper users collection and search functionality
      return [];
    } catch (error) {
      console.error('Failed to search users:', error);
      throw error;
    }
  };

  const sendFriendRequest = async (toUserId: string): Promise<void> => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      await databases.createDocument(
        DATABASE_ID,
        FRIEND_REQUESTS_COLLECTION_ID,
        ID.unique(),
        {
          fromUserId: user.$id,
          fromUserName: user.name,
          fromUserEmail: user.email,
          toUserId: toUserId,
          status: 'pending',
        }
      );
    } catch (error) {
      console.error('Failed to send friend request:', error);
      throw error;
    }
  };

  const acceptFriendRequest = async (requestId: string): Promise<void> => {
    try {
      await databases.updateDocument(
        DATABASE_ID,
        FRIEND_REQUESTS_COLLECTION_ID,
        requestId,
        {
          status: 'accepted'
        }
      );
      
      // Refresh both friends and requests
      await Promise.all([loadFriends(), loadFriendRequests()]);
    } catch (error) {
      console.error('Failed to accept friend request:', error);
      throw error;
    }
  };

  const rejectFriendRequest = async (requestId: string): Promise<void> => {
    try {
      await databases.updateDocument(
        DATABASE_ID,
        FRIEND_REQUESTS_COLLECTION_ID,
        requestId,
        {
          status: 'rejected'
        }
      );
      
      // Refresh friend requests
      await loadFriendRequests();
    } catch (error) {
      console.error('Failed to reject friend request:', error);
      throw error;
    }
  };

  const refreshFriends = async () => {
    await Promise.all([loadFriends(), loadFriendRequests()]);
  };

  return (
    <FriendsContext.Provider value={{
      friends,
      friendRequests,
      searchUsers,
      sendFriendRequest,
      acceptFriendRequest,
      rejectFriendRequest,
      isLoading,
      error,
      refreshFriends,
    }}>
      {children}
    </FriendsContext.Provider>
  );
}

export function useFriends() {
  const context = useContext(FriendsContext);
  if (context === undefined) {
    throw new Error('useFriends must be used within a FriendsProvider');
  }
  return context;
}