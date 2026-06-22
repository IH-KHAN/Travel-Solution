import React, { createContext, useContext, useEffect, useReducer, useCallback } from 'react';
import type { Notification } from '@/types';

// ── State ────────────────────────────────────────────────────────────────────
interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
}

type NotificationAction =
  | { type: 'ADD'; payload: Omit<Notification, 'id' | 'timestamp' | 'read'> }
  | { type: 'MARK_READ'; payload: string }
  | { type: 'MARK_ALL_READ' }
  | { type: 'REMOVE'; payload: string }
  | { type: 'CLEAR_ALL' };

function reducer(state: NotificationState, action: NotificationAction): NotificationState {
  switch (action.type) {
    case 'ADD': {
      const newNotif: Notification = {
        id: Math.random().toString(36).slice(2),
        timestamp: new Date(),
        read: false,
        ...action.payload,
      };
      const notifications = [newNotif, ...state.notifications].slice(0, 50);
      return { notifications, unreadCount: notifications.filter(n => !n.read).length };
    }
    case 'MARK_READ': {
      const notifications = state.notifications.map(n =>
        n.id === action.payload ? { ...n, read: true } : n
      );
      return { notifications, unreadCount: notifications.filter(n => !n.read).length };
    }
    case 'MARK_ALL_READ': {
      const notifications = state.notifications.map(n => ({ ...n, read: true }));
      return { notifications, unreadCount: 0 };
    }
    case 'REMOVE': {
      const notifications = state.notifications.filter(n => n.id !== action.payload);
      return { notifications, unreadCount: notifications.filter(n => !n.read).length };
    }
    case 'CLEAR_ALL':
      return { notifications: [], unreadCount: 0 };
    default:
      return state;
  }
}

// ── Context ──────────────────────────────────────────────────────────────────
interface NotificationContextValue extends NotificationState {
  addNotification: (n: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

// ── Provider ─────────────────────────────────────────────────────────────────
export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, { notifications: [], unreadCount: 0 });

  const addNotification = useCallback(
    (n: Omit<Notification, 'id' | 'timestamp' | 'read'>) => dispatch({ type: 'ADD', payload: n }),
    []
  );
  const markRead        = useCallback((id: string) => dispatch({ type: 'MARK_READ', payload: id }), []);
  const markAllRead     = useCallback(() => dispatch({ type: 'MARK_ALL_READ' }), []);
  const removeNotification = useCallback((id: string) => dispatch({ type: 'REMOVE', payload: id }), []);
  const clearAll        = useCallback(() => dispatch({ type: 'CLEAR_ALL' }), []);

  return (
    <NotificationContext.Provider
      value={{ ...state, addNotification, markRead, markAllRead, removeNotification, clearAll }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

// ── Hook ─────────────────────────────────────────────────────────────────────
export const useNotifications = (): NotificationContextValue => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used inside <NotificationProvider>');
  return ctx;
};
