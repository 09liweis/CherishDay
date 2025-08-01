import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Databases, ID, Query } from 'react-native-appwrite';
import { client } from '../constant/appwrite';
import { useAuth } from './AuthContext';

// Appwrite 数据库配置
const databases = new Databases(client);
const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID;
const RELATIONSHIPS_COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_RELATIONSHIPS_COLLECTION_ID || 'relationships';

interface Relationship {
  $id: string;
  userId: string;
  friendId: string;
  status: 'pending' | 'accepted' | 'rejected';
  $createdAt: string;
}

interface FriendsContextType {
  relationships: Relationship[];
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
  const [relationships, setFriends] = useState<Relationship[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Load relationships and friend requests when user changes
  useEffect(() => {
    if (user) {
      loadFriends();
    } else {
      setFriends([]);
    }
  }, [user]);

  const loadFriends = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // This is a simplified approach - in a real app, you'd have a proper relationships relationship table
      // For now, we'll just load accepted friend requests to get relationships
      const response = await databases.listDocuments(
        DATABASE_ID,
        RELATIONSHIPS_COLLECTION_ID,
        [
          Query.equal('status', 'accepted'),
          Query.or([
            Query.equal('userId', user.$id),
            Query.equal('friendId', user.$id)
          ])
        ]
      );
      
      // Extract friend user IDs and fetch their details
      const friendIds = response.documents.map(doc => 
        doc.userId === user.$id ? doc.userId : doc.friendId
      );
      
      if (friendIds.length > 0) {
        // In a real implementation, you'd fetch user details from a users collection
        // For now, we'll simulate this with the friend request data
        
        
        setFriends(response.documents);
      } else {
        setFriends([]);
      }
    } catch (error) {
      console.error('Failed to load relationships:', error);
      setError('Failed to load relationships');
    } finally {
      setIsLoading(false);
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
        RELATIONSHIPS_COLLECTION_ID,
        ID.unique(),
        {
          userId: user.$id,
          friendId: toUserId,
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
        RELATIONSHIPS_COLLECTION_ID,
        requestId,
        {
          status: 'accepted'
        }
      );
      
      // Refresh both relationships and requests
      await Promise.all([loadFriends()]);
    } catch (error) {
      console.error('Failed to accept friend request:', error);
      throw error;
    }
  };

  const rejectFriendRequest = async (requestId: string): Promise<void> => {
    try {
      await databases.updateDocument(
        DATABASE_ID,
        RELATIONSHIPS_COLLECTION_ID,
        requestId,
        {
          status: 'rejected'
        }
      );
      
      // Refresh friend requests
    } catch (error) {
      console.error('Failed to reject friend request:', error);
      throw error;
    }
  };

  const refreshFriends = async () => {
    await Promise.all([loadFriends()]);
  };

  return (
    <FriendsContext.Provider value={{
      relationships,
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