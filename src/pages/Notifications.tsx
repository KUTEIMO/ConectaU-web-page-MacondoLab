import { useEffect, useState } from 'react';
import { Bell, CheckCircle, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { getNotifications, markAsRead, markAllAsRead } from '../services/notificationsService';
import { Notification } from '../types';

export default function Notifications() {
  const { currentUser } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      loadNotifications();
    }
  }, [currentUser]);

  const loadNotifications = async () => {
    if (!currentUser) return;
    try {
      const data = await getNotifications(currentUser.uid);
      setNotifications(data);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!currentUser) return;
    try {
      await markAllAsRead(currentUser.uid);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Notificaciones</h1>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="text-sm text-primary hover:underline"
          >
            Marcar todas como leídas
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-4 bg-surface rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-surface rounded w-full mb-2"></div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="card text-center py-12">
          <Bell className="h-16 w-16 text-text-secondary mx-auto mb-4" />
          <p className="text-text-secondary">No tienes notificaciones</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`card ${!notification.isRead ? 'border-l-4 border-l-primary' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold mb-1">{notification.title}</h3>
                      <p className="text-text-secondary text-sm">{notification.message}</p>
                      {notification.data?.companyName && (
                        <p className="text-xs text-text-secondary mt-1">
                          {notification.data.companyName} · {notification.data.jobTitle}
                        </p>
                      )}
                      <p className="text-text-secondary text-xs mt-2">
                        {notification.createdAt.toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="ml-4 p-1 text-text-secondary hover:text-primary"
                        title="Marcar como leída"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  {notification.link && (
                    <Link
                      to={notification.link}
                      className="text-primary text-sm hover:underline mt-2 inline-block"
                    >
                      Ver más →
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

