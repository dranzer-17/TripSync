// src/app/(main)/chat.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet, FlatList, KeyboardAvoidingView, Platform, TouchableOpacity, SafeAreaView } from 'react-native';
import { Text, TextInput, Avatar } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Message, getMessages, sendMessage, markMessagesAsRead, findOrCreateConversation } from '../../services/chatService';
import { useAuth } from '../../context/AuthContext';

const COLORS = {
  primary: '#6A5AE0',
  white: '#FFFFFF',
  text: '#0D0D0D',
  textSecondary: '#6C757D',
  border: '#E9ECEF',
  myMessage: '#6A5AE0',
  theirMessage: '#F1F3F5',
  lightPurple: '#E8E5FA',
  background: '#F8F9FA',
};

export default function ChatScreen() {
  const router = useRouter();
  const { token, user } = useAuth();
  const params = useLocalSearchParams<{
    conversationId?: string;
    partnerId: string;
    partnerName: string;
  }>();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const partnerId = parseInt(params.partnerId || '0');
  const partnerName = params.partnerName || 'Partner';
  const initialConversationId = params.conversationId ? parseInt(params.conversationId) : null;

  // Find or create conversation on mount
  useEffect(() => {
    const initializeConversation = async () => {
      if (!token || !user || !partnerId) {
        setLoading(false);
        return;
      }

      try {
        let convId = initialConversationId;
        
        // If no conversation ID provided, find or create one
        if (!convId) {
          const conversation = await findOrCreateConversation(token, partnerId);
          convId = conversation.conversation_id;
        }
        
        setConversationId(convId);
        setLoading(false);
      } catch (error) {
        console.error('Failed to initialize conversation:', error);
        setLoading(false);
      }
    };

    initializeConversation();
  }, [token, user, partnerId, initialConversationId]);

  // Load messages function
  const loadMessages = useCallback(async () => {
    if (!token || !conversationId) return;
    
    try {
      const fetchedMessages = await getMessages(token, conversationId);
      setMessages(fetchedMessages);
      await markMessagesAsRead(token, conversationId);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 100);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  }, [token, conversationId]);

  // Load messages when conversation is ready
  useEffect(() => {
    if (conversationId) {
      loadMessages();
    }
  }, [conversationId, loadMessages]);

  // Polling: Fetch messages every 2 seconds when screen is focused
  useFocusEffect(
    useCallback(() => {
      if (!conversationId) return;

      // Load immediately
      loadMessages();

      // Set up polling every 2 seconds
      pollingIntervalRef.current = setInterval(() => {
        loadMessages();
      }, 2000);

      // Cleanup on unmount or when screen loses focus
      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      };
    }, [conversationId, loadMessages])
  );

  const handleSendMessage = async (messageText?: string) => {
    const messageContent = messageText || inputText.trim();
    if (!messageContent || !token || !user || !partnerId) return;

    setInputText('');
    setSending(true);

    try {
      const newMessage = await sendMessage(token, partnerId, messageContent);
      
      // Update conversation ID if it was just created
      if (!conversationId && newMessage.conversation_id) {
        setConversationId(newMessage.conversation_id);
      }
      
      setMessages((prev) => [...prev, newMessage]);

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Failed to send message:', error);
      if (!messageText) {
        setInputText(messageContent);
      }
    } finally {
      setSending(false);
    }
  };

  const quickMessages = [
    "Where are you?",
    "I'm on my way",
    "See you soon",
    "Running late",
    "I'm here"
  ];

  const renderMessage = ({ item }: { item: Message }) => {
    if (!user) return null;
    const isMyMessage = item.sender_id === user.id;
    
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
          <Text style={[styles.messageText, isMyMessage && styles.myMessageText]}>
            {item.content}
          </Text>
          <Text style={[styles.timeText, isMyMessage && styles.myTimeText]}>
            {new Date(item.created_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading conversation...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/(main)/chats')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Avatar.Icon
            size={40}
            icon="account"
            style={styles.headerAvatar}
            color={COLORS.primary}
          />
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>{partnerName}</Text>
            <Text style={styles.headerSubtitle}>Active now</Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerActionButton}>
            <Ionicons name="videocam" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerActionButton}>
            <Ionicons name="call" size={22} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.chatContainer}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubbles-outline" size={64} color={COLORS.textSecondary} />
              <Text style={styles.emptyText}>No messages yet</Text>
              <Text style={styles.emptySubtext}>Start the conversation!</Text>
            </View>
          }
        />

        {/* Quick Message Pills */}
        {inputText.length === 0 && (
          <View style={styles.quickMessagesContainer}>
            <FlatList
              data={quickMessages}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.quickMessagesList}
              keyExtractor={(item, index) => `quick-${index}`}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.quickMessagePill}
                  onPress={() => handleSendMessage(item)}
                  disabled={sending}
                >
                  <Text style={styles.quickMessageText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        {/* Input */}
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.emojiButton}>
            <Ionicons name="happy-outline" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>
          
          <TextInput
            mode="flat"
            placeholder="Type a message..."
            value={inputText}
            onChangeText={setInputText}
            style={styles.input}
            multiline
            maxLength={500}
            disabled={sending}
            underlineColor="transparent"
            activeUnderlineColor="transparent"
          />
          
          <TouchableOpacity
            style={[
              styles.sendButton,
              inputText.trim() && styles.sendButtonActive
            ]}
            onPress={() => handleSendMessage()}
            disabled={!inputText.trim() || sending}
          >
            <Ionicons
              name="send"
              size={20}
              color={inputText.trim() ? COLORS.white : COLORS.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    backgroundColor: COLORS.lightPurple,
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerActionButton: {
    padding: 4,
  },
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    padding: 16,
    paddingBottom: 8,
    flexGrow: 1,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
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
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
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
    fontSize: 16,
    lineHeight: 22,
    color: COLORS.text,
  },
  myMessageText: {
    color: COLORS.white,
  },
  timeText: {
    fontSize: 11,
    marginTop: 4,
    color: COLORS.textSecondary,
  },
  myTimeText: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  emojiButton: {
    padding: 8,
    marginRight: 4,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonActive: {
    backgroundColor: COLORS.primary,
  },
  quickMessagesContainer: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  quickMessagesList: {
    paddingHorizontal: 4,
    gap: 8,
  },
  quickMessagePill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.lightPurple,
    borderRadius: 20,
    marginRight: 8,
  },
  quickMessageText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
});
