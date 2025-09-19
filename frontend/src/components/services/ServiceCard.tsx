// src/components/services/ServiceCard.tsx

import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Avatar, Chip, IconButton, Menu } from 'react-native-paper';
import { ServicePost } from '../../services/servicesService';

interface ServiceCardProps {
  post: ServicePost;
  currentUserId: number | null;
  onDelete: (postId: number) => void;
}

export default function ServiceCard({ post, currentUserId, onDelete }: ServiceCardProps) {
  const [menuVisible, setMenuVisible] = useState(false);
  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  const isMyPost = post.poster_user_id === currentUserId;

  const handleDelete = () => {
    closeMenu();
    onDelete(post.id);
  };

  return (
    <Card style={styles.card}>
      <Card.Content>
        {/* Header with Title and Options Menu */}
        <View style={styles.header}>
          <Text variant="titleLarge" style={styles.title}>{post.title}</Text>
          {isMyPost && (
            <Menu
              visible={menuVisible}
              onDismiss={closeMenu}
              anchor={<IconButton icon="dots-vertical" onPress={openMenu} />}
            >
              <Menu.Item onPress={handleDelete} title="Delete" leadingIcon="delete-outline" />
            </Menu>
          )}
        </View>

        {/* --- ADDED DESCRIPTION --- */}
        {/* We can show a snippet of the description */}
        <Text variant="bodyMedium" numberOfLines={3} style={styles.description}>
          {post.description || 'No description provided.'}
        </Text>

        {/* Footer with Price Chip and User Info */}
        <View style={styles.footer}>
          <Chip icon={post.is_paid ? 'cash' : 'heart-outline'} style={styles.chip}>
            {post.is_paid ? `₹${post.price}` : 'Volunteer'}
          </Chip>
          
          {/* --- USER INFO MOVED TO BOTTOM RIGHT --- */}
          <View style={styles.userInfo}>
            <Text variant="bodySmall" style={styles.posterName}>{post.poster.full_name}</Text>
            {/* --- REDUCED AVATAR SIZE --- */}
            <Avatar.Icon size={24} icon="account-circle" style={styles.avatar} />
          </View>
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 15, },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', },
  title: { flex: 1, marginRight: 8, },
  description: { marginVertical: 12, color: '#ccc', },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, },
  chip: { alignSelf: 'flex-start', },
  userInfo: { flexDirection: 'row', alignItems: 'center', },
  posterName: { marginRight: 6, color: '#aaa', },
  avatar: {},
});