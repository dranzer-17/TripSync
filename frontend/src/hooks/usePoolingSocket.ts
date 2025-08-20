// src/hooks/usePoolingSocket.ts

import { useState, useEffect, useRef } from 'react';
import { MatchedUser } from '../services/poolingService';
import { API_BASE_URL } from '../constants/config';

// Define the shape of the message we expect from the server
interface WebSocketMessage {
  type: 'match_found';
  match: MatchedUser;
}

export function usePoolingSocket(token: string | null) {
  const [isConnected, setIsConnected] = useState(false);
  const [match, setMatch] = useState<MatchedUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // useRef is used to hold a reference to the WebSocket object itself.
  // This prevents it from being recreated on every component re-render.
  const socketRef = useRef<WebSocket | null>(null);

  // This function will be called by our UI to start the connection
  const connect = () => {
    if (!token) {
      setError('Cannot connect without an authentication token.');
      return;
    }
    if (socketRef.current) {
      console.log('WebSocket already connected.');
      return;
    }

    // Convert the http:// URL to a ws:// URL
    const wsUrl = API_BASE_URL.replace(/^http/, 'ws').replace('/api', '/api/ws/pool');
    console.log('Connecting to WebSocket:', wsUrl);

    // --- Create the WebSocket connection ---
    // We pass the token in the subprotocol array, as our backend expects.
    const ws = new WebSocket(wsUrl, ['token', token]);
    socketRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connection opened.');
      setIsConnected(true);
      setError(null);
    };

    ws.onmessage = (event) => {
      console.log('Received message from server:', event.data);
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        if (message.type === 'match_found') {
          setMatch(message.match); // A match has been found!
        }
      } catch (e) {
        console.error('Failed to parse WebSocket message:', e);
      }
    };

    ws.onerror = (e) => {
      console.error('WebSocket error:', e);
      setError('A connection error occurred.');
      setIsConnected(false);
    };

    ws.onclose = (e) => {
      console.log('WebSocket connection closed:', e.code, e.reason);
      setIsConnected(false);
      socketRef.current = null; // Clean up the ref
    };
  };

  // This function will be called by our UI to close the connection
  const disconnect = () => {
    if (socketRef.current) {
      socketRef.current.close();
    }
  };

  // This useEffect ensures that if the component using the hook unmounts,
  // the WebSocket connection is cleanly closed.
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  return { isConnected, match, error, connect, disconnect };
}