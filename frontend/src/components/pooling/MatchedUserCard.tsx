// src/components/pooling/MatchedUserCard.tsx
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Button, Avatar } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { MatchedUser } from '../../services/poolingService';

const COLORS = {
  primary: '#6A5AE0',
  white: '#FFFFFF',
  success: '#28A745',
  error: '#DC3545',
  gray: '#6C757D',
};

interface MatchedUserCardProps {
  user: MatchedUser;
  onSendRequest: (requestId: number) => Promise<void>;
  onApprove: (connectionId: number) => Promise<void>;
  onReject: (connectionId: number) => Promise<void>;
}

export default function MatchedUserCard({ user, onSendRequest, onApprove, onReject }: MatchedUserCardProps) {
  const [loading, setLoading] = useState(false);

  const handleSendRequest = async () => {
    console.log('MatchedUserCard - Send request button pressed for user:', user.id, 'request_id:', user.request_id);
    setLoading(true);
    try {
      await onSendRequest(user.request_id);
      console.log('MatchedUserCard - Request sent successfully');
    } catch (error) {
      console.error('MatchedUserCard - Error sending request:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!user.connection_id) return;
    setLoading(true);
    try {
      await onApprove(user.connection_id);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!user.connection_id) return;
    setLoading(true);
    try {
      await onReject(user.connection_id);
    } finally {
      setLoading(false);
    }
  };

  const renderActions = () => {
    const status = user.connection_status || 'none';

    if (status === 'none' || status === 'rejected') {
      return (
        <Button 
          mode="contained" 
          onPress={handleSendRequest}
          loading={loading}
          disabled={loading}
          style={[styles.button, { backgroundColor: COLORS.primary }]}
          icon={() => <Ionicons name="paper-plane" size={18} color={COLORS.white} />}
        >
          Send Request
        </Button>
      );
    }

    if (status === 'pending_sent') {
      return (
        <Button 
          mode="outlined" 
          disabled
          style={styles.button}
          icon={() => <Ionicons name="time" size={18} color={COLORS.gray} />}
        >
          Request Sent
        </Button>
      );
    }

    if (status === 'pending_received') {
      return (
        <View style={styles.responseButtons}>
          <View style={styles.notificationBadge}>
            <Ionicons name="notifications" size={16} color={COLORS.white} />
            <Text variant="bodySmall" style={styles.notificationText}>
              {user.full_name} sent you a pooling request
            </Text>
          </View>
          <View style={styles.buttonRow}>
            <Button 
              mode="contained"
              onPress={handleApprove}
              loading={loading}
              disabled={loading}
              style={[styles.responseButton, { backgroundColor: COLORS.success }]}
              icon={() => <Ionicons name="checkmark-circle" size={18} color={COLORS.white} />}
            >
              Accept Request
            </Button>
            <Button 
              mode="outlined"
              onPress={handleReject}
              loading={loading}
              disabled={loading}
              style={[styles.responseButton, { borderColor: COLORS.error }]}
              labelStyle={{ color: COLORS.error }}
              icon={() => <Ionicons name="close-circle" size={18} color={COLORS.error} />}
            >
              Decline
            </Button>
          </View>
        </View>
      );
    }

    if (status === 'approved') {
      return (
        <Button 
          mode="contained"
          style={[styles.button, { backgroundColor: COLORS.primary }]}
          icon={() => <Ionicons name="checkmark-done-circle" size={18} color={COLORS.white} />}
        >
          Connected
        </Button>
      );
    }

    return null;
  };

  return (
    <Card style={styles.card}>
      <Card.Title
        title={user.full_name}
        titleStyle={styles.title}
        left={(props) => (
          <Avatar.Icon 
            {...props} 
            icon="account" 
            style={styles.avatar}
            color={COLORS.primary}
          />
        )}
      />
      <Card.Content>
        {renderActions()}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    backgroundColor: COLORS.white,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderRadius: 12,
  },
  avatar: {
    backgroundColor: '#E8E5FA',
  },
  title: {
    fontWeight: '600',
    fontSize: 16,
  },
  button: {
    marginTop: 8,
    borderRadius: 8,
  },
  responseButtons: {
    marginTop: 8,
  },
  notificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 12,
    gap: 8,
  },
  notificationText: {
    color: COLORS.white,
    fontWeight: '600',
    flex: 1,
  },
  requestText: {
    color: COLORS.gray,
    marginBottom: 12,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  responseButton: {
    flex: 1,
    borderRadius: 8,
  },
});