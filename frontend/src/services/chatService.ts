// src/services/chatService.ts

import apiClient from './api';

export interface Message {
  id: number;
  connection_id: number;
  sender_id: number;
  sender_name: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

export interface MessageListResponse {
  messages: Message[];
}

export const sendMessage = async (
  token: string,
  connectionId: number,
  content: string
): Promise<Message> => {
  try {
    const response = await apiClient.post(
      '/chat/messages',
      {
        connection_id: connectionId,
        content: content,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error: any) {
    console.error('Send message error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.detail || 'Failed to send message.');
  }
};

export const getMessages = async (
  token: string,
  connectionId: number
): Promise<Message[]> => {
  try {
    const response = await apiClient.get<MessageListResponse>(
      `/chat/messages/${connectionId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data.messages;
  } catch (error: any) {
    console.error('Get messages error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.detail || 'Failed to fetch messages.');
  }
};

export const markMessagesAsRead = async (
  token: string,
  connectionId: number
): Promise<void> => {
  try {
    await apiClient.post(
      `/chat/messages/${connectionId}/read`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
  } catch (error: any) {
    console.error('Mark as read error:', error.response?.data || error.message);
  }
};

export interface ConversationPartner {
  id: number;
  full_name: string;
  phone_number: string | null;
  email: string;
  year_of_study: number | null;
  bio: string | null;
  request_id: number;
}

export interface LastMessage {
  content: string;
  created_at: string;
  sender_id: number;
}

export interface Conversation {
  connection_id: number;
  partner: ConversationPartner;
  last_message: LastMessage | null;
  unread_count: number;
}

export const getRecentConversations = async (
  token: string
): Promise<Conversation[]> => {
  try {
    const response = await apiClient.get<{ conversations: Conversation[] }>(
      '/chat/conversations',
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data.conversations;
  } catch (error: any) {
    console.error('Get conversations error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.detail || 'Failed to fetch conversations.');
  }
};
