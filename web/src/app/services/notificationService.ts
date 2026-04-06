import { api } from './apiService';

export interface AppNotification {
  id: number;
  recipientId: number;
  title: string;
  message: string;
  type: 'BOOKING_CREATED' | 'BOOKING_CONFIRMED' | 'BOOKING_CANCELLED'
      | 'BOOKING_REJECTED' | 'TUTOR_REGISTERED' | 'TUTOR_APPROVED'
      | 'SESSION_COMPLETED' | 'SESSION_NO_SHOW_STUDENT' | 'SESSION_NO_SHOW_TUTOR'
      | 'SESSION_CANCELLED';
  referenceId: number | null;
  isRead: boolean;
  createdAt: string;
}

export const notificationService = {
  getAll:         ()                => api.get<AppNotification[]>('/api/notifications/my'),
  getUnreadCount: ()                => api.get<{ count: number }>('/api/notifications/my/unread-count'),
  markOneRead:    (id: number)      => api.patch<string>(`/api/notifications/${id}/read`),
  markAllRead:    ()                => api.patch<string>('/api/notifications/read-all'),
};