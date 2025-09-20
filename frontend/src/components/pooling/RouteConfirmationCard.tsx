// src/components/pooling/RouteConfirmationCard.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { RouteDetails } from '../../services/poolingService';

interface RouteConfirmationCardProps {
  destinationName: string;
  routeDetails: RouteDetails;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function RouteConfirmationCard({
  destinationName,
  routeDetails,
  onConfirm,
  onCancel,
}: RouteConfirmationCardProps) {
  // Helper to format the time and distance for display
  const distanceInKm = (routeDetails.distance_meters / 1000).toFixed(1);
  const durationInMinutes = Math.round(routeDetails.duration_seconds / 60);

  return (
    <Card style={styles.card} elevation={5}>
      <Card.Title
        title={destinationName}
        titleVariant="titleLarge"
        right={(props) => <Button {...props} onPress={onCancel}>Cancel</Button>}
      />
      <Card.Content>
        <View style={styles.detailsRow}>
          <Ionicons name="map" size={20} color="#888" />
          <Text style={styles.detailText}>{distanceInKm} km</Text>
          <Ionicons name="time" size={20} color="#888" style={{ marginLeft: 20 }}/>
          <Text style={styles.detailText}>Approx. {durationInMinutes} mins</Text>
        </View>
        <Button
          mode="contained"
          onPress={onConfirm}
          style={styles.confirmButton}
          labelStyle={{ fontSize: 16 }}
        >
          Confirm & Find Matches
        </Button>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    bottom: 20,
    left: 15,
    right: 15,
    backgroundColor: '#fff',
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  confirmButton: {
    paddingVertical: 5,
  },
});