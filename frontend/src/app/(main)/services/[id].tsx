import React, { useState, useEffect, useCallback } from 'react';
import { ScrollView, StyleSheet, View, Alert } from 'react-native';
import { Text, Button, ActivityIndicator, Divider, Avatar, Chip, useTheme } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import ScreenWrapper from '../../../components/ScreenWrapper';
import { getServicePostById, ServicePost } from '../../../services/servicesService';
import ApplyModal from '../../../components/services/ApplyModal';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../context/AuthContext';

const formatCompensation = (type: ServicePost['compensation_type'], amount?: number) => {
    switch (type) {
      case 'fixed_price': return `₹${amount || 'N/A'} (Fixed)`;
      case 'hourly_rate': return `₹${amount || 'N/A'} / hour`;
      case 'negotiable': return 'Negotiable';
      default: return 'Volunteer';
    }
};

export default function ServiceDetailScreen() {
  const theme = useTheme();
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

  const styles = StyleSheet.create({
    screenWrapper: { backgroundColor: theme.colors.background },
    container: { padding: 20, paddingBottom: 120 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background },
    posterInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
      backgroundColor: theme.colors.surface,
      padding: 16,
      borderRadius: 16,
      elevation: 4,
    },
    avatar: { marginRight: 16 },
    metaText: { color: theme.colors.onSurfaceVariant },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      marginBottom: 24,
      lineHeight: 36,
      color: theme.colors.onSurface,
    },
    detailsGrid: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 16,
      marginBottom: 24,
      elevation: 4,
    },
    detailItem: { alignItems: 'center', flex: 1 },
    detailIconContainer: {
        backgroundColor: `${theme.colors.primary}20`,
        borderRadius: 12,
        padding: 10,
        marginBottom: 8,
    },
    detailLabel: { color: theme.colors.onSurfaceVariant, marginTop: 4, fontSize: 13, fontWeight: '500' },
    detailValue: { fontWeight: 'bold', marginTop: 2, color: theme.colors.primary, fontSize: 16 },
    divider: { marginVertical: 24, backgroundColor: theme.colors.outline },
    sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 12, color: theme.colors.onSurface },
    description: { fontSize: 16, lineHeight: 24, color: theme.colors.onSurfaceVariant },
    tagContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 },
    tag: { marginRight: 8, marginBottom: 8, backgroundColor: `${theme.colors.primary}20` },
    tagText: { color: theme.colors.primary, fontWeight: '500' },
    applyButtonContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: 20,
      paddingTop: 10,
      backgroundColor: theme.colors.surface,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outline,
      elevation: 8,
    },
    applyButton: {
        borderRadius: 16,
        backgroundColor: theme.colors.primary
    },
    applyButtonLabel: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
    applyButtonContent: {
        paddingVertical: 8,
    }
  });

  if (isLoading) {
    return <ScreenWrapper style={styles.center}><ActivityIndicator size="large" /></ScreenWrapper>;
  }

  if (!post) {
    return <ScreenWrapper style={styles.center}><Text>Service not found.</Text></ScreenWrapper>;
  }
  
  const isMyPost = user?.id === post.poster_user_id;

  return (
    <ScreenWrapper style={styles.screenWrapper}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.posterInfo}>
          <Avatar.Icon size={48} icon="account-circle" style={styles.avatar} />
          <View>
            <Text variant="titleMedium">{post.is_anonymous ? 'Anonymous User' : post.poster?.full_name}</Text>
            <Text variant="bodySmall" style={styles.metaText}>Posted on {new Date(post.created_at).toLocaleDateString()}</Text>
          </View>
        </View>
        
        <Text style={styles.title}>{post.title}</Text>

        <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
                <View style={styles.detailIconContainer}><Ionicons name="cash-outline" size={24} color={theme.colors.primary} /></View>
                <Text style={styles.detailLabel}>Compensation</Text>
                <Text style={styles.detailValue}>{formatCompensation(post.compensation_type, post.compensation_amount)}</Text>
            </View>
            <View style={styles.detailItem}>
                <View style={styles.detailIconContainer}><Ionicons name="people-outline" size={24} color={theme.colors.primary} /></View>
                <Text style={styles.detailLabel}>Team Size</Text>
                <Text style={styles.detailValue}>{post.team_size} Person</Text>
            </View>
            <View style={styles.detailItem}>
                <View style={styles.detailIconContainer}><Ionicons name="calendar-outline" size={24} color={theme.colors.primary} /></View>
                <Text style={styles.detailLabel}>Deadline</Text>
                <Text style={styles.detailValue}>{post.deadline ? new Date(post.deadline).toLocaleDateString() : 'N/A'}</Text>
            </View>
        </View>

        <Divider style={styles.divider} />

        <Text style={styles.sectionTitle}>Full Description</Text>
        <Text style={styles.description}>{post.description}</Text>

        <Divider style={styles.divider} />

        <Text style={styles.sectionTitle}>Required Skills</Text>
        <View style={styles.tagContainer}>
          {post.tags.map(tag => ( <Chip key={tag.id} style={styles.tag} textStyle={styles.tagText}>{tag.name}</Chip> ))}
        </View>
      </ScrollView>

      {!isMyPost && (
         <View style={styles.applyButtonContainer}>
            <Button 
                mode="contained" 
                onPress={() => setIsModalVisible(true)}
                style={styles.applyButton}
                labelStyle={styles.applyButtonLabel}
                contentStyle={styles.applyButtonContent}
                icon="send-outline"
            >
              Apply Now
            </Button>
         </View>
      )}

      {post && (
        <ApplyModal
            visible={isModalVisible}
            onDismiss={() => setIsModalVisible(false)}
            post={post}
            onApplicationSuccess={handleApplicationSuccess}
        />
      )}
    </ScreenWrapper>
  );
}