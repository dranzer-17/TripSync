// src/app/(main)/services/index.tsx

import React, { useState, useCallback, useEffect } from 'react';
import { FlatList, StyleSheet, Alert, View } from 'react-native';
import { ActivityIndicator, FAB, Text } from 'react-native-paper';
import { useFocusEffect, useRouter } from 'expo-router';
import ScreenWrapper from '../../../components/ScreenWrapper';
import ServiceCard from '../../../components/services/ServiceCard';
import { getAllServicePosts, deleteServicePost, ServicePost } from '../../../services/servicesService';
import { useAuth } from '../../../context/AuthContext';
import { getMyProfile, UserProfile } from '../../../services/profileService';

export default function ServicesScreen() {
  const [posts, setPosts] = useState<ServicePost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);
  const router = useRouter();
  const { token, user } = useAuth(); // Let's use the user from AuthContext

  const fetchData = useCallback(async () => {
    try {
      if (!currentUserProfile) setIsLoading(true);
      // We can use the user object from the context if it exists
      if (user) {
        setCurrentUserProfile(user);
      } else {
        // Fallback to fetching if it's not in the context yet
        const userProfile = await getMyProfile();
        setCurrentUserProfile(userProfile);
      }
      
      const fetchedPosts = await getAllServicePosts();
      setPosts(fetchedPosts);

    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to load data.");
    } finally {
      setIsLoading(false);
    }
  }, [currentUserProfile, user]);

  useFocusEffect(useCallback(() => { fetchData(); }, []));

  useEffect(() => {
    if (!isLoading) {
      console.log("--- DEBUGGING My Post ---");
      console.log("Current User from AuthContext:", JSON.stringify(user, null, 2));
      console.log("Current User ID being passed to cards:", user?.id || 'null');
      if (posts && posts.length > 0) {
        console.log("Poster ID of the first post:", posts[0].poster_user_id);
        console.log("Does the first post match?", posts[0].poster_user_id === user?.id);
      }
      console.log("-------------------------");
    }
  }, [posts, user, isLoading]);

  // --- THIS IS THE FIX ---
  const handleDeletePost = (postId: number) => {
    if (!token) {
      Alert.alert("Error", "You must be logged in to delete a post.");
      return;
    }

    // 1. Ask for confirmation
    Alert.alert(
      "Delete Post",
      "Are you sure you want to delete this service post?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              // 2. Call the API service
              await deleteServicePost(token, postId);
              
              // 3. Update the local state to remove the post
              setPosts(currentPosts => currentPosts.filter(post => post.id !== postId));

              Alert.alert("Success", "Post deleted successfully.");

            } catch (error: any) {
              // 4. Show an error message on failure
              Alert.alert("Error", `Failed to delete post: ${error.message}`);
            }
          },
        },
      ]
    );
  };
  // -------------------------

  if (isLoading) {
    return <ScreenWrapper style={styles.center}><ActivityIndicator size="large" /></ScreenWrapper>;
  }

  return (
    <ScreenWrapper style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <ServiceCard
            post={item}
            currentUserId={user?.id || null}
            onDelete={handleDeletePost} // This now calls the implemented function
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text>No services posted yet. Be the first!</Text>
          </View>
        }
      />
      
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push('./services/create')}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { padding: 15, paddingBottom: 80 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  fab: { position: 'absolute', margin: 16, right: 0, bottom: 0 },
});