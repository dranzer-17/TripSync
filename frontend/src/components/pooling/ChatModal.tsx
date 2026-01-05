// src/components/pooling/ChatModal.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet, FlatList, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Text, Portal, Modal, Card, TextInput, IconButton, Avatar } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { Message, getMessages, sendMessage, markMessagesAsRead } from '../../services/chatService';

const COLORS = {
  primary: '#6A5AE0',
  white: '#FFFFFF',
  text: '#0D0D0D',
  textSecondary: '#6C757D',
  border: '#E9ECEF',
  myMessage: '#6A5AE0',
  theirMessage: '#F1F3F5',
  lightPurple: '#E8E5FA',
};

interface ChatModalProps {
  visible: boolean;
  onDismiss: () => void;
  connectionId: number;
  partnerId: number;
  partnerName: string;
  currentUserId: number;
  token: string;
  onSendMessageViaWebSocket?: (message: any) => void;
}

export default function ChatModal({
  visible,
  onDismiss,
  connectionId,
  partnerId,
  partnerName,
  currentUserId,
  token,
  onSendMessageViaWebSocket,
}: ChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Load messages when modal opens
  const loadMessages = useCallback(async () => {
    try {
      const fetchedMessages = await getMessages(token, connectionId);
      setMessages(fetchedMessages);
      
      // Mark messages as read
      await markMessagesAsRead(token, connectionId);
      
      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error: any) {
      console.error('Failed to load messages:', error);
    }
  }, [token, connectionId]);

  useEffect(() => {
    if (visible) {
      loadMessages();
    }
  }, [visible, loadMessages]);



  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const messageContent = inputText.trim();
    setInputText('');
    setSending(true);

    try {
      // Send via REST API (stores in DB)
      const newMessage = await sendMessage(token, connectionId, messageContent);
      
      // Add to local state
      setMessages((prev) => [...prev, newMessage]);
      
      // Send via WebSocket for real-time delivery
      if (onSendMessageViaWebSocket) {
        onSendMessageViaWebSocket({
          type: 'chat_message',
          connection_id: connectionId,
          content: messageContent,
          receiver_id: partnerId,
          created_at: new Date().toISOString(),
        });
      }

      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to send message');
      setInputText(messageContent); // Restore message
    } finally {
      setSending(false);
    }
  };

  // Add incoming message from WebSocket
  const addIncomingMessage = (message: Message) => {
    setMessages((prev) => {
      // Avoid duplicates
      if (prev.some((m) => m.id === message.id)) {
        return prev;
      }
      return [...prev, message];
    });
    
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  // Expose method to parent
  useEffect(() => {
    if (visible) {
      (ChatModal as any).addIncomingMessage = addIncomingMessage;
    }
  }, [visible, addIncomingMessage]);

  const renderMessage = ({ item }: { item: Message }) => {
    const isMyMessage = item.sender_id === currentUserId;
    
    return (
      <View
        style={[
          styles.messageContainer,
          isMyMessage ? styles.myMessageContainer : styles.theirMessageContainer,
        ]}
      >
        {!isMyMessage && (
          <Avatar.Icon
            size={32}
            icon="account"
            style={styles.avatar}
            color={COLORS.primary}
          />
        )}
        <View
          style={[
            styles.messageBubble,
            isMyMessage ? styles.myMessageBubble : styles.theirMessageBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isMyMessage ? styles.myMessageText : styles.theirMessageText,
            ]}
          >
            {item.content}
          </Text>
          <Text
            style={[
              styles.timeText,
              isMyMessage ? styles.myTimeText : styles.theirTimeText,
            ]}
          >
            {new Date(item.created_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modalContainer}
      >
        <Card style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Avatar.Icon
                size={40}
                icon="account"
                style={styles.headerAvatar}
                color={COLORS.primary}
              />
              <View>
                <Text variant="titleMedium" style={styles.headerTitle}>
                  {partnerName}
                </Text>
                <Text variant="bodySmall" style={styles.headerSubtitle}>
                  Online
                </Text>
              </View>
            </View>
            <IconButton icon="close" onPress={onDismiss} />
          </View>

          {/* Messages */}
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.chatContainer}
            keyboardVerticalOffset={100}
          >
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderMessage}
              contentContainerStyle={styles.messagesList}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={() =>
                flatListRef.current?.scrollToEnd({ animated: true })
              }
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="chatbubbles-outline" size={48} color={COLORS.textSecondary} />
                  <Text style={styles.emptyText}>No messages yet</Text>
                  <Text style={styles.emptySubtext}>Start the conversation!</Text>
                </View>
              }
            />

            {/* Input */}
            <View style={styles.inputContainer}>
              <TextInput
                mode="outlined"
                placeholder="Type a message..."
                value={inputText}
                onChangeText={setInputText}
                style={styles.input}
                multiline
                maxLength={500}
                disabled={sending}
                right={
                  <TextInput.Icon
                    icon={() => (
                      <Ionicons
                        name="send"
                        size={24}
                        color={inputText.trim() ? COLORS.primary : COLORS.textSecondary}
                      />
                    )}
                    onPress={handleSendMessage}
                    disabled={!inputText.trim() || sending}
                  />
                }
              />
            </View>
          </KeyboardAvoidingView>
        </Card>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    margin: 0,
    padding: 0,
  },
  card: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerAvatar: {
    backgroundColor: COLORS.lightPurple,
  },
  headerTitle: {
    fontWeight: '600',
  },
  headerSubtitle: {
    color: COLORS.textSecondary,
  },
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    padding: 16,
    flexGrow: 1,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  myMessageContainer: {
    justifyContent: 'flex-end',
  },
  theirMessageContainer: {
    justifyContent: 'flex-start',
  },
  avatar: {
    backgroundColor: COLORS.lightPurple,
    marginRight: 8,
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
  },
  myMessageBubble: {
    backgroundColor: COLORS.myMessage,
    borderBottomRightRadius: 4,
  },
  theirMessageBubble: {
    backgroundColor: COLORS.theirMessage,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  myMessageText: {
    color: COLORS.white,
  },
  theirMessageText: {
    color: COLORS.text,
  },
  timeText: {
    fontSize: 11,
    marginTop: 4,
  },
  myTimeText: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  theirTimeText: {
    color: COLORS.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  inputContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  input: {
    backgroundColor: COLORS.white,
    maxHeight: 100,
  },
});
