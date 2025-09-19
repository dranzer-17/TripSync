import React, { useState, useEffect, useCallback } from 'react';
import { ScrollView, StyleSheet, View, Alert } from 'react-native';
import { Text, Button, ActivityIndicator, Divider, Avatar, Chip } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import ScreenWrapper from '../../../components/ScreenWrapper';
import { getServicePostById, ServicePost } from '../../../services/servicesService';
import ApplyModal from '../../../components/services/ApplyModal';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../context/AuthContext';

// Reusable helper function to format compensation details
const formatCompensation = (type: ServicePost['compensation_type'], amount?: number) => {
    switch (type) {
      case 'fixed_price': return `₹${amount} (Fixed)`;
      case 'hourly_rate': return `₹${amount} / hour`;
      case 'negotiable': return 'Negotiable';
      default: return 'Volunteer';
    }
};

export default function ServiceDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [post, setPost] = useState<ServicePost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const fetchData = useCallback(async () => {
    if (!id) {
        Alert.alert('Error', 'Service ID is missing.');
        router.back();
        return;
    }
    try {
      const postId = parseInt(id, 10);
      if (isNaN(postId)) throw new Error("Invalid Post ID");
      
      const fetchedPost = await getServicePostById(postId);
      setPost(fetchedPost);
    } catch (error) {
      Alert.alert('Error', 'Could not load service details. It may have been removed.');
      router.back();
    } finally {
      setIsLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleApplicationSuccess = () => {
    setIsModalVisible(false);
    Alert.alert(
      'Application Submitted!',
      'The poster has been notified. You can track the status in your dashboard.',
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  if (isLoading) {
    return <ScreenWrapper style={styles.center}><ActivityIndicator size="large" /></ScreenWrapper>;
  }

  if (!post) {
    return <ScreenWrapper style={styles.center}><Text>Service not found.</Text></ScreenWrapper>;
  }
  
  // A user cannot apply to their own post
  const isMyPost = user?.id === post.poster?.id;

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header section with Poster Info */}
        <View style={styles.posterInfo}>
          <Avatar.Icon size={48} icon="account-circle" style={styles.avatar} />
          <View>
            <Text variant="titleMedium">{post.is_anonymous ? 'Anonymous User' : post.poster?.full_name}</Text>
            <Text variant="bodySmall" style={styles.metaText}>Posted on {new Date(post.created_at).toLocaleDateString()}</Text>
          </View>
        </View>
        
        <Text variant="headlineMedium" style={styles.title}>{post.title}</Text>

        {/* Key Details Grid */}
        <View style={styles.detailsGrid}>
            <View style={styles.detailItem}><Ionicons name="cash-outline" size={24} color="#007AFF" /><Text style={styles.detailLabel}>Compensation</Text><Text style={styles.detailValue}>{formatCompensation(post.compensation_type, post.compensation_amount)}</Text></View>
            <View style={styles.detailItem}><Ionicons name="people-outline" size={24} color="#007AFF" /><Text style={styles.detailLabel}>Team Size</Text><Text style={styles.detailValue}>{post.team_size} Person</Text></View>
            <View style={styles.detailItem}><Ionicons name="calendar-outline" size={24} color="#007AFF" /><Text style={styles.detailLabel}>Deadline</Text><Text style={styles.detailValue}>{post.deadline ? new Date(post.deadline).toLocaleDateString() : 'N/A'}</Text></View>
        </View>

        <Divider style={styles.divider} />

        {/* Description Section */}
        <Text variant="titleMedium" style={styles.sectionTitle}>Full Description</Text>
        <Text variant="bodyMedium" style={styles.description}>{post.description}</Text>

        <Divider style={styles.divider} />

        {/* Required Skills/Tags Section */}
        <Text variant="titleMedium" style={styles.sectionTitle}>Required Skills</Text>
        <View style={styles.tagContainer}>
          {post.tags.map(tag => ( <Chip key={tag.id} icon="pound" style={styles.tag}>{tag.name}</Chip> ))}
        </View>
      </ScrollView>

      {/* Conditional Apply Button */}
      {!isMyPost && (
         <View style={styles.applyButtonContainer}>
            <Button mode="contained" onPress={() => setIsModalVisible(true)} contentStyle={{ paddingVertical: 5 }}>
              Apply Now
            </Button>
         </View>
      )}

      {/* Application Modal */}
      <ApplyModal
        visible={isModalVisible}
        onDismiss={() => setIsModalVisible(false)}
        post={post}
        onApplicationSuccess={handleApplicationSuccess}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
  container: { padding: 20, paddingBottom: 120, backgroundColor: '#000' }, // Extra padding for apply button
  posterInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  avatar: { marginRight: 16, backgroundColor: '#3A3A3C' },
  metaText: { color: '#AEAEB2' },
  title: { marginBottom: 16, fontWeight: 'bold' },
  detailsGrid: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#1C1C1E', borderRadius: 12, padding: 16, marginBottom: 20 },
  detailItem: { alignItems: 'center', flex: 1 },
  detailLabel: { color: '#AEAEB2', marginTop: 4, fontSize: 12 },
  detailValue: { fontWeight: '600', marginTop: 2 },
  divider: { marginVertical: 24, backgroundColor: '#3A3A3C' },
  sectionTitle: { marginBottom: 12, fontWeight: 'bold' },
  description: { lineHeight: 22, color: '#E5E5EA' },
  tagContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 },
  tag: { marginRight: 8, marginBottom: 8, backgroundColor: '#3A3A3C' },
  applyButtonContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingTop: 10, backgroundColor: '#1C1C1E', borderTopWidth: 1, borderTopColor: '#3A3A3C' },
});