// src/components/pooling/MatchFoundModal.tsx
import React, { useCallback } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Button, Portal, Modal, Card } from 'react-native-paper';
import { MatchedUser } from '../../services/poolingService';
import MatchedUserCard from './MatchedUserCard';

const COLORS = {
  primary: '#6A5AE0',
  white: '#FFFFFF',
};

interface MatchFoundModalProps {
  visible: boolean;
  matches: MatchedUser[];
  onNewSearch: () => void;
  onSendRequest: (requestId: number) => Promise<void>;
  onApprove: (connectionId: number) => Promise<void>;
  onReject: (connectionId: number) => Promise<void>;
}

export default function MatchFoundModal({ 
  visible, 
  matches, 
  onNewSearch,
  onSendRequest,
  onApprove,
  onReject
}: MatchFoundModalProps) {
  const hasMatches = matches.length > 0;
  const title = hasMatches
    ? `Found ${matches.length} ${matches.length === 1 ? 'Match' : 'Matches'}`
    : 'No Matches Found';

  const handleClose = useCallback(() => {
    console.log('MatchFoundModal - Close button pressed');
    onNewSearch();
  }, [onNewSearch]);

  return (
    <Portal>
      <Modal 
        visible={visible} 
        onDismiss={handleClose}
        dismissable={true}
        contentContainerStyle={styles.modalContainer}
      >
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.header}>
              <Text variant="headlineSmall" style={styles.title}>{title}</Text>
              <Button 
                icon="close" 
                onPress={handleClose}
                style={styles.closeButton}
              >
                
              </Button>
            </View>
            {hasMatches ? (
              <FlatList
                data={matches}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <MatchedUserCard 
                    user={item}
                    onSendRequest={onSendRequest}
                    onApprove={onApprove}
                    onReject={onReject}
                  />
                )}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <Text style={styles.noMatchText}>
                No active poolers were found nearby. Try searching again in a few moments.
              </Text>
            )}
          </Card.Content>
          <Card.Actions>
            <Button 
              mode="contained" 
              onPress={onNewSearch} 
              style={styles.button}
            >
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
    backgroundColor: COLORS.white,
    borderRadius: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  closeButton: {
    margin: 0,
    marginRight: -8,
  },
  title: {
    flex: 1,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  noMatchText: {
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  button: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
});