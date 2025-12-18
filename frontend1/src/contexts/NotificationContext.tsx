import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Notification } from '@/types';
import axios from 'axios';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  fetchNotifications: () => Promise<void>;
  fetchUnreadNotifications: () => Promise<void>;
  clearNotifications: () => void;
  loading: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const API_BASE_URL = 'http://127.0.0.1:8000/api';

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const unreadCount = notifications.filter(n => !n.read_at).length;

  // Get auth token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  // Fetch all notifications
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      const response = await axios.get(`${API_BASE_URL}/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setNotifications(response.data.notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch unread notifications
  const fetchUnreadNotifications = async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      const response = await axios.get(`${API_BASE_URL}/notifications/unread`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setNotifications(response.data.notifications);
    } catch (error) {
      console.error('Error fetching unread notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mark a specific notification as read
  const markAsRead = async (id: string) => {
    try {
      const token = getAuthToken();
      await axios.post(
        `${API_BASE_URL}/notifications/${id}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Refetch notifications to get the correct server timestamp
      await fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const token = getAuthToken();
      await axios.post(
        `${API_BASE_URL}/notifications/read-all`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Refetch notifications to get the correct server timestamp
      await fetchNotifications();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Delete notification
  const deleteNotification = async (id: string) => {
    try {
      const token = getAuthToken();
      await axios.delete(
        `${API_BASE_URL}/notifications/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Update local state
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Clear all notifications (used on logout)
  const clearNotifications = () => {
    setNotifications([]);
  };

  // Fetch notifications on mount and when token changes
  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      fetchNotifications();
    } else {
      // Clear notifications if no token (user logged out)
      clearNotifications();
    }
  }, []);

  // Monitor token changes to clear notifications on logout
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token' && !e.newValue) {
        // Token was removed (logout)
        clearNotifications();
      } else if (e.key === 'token' && e.newValue) {
        // Token was added (login)
        fetchNotifications();
      }
    };

    // Listen for custom login event (for same-tab login)
    const handleLogin = () => {
      fetchNotifications();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userLoggedIn', handleLogin);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userLoggedIn', handleLogin);
    };
  }, []);

  return (
    <NotificationContext.Provider 
      value={{ 
        notifications, 
        unreadCount, 
        markAsRead, 
        markAllAsRead, 
        deleteNotification,
        fetchNotifications,
        fetchUnreadNotifications,
        clearNotifications,
        loading 
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within NotificationProvider');
  return context;
}
