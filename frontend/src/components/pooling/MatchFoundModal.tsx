// src/components/pooling/MatchFoundModal.tsx
import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Button, Portal, Modal, Card } from 'react-native-paper';
import { MatchedUser } from '../../services/poolingService';
import MatchedUserCard from './MatchedUserCard';

interface MatchFoundModalProps {
  visible: boolean;
  matches: MatchedUser[];
  onNewSearch: () => void;
}

export default function MatchFoundModal({ visible, matches, onNewSearch }: MatchFoundModalProps) {
  const hasMatches = matches.length > 0;
  const title = hasMatches
    ? `Found ${matches.length} ${matches.length === 1 ? 'Match' : 'Matches'}`
    : 'No Matches Found';

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onNewSearch} contentContainerStyle={styles.modalContainer}>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="headlineSmall" style={styles.title}>{title}</Text>
            {hasMatches ? (
              <FlatList
                data={matches}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => <MatchedUserCard user={item} />}
              />
            ) : (
              <Text style={styles.noMatchText}>
                No active poolers were found nearby. Try searching again in a few moments.
              </Text>
            )}
          </Card.Content>
          <Card.Actions>
            <Button mode="contained" onPress={onNewSearch} style={{ flex: 1 }}>
              Start a New Search
            </Button>
          </Card.Actions>
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
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  card: {
    width: '100%',
    maxHeight: '80%',
  },
  title: {
    marginBottom: 20,
    textAlign: 'center',
  },
  noMatchText: {
    textAlign: 'center',
    marginBottom: 20,
  },
});