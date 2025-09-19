import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Avatar, Chip, useTheme, IconButton, Menu } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { ServicePost } from '../../services/servicesService';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

interface ServiceCardProps {
  post: ServicePost;
  onPostDeleted: (postId: number) => void;
}

const formatCompensation = (type: ServicePost['compensation_type'], amount?: number): string => {
  switch (type) {
    case 'fixed_price': return `₹${amount || 'N/A'}`;
    case 'hourly_rate': return `₹${amount || 'N/A'} / hr`;
    case 'negotiable': return 'Negotiable';
    default: return 'Volunteer';
  }
};

const formatPostedDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays <= 1) return 'Posted today';
  if (diffDays <= 30) return `Posted ${diffDays} days ago`;
  return `Posted on ${date.toLocaleDateString()}`;
};

export default function ServiceCard({ post, onPostDeleted }: ServiceCardProps) {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  
  const [menuVisible, setMenuVisible] = useState(false);
  // --- ROBUST way to open/close menu to avoid race conditions ---
  const openMenu = (e: any) => {
    // Stop the card's onPress from firing when the menu button is pressed
    e.stopPropagation();
    setMenuVisible(true);
  };
  const closeMenu = () => setMenuVisible(false);

  // --- THIS IS THE CRITICAL FIX ---
  // We check if the `user` object from the auth context exists AND
  // if its `id` matches the `poster_user_id` directly on the post object.
  // This is the most reliable way to check for ownership.
  const isMyPost = !!user && user.id === post.poster_user_id;

  const handlePress = () => {
    if (!post || typeof post.id !== 'number') { return; }
    router.push(`/services/${post.id}` as any);
  };

  const handleDelete = (e: any) => {
    e.stopPropagation(); // Stop event bubbling
    closeMenu();
    onPostDeleted(post.id); 
  };
  
  const styles = StyleSheet.create({
    card: {
      marginBottom: 16,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.outline,
    },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    avatar: { marginRight: 12, backgroundColor: theme.colors.background },
    headerTextContainer: { flex: 1 },
    posterName: { fontWeight: 'bold', color: theme.colors.onSurface },
    date: { color: theme.colors.onSurfaceVariant },
    title: { color: theme.colors.onSurface, marginBottom: 10, lineHeight: 24, fontSize: 18 },
    tagContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 },
    tag: { marginRight: 8, marginBottom: 8, backgroundColor: theme.colors.background },
    tagText: { color: theme.colors.primary },
    footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, marginTop: 4, borderTopWidth: 1, borderTopColor: theme.colors.outline },
    detailItem: { flexDirection: 'row', alignItems: 'center', flexShrink: 1, marginRight: 10 },
    detailText: { marginLeft: 6, color: theme.colors.onSurfaceVariant },
  });

  return (
    <Card style={styles.card} onPress={handlePress}>
      <Card.Content>
        <View style={styles.header}>
          <Avatar.Icon size={40} icon="account-circle" style={styles.avatar} />
          <View style={styles.headerTextContainer}>
            <Text variant="bodyLarge" style={styles.posterName}>
              {post.is_anonymous ? 'Anonymous User' : post.poster?.full_name || 'User'}
            </Text>
            <Text variant="bodySmall" style={styles.date}>
              {formatPostedDate(post.created_at)}
            </Text>
          </View>
          
          {isMyPost && (
            <Menu
              visible={menuVisible}
              onDismiss={closeMenu}
              anchor={<IconButton icon="dots-vertical" onPress={openMenu} size={24} />}
            >
              <Menu.Item onPress={handleDelete} title="Delete Post" leadingIcon="delete-outline" />
            </Menu>
          )}
        </View>

        <Text variant="titleLarge" style={styles.title}>{post.title}</Text>
        
        {post.tags && post.tags.length > 0 && (
          <View style={styles.tagContainer}>
            {post.tags.slice(0, 3).map(tag => (
              <Chip key={tag.id} style={styles.tag} textStyle={styles.tagText}>
                {tag.name}
              </Chip>
            ))}
          </View>
        )}

        <View style={styles.footer}>
          <View style={styles.detailItem}>
            <Ionicons name="cash-outline" size={16} color={theme.colors.onSurfaceVariant} />
            <Text style={styles.detailText}>
              {formatCompensation(post.compensation_type, post.compensation_amount)}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="people-outline" size={16} color={theme.colors.onSurfaceVariant} />
            <Text style={styles.detailText}>{post.team_size} Person</Text>
          </View>
          {post.deadline && (
            <View style={styles.detailItem}>
              <Ionicons name="calendar-outline" size={16} color={theme.colors.onSurfaceVariant} />
              <Text style={styles.detailText}>
                {new Date(post.deadline).toLocaleDateString()}
              </Text>
            </View>
          )}
        </View>
      </Card.Content>
    </Card>
  );
}