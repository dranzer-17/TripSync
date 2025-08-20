// src/components/pooling/MatchedUserCard.tsx
import React from 'react';
import { Card, Text, Button, Avatar } from 'react-native-paper';
import { MatchedUser } from '../../services/poolingService';

interface MatchedUserCardProps {
  user: MatchedUser;
}

export default function MatchedUserCard({ user }: MatchedUserCardProps) {
  return (
    <Card style={{ marginBottom: 15 }}>
      <Card.Title
        title={user.full_name}
        left={(props) => <Avatar.Icon {...props} icon="account" />}
      />
      <Card.Actions>
        <Button onPress={() => console.log('Chat with', user.full_name)}>
          Chat
        </Button>
      </Card.Actions>
    </Card>
  );
}