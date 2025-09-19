// src/components/services/ApplicantCard.tsx

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Avatar, Button, useTheme } from 'react-native-paper';
import { ServiceApplication } from '../../services/servicesService';

interface ApplicantCardProps {
  application: ServiceApplication;
  onAccept: (applicationId: number) => void;
  onReject: (applicationId: number) => void;
}

export default function ApplicantCard({ application, onAccept, onReject }: ApplicantCardProps) {
  const theme = useTheme();
  const { applicant, status } = application;

  const styles = StyleSheet.create({
    card: {
      marginBottom: 12,
      backgroundColor: theme.colors.background,
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    userInfo: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    avatar: {
      marginRight: 12,
    },
    actions: {
      flexDirection: 'row',
    },
    statusText: {
        fontWeight: 'bold',
        color: status === 'accepted' ? '#34C759' : status === 'rejected' ? theme.colors.error : theme.colors.onSurface
    }
  });

  return (
    <Card style={styles.card}>
      <Card.Content style={styles.content}>
        <View style={styles.userInfo}>
          <Avatar.Icon size={40} icon="account-circle" style={styles.avatar} />
          <Text variant="bodyLarge">{applicant.full_name}</Text>
        </View>
        <View style={styles.actions}>
          {status === 'pending' ? (
            <>
              <Button mode="text" onPress={() => onReject(application.id)}>Reject</Button>
              <Button mode="contained" onPress={() => onAccept(application.id)}>Accept</Button>
            </>
          ) : (
            <Text style={styles.statusText}>{status.charAt(0).toUpperCase() + status.slice(1)}</Text>
          )}
        </View>
      </Card.Content>
    </Card>
  );
}