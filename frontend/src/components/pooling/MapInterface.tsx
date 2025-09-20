// src/components/pooling/MapInterface.tsx
import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { IconButton, Card, Text, Surface } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

interface MapInterfaceProps {
  pickupLocationName: string;
  destinationName?: string; // --- THIS NEW PROP IS ADDED ---
  onWhereToPress: () => void;
  onRecenterPress: () => void;
  onTogglePitch: () => void;
  mapPitch: 0 | 60;
}

export default function MapInterface({
  pickupLocationName,
  destinationName, // Destructure the new prop
  onWhereToPress,
  onRecenterPress,
  onTogglePitch,
  mapPitch,
}: MapInterfaceProps) {
  return (
    <>
      <View style={styles.pinContainer} pointerEvents="none">
        <Ionicons name="location" size={40} color="#e74c3c" style={styles.pinShadow} />
      </View>

      <View style={styles.rightButtonsContainer} pointerEvents="auto">
        <Surface style={styles.buttonSurface}>
          <IconButton icon={mapPitch === 60 ? 'map-outline' : 'cube-outline'} onPress={onTogglePitch} size={24} iconColor="#333" />
        </Surface>
        <Surface style={styles.buttonSurface}>
          <IconButton icon="crosshairs-gps" onPress={onRecenterPress} size={24} iconColor="#333" />
        </Surface>
      </View>

      <Card style={styles.topCard} pointerEvents="auto">
        <TouchableOpacity onPress={onWhereToPress}>
          <View style={styles.locationRow}>
            <Ionicons name="location-sharp" size={20} color="#3498db" />
            <Text style={styles.locationText} numberOfLines={1}>{pickupLocationName}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.locationRow}>
            <Ionicons name="search" size={20} color="#e74c3c" />
            {/* --- THIS LOGIC IS UPDATED --- */}
            {/* If a destination name exists, show it. Otherwise, show the placeholder. */}
            {destinationName ? (
              <Text style={styles.locationText} numberOfLines={1}>{destinationName}</Text>
            ) : (
              <Text style={styles.placeholderText}>Where to?</Text>
            )}
            {/* ----------------------------- */}
          </View>
        </TouchableOpacity>
      </Card>
    </>
  );
}

const styles = StyleSheet.create({
  pinContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -20 }, { translateY: -40 }],
  },
  pinShadow: {
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  rightButtonsContainer: {
    position: 'absolute',
    top: 180,
    right: 15,
    alignItems: 'center',
  },
  buttonSurface: {
    backgroundColor: '#fff',
    borderRadius: 50,
    marginBottom: 10,
    elevation: 4,
  },
  topCard: {
    position: 'absolute',
    top: 50,
    left: 15,
    right: 15,
    backgroundColor: '#fff',
    elevation: 8,
    padding: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  locationText: {
    marginLeft: 12, color: '#333', fontWeight: '500', flex: 1,
  },
  placeholderText: {
    marginLeft: 12, color: '#888', flex: 1,
  },
  divider: {
    height: 1, backgroundColor: '#eee', marginVertical: 4, marginLeft: 40,
  },
});