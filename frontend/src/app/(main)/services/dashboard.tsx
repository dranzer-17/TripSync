// src/app/(main)/services/dashboard.tsx

import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Text, SegmentedButtons, ActivityIndicator, Card, Button, useTheme } from 'react-native-paper';
import { useFocusEffect, useRouter } from 'expo-router';
import ScreenWrapper from '../../../components/ScreenWrapper';
import { useAuth } from '../../../context/AuthContext';
import { getMyServicePosts, getMyApplications, ServicePost, ServiceApplication } from '../../../services/servicesService';


export default function ServicesDashboard() {
  const theme = useTheme();
  const router = useRouter();
  const { token } = useAuth();
  const [tab, setTab] = useState<'my-posts' | 'my-applications'>('my-posts');
  const [myPosts, setMyPosts] = useState<ServicePost[]>([]);
  const [myApplications, setMyApplications] = useState<ServiceApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!token) {
        Alert.alert("Authentication Error", "You must be logged in to view your dashboard.");
        return;
    }
    setIsLoading(true);
    try {
      if (tab === 'my-posts') {
        const posts = await getMyServicePosts(token);
        setMyPosts(posts);
      } else {
        const apps = await getMyApplications(token);
        setMyApplications(apps);
      }
    } catch (error: any) {
      Alert.alert('Error', `Failed to load data: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [token, tab]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    segmentContainer: { padding: 16 },
    listContent: { paddingHorizontal: 16 },
    card: { marginBottom: 12, backgroundColor: theme.colors.surface },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    emptyText: { color: theme.colors.onSurfaceVariant, marginTop: 8 },
  });

  const renderMyPosts = () => (
    <FlatList
      data={myPosts}
      keyExtractor={item => item.id.toString()}
      contentContainerStyle={styles.listContent}
      renderItem={({ item }) => (
        <Card style={styles.card}>
          <Card.Title title={item.title} subtitle={`Status: ${item.status}`} />
          <Card.Actions>
            {/* This would navigate to a screen showing the list of applicants */}
            <Button onPress={() => Alert.alert("Applicants", "This would show a list of applicants.")}>
                View Applicants
            </Button>
          </Card.Actions>
        </Card>
      )}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
            <Text variant="titleMedium">No Services Posted</Text>
            <Text style={styles.emptyText}>Tap the '+' button to create a new service.</Text>
        </View>
      }
    />
  );

  const renderMyApplications = () => (
    <FlatList
      data={myApplications}
      keyExtractor={item => item.id.toString()}
      contentContainerStyle={styles.listContent}
      renderItem={({ item }) => (
        <Card style={styles.card} onPress={() => router.push(`/(main)/services/${item.service_post.id}` as any)}>
          <Card.Title
            title={item.service_post.title}
            subtitle={`Your application status: ${item.status}`}
            subtitleStyle={{ 
              color: item.status === 'accepted' 
                ? '#34C759' // success green
                : item.status === 'rejected' 
                ? theme.colors.error 
                : theme.colors.onSurfaceVariant 
            }}
          />
        </Card>
      )}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
            <Text variant="titleMedium">No Applications Found</Text>
            <Text style={styles.emptyText}>Apply for services to see your status here.</Text>
        </View>
      }
    />
  );

  return (
    <ScreenWrapper>
      <View style={styles.segmentContainer}>
        <SegmentedButtons
          value={tab}
          onValueChange={(value) => setTab(value as any)}
          buttons={[
            { value: 'my-posts', label: 'My Posts', icon: 'post' },
            { value: 'my-applications', label: 'My Applications', icon: 'file-check' },
          ]}
        />
      </View>

      {isLoading ? (
        <ActivityIndicator style={{ marginTop: 20 }} />
      ) : (
        tab === 'my-posts' ? renderMyPosts() : renderMyApplications()
      )}
    </ScreenWrapper>
  );
}