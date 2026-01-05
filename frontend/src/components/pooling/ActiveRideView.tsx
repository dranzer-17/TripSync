// src/components/pooling/ActiveRideView.tsx
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Button, Avatar, Card, Divider, Portal, Modal } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { ActiveConnection } from '../../services/poolingService';

const COLORS = {
  primary: '#6A5AE0',
  white: '#FFFFFF',
  error: '#DC3545',
  text: '#0D0D0D',
  textSecondary: '#6C757D',
  border: '#E9ECEF',
  lightPurple: '#E8E5FA',
};

interface ActiveRideViewProps {
  connection: ActiveConnection;
  onEndRide: () => Promise<void>;
  onStartChat: () => void;
}

export default function ActiveRideView({ connection, onEndRide, onStartChat }: ActiveRideViewProps) {
  const [showProfile, setShowProfile] = useState(false);
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
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.statusBadge}>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
            <Text variant="titleMedium" style={styles.statusText}>
              Pooler Matched!
            </Text>
          </View>
        </View>

        {/* Partner Card */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.partnerHeader}>
              <View style={styles.avatarContainer}>
                <Avatar.Icon
                  size={80}
                  icon="account"
                  style={styles.avatar}
                  color={COLORS.primary}
                />
              </View>
              <Text variant="headlineSmall" style={styles.partnerName}>
                {connection.partner.full_name}
              </Text>
              <Button
                mode="text"
                onPress={() => setShowProfile(true)}
                style={styles.viewProfileButton}
                icon={() => <Ionicons name="person-circle" size={18} color={COLORS.primary} />}
              >
                View Profile
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

            {/* Ride Info */}
            <View style={styles.infoSection}>
              <Text variant="titleSmall" style={styles.infoTitle}>
                Ride Information
              </Text>
              <View style={styles.infoRow}>
                <Ionicons name="time" size={20} color={COLORS.textSecondary} />
                <Text variant="bodyMedium" style={styles.infoText}>
                  Connected since {new Date(connection.created_at).toLocaleTimeString()}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Tips Section */}
        <Card style={styles.tipsCard}>
          <Card.Content>
            <Text variant="titleSmall" style={styles.tipsTitle}>
              💡 Ride Tips
            </Text>
            <Text variant="bodySmall" style={styles.tipsText}>
              • Communicate your exact pickup location{'\n'}
              • Share your live location for safety{'\n'}
              • Split costs fairly with your partner{'\n'}
              • Rate your experience after the ride
            </Text>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Profile Modal */}
      <Portal>
        <Modal
          visible={showProfile}
          onDismiss={() => setShowProfile(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Card style={styles.profileCard}>
            <Card.Content>
              <View style={styles.modalHeader}>
                <Text variant="headlineSmall" style={styles.modalTitle}>
                  Partner Details
                </Text>
                <Button onPress={() => setShowProfile(false)}>
                  <Ionicons name="close" size={24} color={COLORS.text} />
                </Button>
              </View>

              <Divider style={styles.divider} />

              <View style={styles.detailsContainer}>
                <DetailRow
                  icon="person"
                  label="Name"
                  value={connection.partner.full_name}
                />
                {connection.partner.phone_number && (
                  <DetailRow
                    icon="call"
                    label="Phone"
                    value={connection.partner.phone_number}
                  />
                )}
                {connection.partner.email && (
                  <DetailRow
                    icon="mail"
                    label="Email"
                    value={connection.partner.email}
                  />
                )}
                {connection.partner.year_of_study && (
                  <DetailRow
                    icon="school"
                    label="Year"
                    value={connection.partner.year_of_study}
                  />
                )}
                {connection.partner.bio && (
                  <DetailRow
                    icon="information-circle"
                    label="Bio"
                    value={connection.partner.bio}
                  />
                )}
              </View>
            </Card.Content>
          </Card>
        </Modal>
      </Portal>
    </View>
  );
}

function DetailRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailIcon}>
        <Ionicons name={icon as any} size={22} color={COLORS.primary} />
      </View>
      <View style={styles.detailContent}>
        <Text variant="bodySmall" style={styles.detailLabel}>
          {label}
        </Text>
        <Text variant="bodyLarge" style={styles.detailValue}>
          {value}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightPurple,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  statusText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  card: {
    marginBottom: 16,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  partnerHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    marginBottom: 12,
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    borderRadius: 40,
  },
  avatar: {
    backgroundColor: COLORS.lightPurple,
  },
  partnerName: {
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  viewProfileButton: {
    marginTop: 4,
  },
  divider: {
    marginVertical: 16,
  },
  actions: {
    gap: 12,
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
    height: 50,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  endButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.error,
  },
  infoSection: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
  },
  infoTitle: {
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    color: COLORS.textSecondary,
  },
  tipsCard: {
    borderRadius: 16,
    backgroundColor: COLORS.lightPurple,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  tipsTitle: {
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 12,
  },
  tipsText: {
    color: COLORS.text,
    lineHeight: 22,
  },
  modalContainer: {
    margin: 20,
  },
  profileCard: {
    borderRadius: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontWeight: 'bold',
    color: COLORS.text,
  },
  detailsContainer: {
    gap: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.lightPurple,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  detailValue: {
    color: COLORS.text,
    fontWeight: '500',
  },
});
