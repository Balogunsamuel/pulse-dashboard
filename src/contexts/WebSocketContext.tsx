import { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from 'react';

export type WebSocketStatus = 'connecting' | 'connected' | 'disconnecting' | 'disconnected' | 'error';

export type WebSocketChannel =
  | 'transactions'
  | 'prices'
  | 'security'
  | 'user_activity'
  | 'system'
  | 'notifications';

export interface WebSocketMessage<T = any> {
  type: string;
  channel?: WebSocketChannel;
  data: T;
  timestamp: string;
}

interface Subscription {
  channel: WebSocketChannel;
  callback: (data: any) => void;
}

interface WebSocketContextType {
  status: WebSocketStatus;
  subscribe: (channel: WebSocketChannel, callback: (data: any) => void) => () => void;
  unsubscribe: (channel: WebSocketChannel, callback: (data: any) => void) => void;
  send: (message: any) => void;
  connect: () => void;
  disconnect: () => void;
  reconnect: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

interface WebSocketProviderProps {
  children: ReactNode;
  url?: string;
  autoConnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
}

export function WebSocketProvider({
  children,
  url = `${import.meta.env.VITE_WS_URL || 'ws://localhost:3000'}/ws`,
  autoConnect = true,
  reconnectInterval = 3000,
  maxReconnectAttempts = 5,
  heartbeatInterval = 30000,
}: WebSocketProviderProps) {
  const [status, setStatus] = useState<WebSocketStatus>('disconnected');
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const heartbeatTimerRef = useRef<NodeJS.Timeout>();
  const reconnectTimerRef = useRef<NodeJS.Timeout>();
  const isManualDisconnect = useRef(false);

  const connect = useCallback(() => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setStatus('connecting');
    isManualDisconnect.current = false;

    try {
      const socket = new WebSocket(url);
      socketRef.current = socket;

      socket.onopen = () => {
        console.log('WebSocket connected');
        setStatus('connected');
        reconnectAttemptsRef.current = 0;

        // Start heartbeat
        if (heartbeatInterval > 0) {
          heartbeatTimerRef.current = setInterval(() => {
            if (socket.readyState === WebSocket.OPEN) {
              socket.send(JSON.stringify({ type: 'ping' }));
            }
          }, heartbeatInterval);
        }

        // Resubscribe to channels
        subscriptions.forEach(sub => {
          socket.send(JSON.stringify({
            type: 'subscribe',
            channel: sub.channel,
          }));
        });
      };

      socket.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);

          // Ignore pong messages
          if (message.type === 'pong') {
            return;
          }

          // Route message to subscribers
          if (message.channel) {
            subscriptions
              .filter(sub => sub.channel === message.channel)
              .forEach(sub => sub.callback(message.data));
          }

          // Global message handler
          subscriptions
            .filter(sub => sub.channel === 'system')
            .forEach(sub => sub.callback(message));

        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        setStatus('error');
      };

      socket.onclose = () => {
        console.log('WebSocket disconnected');
        setStatus('disconnected');

        // Clear heartbeat
        if (heartbeatTimerRef.current) {
          clearInterval(heartbeatTimerRef.current);
        }

        // Attempt reconnect if not manual disconnect
        if (
          !isManualDisconnect.current &&
          reconnectAttemptsRef.current < maxReconnectAttempts
        ) {
          reconnectAttemptsRef.current++;
          console.log(`Reconnecting... (Attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts})`);

          reconnectTimerRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        }
      };

    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      setStatus('error');
    }
  }, [url, heartbeatInterval, maxReconnectAttempts, reconnectInterval, subscriptions]);

  const disconnect = useCallback(() => {
    isManualDisconnect.current = true;
    setStatus('disconnecting');

    if (heartbeatTimerRef.current) {
      clearInterval(heartbeatTimerRef.current);
    }

    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
    }

    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }

    setStatus('disconnected');
  }, []);

  const reconnect = useCallback(() => {
    disconnect();
    setTimeout(() => {
      reconnectAttemptsRef.current = 0;
      connect();
    }, 100);
  }, [connect, disconnect]);

  const send = useCallback((message: any) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected. Message not sent:', message);
    }
  }, []);

  const subscribe = useCallback((channel: WebSocketChannel, callback: (data: any) => void) => {
    const subscription: Subscription = { channel, callback };

    setSubscriptions(prev => {
      const exists = prev.some(s => s.channel === channel && s.callback === callback);
      if (exists) return prev;
      return [...prev, subscription];
    });

    // Send subscribe message if connected
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      send({ type: 'subscribe', channel });
    }

    // Return unsubscribe function
    return () => {
      setSubscriptions(prev => prev.filter(s => !(s.channel === channel && s.callback === callback)));

      // Send unsubscribe message if connected
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        send({ type: 'unsubscribe', channel });
      }
    };
  }, [send]);

  const unsubscribe = useCallback((channel: WebSocketChannel, callback: (data: any) => void) => {
    setSubscriptions(prev => prev.filter(s => !(s.channel === channel && s.callback === callback)));

    if (socketRef.current?.readyState === WebSocket.OPEN) {
      send({ type: 'unsubscribe', channel });
    }
  }, [send]);

  // Auto connect on mount
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, []);

  const value: WebSocketContextType = {
    status,
    subscribe,
    unsubscribe,
    send,
    connect,
    disconnect,
    reconnect,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
}

// Specialized hooks for specific channels
export function useWebSocketChannel<T = any>(
  channel: WebSocketChannel,
  callback: (data: T) => void,
  enabled = true
) {
  const { subscribe } = useWebSocket();

  useEffect(() => {
    if (!enabled) return;

    const unsubscribe = subscribe(channel, callback);
    return unsubscribe;
  }, [channel, callback, enabled, subscribe]);
}

export function useLiveTransactions(callback: (transaction: any) => void) {
  useWebSocketChannel('transactions', callback);
}

export function useLivePrices(callback: (prices: any) => void) {
  useWebSocketChannel('prices', callback);
}

export function useLiveSecurityEvents(callback: (event: any) => void) {
  useWebSocketChannel('security', callback);
}

export function useLiveNotifications(callback: (notification: any) => void) {
  useWebSocketChannel('notifications', callback);
}
