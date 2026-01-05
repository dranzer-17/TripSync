// src/components/pooling/ActiveConnectionModal.tsx
import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, Button, Portal, Modal, Card, Avatar, Divider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

const COLORS = {
  primary: '#6A5AE0',
  white: '#FFFFFF',
  error: '#DC3545',
  text: '#0D0D0D',
  textSecondary: '#6C757D',
  lightPurple: '#E8E5FA',
  success: '#28A745',
};

interface Partner {
  id: number;
  full_name: string;
  phone_number?: string | null;
  email?: string | null;
  year_of_study?: string | null;
  bio?: string | null;
}

interface ActiveConnectionModalProps {
  visible: boolean;
  partner: Partner;
  onStartChat: () => void;
  onEndRide: () => Promise<void>;
  onViewFullProfile: () => void;
}

export default function ActiveConnectionModal({
  visible,
  partner,
  onStartChat,
  onEndRide,
  onViewFullProfile
}: ActiveConnectionModalProps) {
  const [endingRide, setEndingRide] = useState(false);

  const handleEndRide = () => {
    Alert.alert(
      'End Ride',
      'Are you sure you want to end this ride? This will disconnect you from your pooling partner.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Ride',
          style: 'destructive',
          onPress: async () => {
            setEndingRide(true);
            try {
              await onEndRide();
            } finally {
              setEndingRide(false);
            }
          },
        },
      ]
    );
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        dismissable={false}
        contentContainerStyle={styles.modalContainer}
      >
        <Card style={styles.card}>
          <Card.Content>
            {/* Success Header */}
            <View style={styles.header}>
              <View style={styles.successBadge}>
                <Ionicons name="checkmark-circle" size={32} color={COLORS.success} />
              </View>
              <Text variant="headlineMedium" style={styles.title}>
                Connected! 🎉
              </Text>
              <Text variant="bodyMedium" style={styles.subtitle}>
                You&apos;re now pooling with
              </Text>
            </View>

            {/* Partner Info */}
            <View style={styles.partnerSection}>
              <Avatar.Icon
                size={80}
                icon="account"
                style={styles.avatar}
                color={COLORS.primary}
              />
              <Text variant="headlineSmall" style={styles.partnerName}>
                {partner.full_name}
              </Text>
              {partner.phone_number && (
                <View style={styles.contactRow}>
                  <Ionicons name="call" size={18} color={COLORS.textSecondary} />
                  <Text variant="bodyMedium" style={styles.contactText}>
                    {partner.phone_number}
                  </Text>
                </View>
              )}
              <Button
                mode="text"
                onPress={onViewFullProfile}
                style={styles.viewProfileButton}
                icon={() => <Ionicons name="person-circle" size={18} color={COLORS.primary} />}
              >
                View Full Profile
              </Button>
            </View>

            <Divider style={styles.divider} />

            {/* Action Buttons */}
            <View style={styles.actions}>
              <Button
                mode="contained"
                onPress={onStartChat}
                style={styles.chatButton}
                contentStyle={styles.buttonContent}
                labelStyle={styles.buttonLabel}
                icon={() => <Ionicons name="chatbubbles" size={20} color={COLORS.white} />}
              >
                Start Chat
              </Button>

              <Button
                mode="outlined"
                onPress={handleEndRide}
                loading={endingRide}
                disabled={endingRide}
                style={styles.endButton}
                contentStyle={styles.buttonContent}
                labelStyle={styles.endButtonLabel}
                icon={() => <Ionicons name="stop-circle" size={20} color={COLORS.error} />}
              >
                End Ride
              </Button>
            </View>

            {/* Tips */}
            <View style={styles.tipsSection}>
              <Text variant="bodySmall" style={styles.tipsTitle}>
                💡 Quick Tips:
              </Text>
              <Text variant="bodySmall" style={styles.tipsText}>
                • Share your exact pickup location{'\n'}
                • Communicate arrival times{'\n'}
                • Split costs fairly
              </Text>
            </View>
          </Card.Content>
        </Card>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  successBadge: {
    marginBottom: 12,
    padding: 8,
    borderRadius: 50,
    backgroundColor: '#E8F5E9',
  },
  title: {
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  subtitle: {
    color: COLORS.textSecondary,
  },
  partnerSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    backgroundColor: COLORS.lightPurple,
    marginBottom: 12,
  },
  partnerName: {
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  contactText: {
    color: COLORS.textSecondary,
  },
  viewProfileButton: {
    marginTop: 4,
  },
  divider: {
    marginVertical: 16,
  },
  actions: {
    gap: 12,
    marginBottom: 16,
  },
  chatButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
  },
  endButton: {
    borderRadius: 12,
    borderColor: COLORS.error,
    borderWidth: 1.5,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  endButtonLabel: {
    color: COLORS.error,
    fontSize: 16,
    fontWeight: '600',
  },
  tipsSection: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
  },
  tipsTitle: {
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 6,
  },
  tipsText: {
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
});
