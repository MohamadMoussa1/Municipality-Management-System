import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Notification } from '@/types';
import axios from 'axios';
import getCsrfToken from '../lib/utils';
interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  fetchNotifications: (pageNumber: number) => Promise<void>;
  fetchUnreadNotifications: () => Promise<void>;
  clearNotifications: () => void;
  loading: boolean;
  citizenCurrentPage: number;
  citizenLastPage: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);


export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [Clicked, setClicked] = useState(false);
  const [citizenLastPage, setCitizenLastPage] = useState(1);
  const [citizenCurrentPage, setCitizenCurrentPage] = useState(1);
  const unreadCount = notifications.filter(n => !n.read_at).length;
  // Fetch all notifications


  const fetchNotifications = async (pageNumber: number) => {
    setLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/notifications?page=${pageNumber}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
      });
      const res = await response.json();
      // Handle Laravel pagination structure
      if (res.notifications && res.notifications.data) {
        setNotifications(res.notifications.data);
        setCitizenCurrentPage(res.notifications.current_page);
        setCitizenLastPage(res.notifications.last_page);
      } else {
        console.warn('Unexpected API response structure:', res);
        setNotifications([]);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch unread notifications
  const fetchUnreadNotifications = async () => {
    setLoading(true);
    try {

      const response = await axios.get(`http://127.0.0.1:8000/api/notifications/unread`, {
        headers: {
          'Accept': 'application/json',
        },
        withCredentials: true,
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

      await axios.post(
        `http://127.0.0.1:8000/cs/notifications/${id}/read`,
        {},
        {
          headers: {
            'Accept': 'application/json',
            'X-XSRF-TOKEN': getCsrfToken(),
          },
          withCredentials: true,
        }
      );
      // Refetch notifications to get the correct server timestamp
      await fetchNotifications(1);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {

      await axios.post(
        `http://127.0.0.1:8000/cs/notifications/read-all`,
        {},
        {
          headers: {
            'Accept': 'application/json',
            'X-XSRF-TOKEN': getCsrfToken(),
          },
          withCredentials: true,
        }
      );
      // Refetch notifications to get the correct server timestamp
      await fetchNotifications(1);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Delete notification
  const deleteNotification = async (id: string) => {
    try {

      await axios.delete(
        `http://127.0.0.1:8000/cs/notifications/${id}`,
        {
          headers: {
            'Accept': 'application/json',
            'X-XSRF-TOKEN': getCsrfToken(),
          },
          withCredentials: true,
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
  // useEffect(() => {
  //   const token = getAuthToken();
  //   if (token) {
  //     fetchNotifications();
  //   } else {
  //     // Clear notifications if no token (user logged out)
  //     clearNotifications();
  //   }
  // }, []);

  // Monitor token changes to clear notifications on logout
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token' && !e.newValue) {
        // Token was removed (logout)
        clearNotifications();
      } else if (e.key === 'token' && e.newValue) {
        // Token was added (login)
        fetchNotifications(1);
      }
    };

    // Listen for custom login event (for same-tab login)
    const handleLogin = () => {
      fetchNotifications(1);
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
        loading,
        citizenCurrentPage,
        citizenLastPage
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
