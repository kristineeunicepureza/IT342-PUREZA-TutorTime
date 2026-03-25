import { DashboardLayout } from '../../components/layouts/DashboardLayout';
import { useApp } from '../../context/AppContext';
import { Bell, CheckCircle, Calendar, XCircle, AlertCircle } from 'lucide-react';

export function NotificationsPage() {
  const { currentUser, notifications, markNotificationAsRead } = useApp();

  if (!currentUser) return null;

  const myNotifications = notifications
    .filter(n => n.userId === currentUser.id)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const handleNotificationClick = (id: string) => {
    markNotificationAsRead(id);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'booking':
        return Calendar;
      case 'approval':
        return CheckCircle;
      case 'cancellation':
        return XCircle;
      default:
        return AlertCircle;
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'booking':
        return '#3B82F6';
      case 'approval':
        return '#10B981';
      case 'cancellation':
        return '#DC2626';
      default:
        return '#F59E0B';
    }
  };

  return (
    <DashboardLayout role={currentUser.role}>
      <div>
        <div className="mb-8">
          <h1 className="text-3xl mb-2" style={{ color: '#002F6C', fontWeight: 600 }}>
            Notifications
          </h1>
          <p style={{ color: '#1E40AF' }}>
            Stay updated with your latest activities
          </p>
        </div>

        {myNotifications.length === 0 ? (
          <div
            className="bg-white rounded-xl p-12 text-center"
            style={{ boxShadow: '0 4px 20px rgba(0, 71, 171, 0.1)' }}
          >
            <Bell size={64} className="mx-auto mb-4" style={{ color: '#93C5FD' }} />
            <h3 className="text-xl mb-2" style={{ color: '#002F6C', fontWeight: 600 }}>
              No Notifications
            </h3>
            <p style={{ color: '#1E40AF' }}>
              You're all caught up! Check back later for updates.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {myNotifications.map(notification => {
              const Icon = getIcon(notification.type);
              const iconColor = getIconColor(notification.type);

              return (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification.id)}
                  className="bg-white rounded-xl p-6 cursor-pointer transition-all"
                  style={{
                    boxShadow: '0 4px 20px rgba(0, 71, 171, 0.1)',
                    opacity: notification.isRead ? 0.7 : 1,
                    borderLeft: notification.isRead ? 'none' : `4px solid ${iconColor}`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateX(4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="p-3 rounded-lg flex-shrink-0"
                      style={{ backgroundColor: `${iconColor}20` }}
                    >
                      <Icon size={24} style={{ color: iconColor }} />
                    </div>
                    <div className="flex-1">
                      <p
                        className="mb-2"
                        style={{
                          color: '#002F6C',
                          fontWeight: notification.isRead ? 400 : 600,
                        }}
                      >
                        {notification.message}
                      </p>
                      <p className="text-sm" style={{ color: '#1E40AF' }}>
                        {new Date(notification.createdAt).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: '#3B82F6' }}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
