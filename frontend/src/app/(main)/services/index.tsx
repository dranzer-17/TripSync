import React, { useState, useCallback, useEffect } from 'react';
import { FlatList, StyleSheet, View, ScrollView, Platform } from 'react-native';
import { ActivityIndicator, FAB, Searchbar, Chip, Text, useTheme, Snackbar } from 'react-native-paper';
import { useFocusEffect, useRouter } from 'expo-router';
import ScreenWrapper from '../../../components/ScreenWrapper';
import ServiceCard from '../../../components/services/ServiceCard';
import { getAllServicePosts, deleteServicePost, ServicePost } from '../../../services/servicesService';
import { useDebounce } from '../../../hooks/useDebounce';
import { useAuth } from '../../../context/AuthContext';

const POPULAR_TAGS = ['Writing', 'Research', 'Python', 'Design', 'Tutoring', 'Marketing', 'Event Help'];

export default function ServicesScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { token } = useAuth();
  const [posts, setPosts] = useState<ServicePost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarType, setSnackbarType] = useState<'success' | 'error'>('success');
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const showSnackbar = (message: string, type: 'success' | 'error' = 'success') => {
    setSnackbarMessage(message);
    setSnackbarType(type);
    setSnackbarVisible(true);
  };

  const hideSnackbar = () => setSnackbarVisible(false);

  const fetchData = useCallback(async () => {
    try {
      const fetchedPosts = await getAllServicePosts(debouncedSearchQuery, selectedTags);
      setPosts(fetchedPosts);
    } catch (error) {
      console.error(error);
      showSnackbar("Failed to load services. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearchQuery, selectedTags]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useFocusEffect(useCallback(() => { setIsLoading(true); fetchData(); }, []));

  const handleTagPress = (tag: string) => {
    setSelectedTags(currentTags =>
      currentTags.includes(tag)
        ? currentTags.filter(t => t !== tag)
        : [...currentTags, tag]
    );
  };

  const handleDeletePost = async (postId: number) => {
    if (!token) {
      showSnackbar("You must be logged in to delete a post.", "error");
      return;
    }

    try {
      await deleteServicePost(token, postId);
      setPosts(currentPosts => currentPosts.filter(post => post.id !== postId));
      showSnackbar("✓ Post deleted successfully!", "success");
    } catch (error: any) {
      showSnackbar(`Deletion failed: ${error.message}`, "error");
    }
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: { paddingHorizontal: 16, paddingTop: 16, backgroundColor: theme.colors.background },
    searchbar: { marginBottom: 16, backgroundColor: theme.colors.surface },
    chipContainer: { paddingBottom: 16 },
    chip: { marginRight: 8, backgroundColor: theme.colors.surface },
    chipSelected: { backgroundColor: theme.colors.primary },
    chipText: { color: theme.colors.onSurface },
    chipTextSelected: { color: '#FFFFFF', fontWeight: 'bold' },
    listContent: { paddingHorizontal: 16, paddingBottom: 80 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: theme.colors.background },
    fab: { position: 'absolute', margin: 16, right: 0, bottom: 0, backgroundColor: theme.colors.primary },
  });

  const ListHeader = (
    <View style={styles.header}>
      <Searchbar
        placeholder="Search by title or skill..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
        elevation={1}
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipContainer}>
        {POPULAR_TAGS.map(tag => (
          <Chip
            key={tag}
            mode="outlined"
            selected={selectedTags.includes(tag)}
            onPress={() => handleTagPress(tag)}
            style={[styles.chip, selectedTags.includes(tag) && styles.chipSelected]}
            textStyle={[styles.chipText, selectedTags.includes(tag) && styles.chipTextSelected]}
          >
            {tag}
          </Chip>
        ))}
      </ScrollView>
    </View>
  );

  if (isLoading) {
    return <ScreenWrapper style={styles.center}><ActivityIndicator size="large" /></ScreenWrapper>;
  }

  return (
    <ScreenWrapper>
      <FlatList
        style={{ backgroundColor: theme.colors.background }}
        data={posts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <ServiceCard post={item} onPostDeleted={handleDeletePost} />
        )}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text variant='titleMedium'>No Services Found</Text>
            <Text variant='bodySmall' style={{ color: theme.colors.onSurfaceVariant }}>Try adjusting your search or filters.</Text>
          </View>
        }
      />
      
      <FAB
        icon="plus"
        color="#FFFFFF"
        style={styles.fab}
        onPress={() => router.push('/services/create' as any)}
        aria-label="Create a new service post"
      />

      <Snackbar
        visible={snackbarVisible}
        onDismiss={hideSnackbar}
        duration={3000}
        style={{ 
          backgroundColor: snackbarType === 'success' ? '#4CAF50' : '#F44336'
        }}
      >
        <Text style={{ color: 'white', fontWeight: 'bold' }}>
          {snackbarMessage}
        </Text>
      </Snackbar>
    </ScreenWrapper>
  );
}