import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layouts/DashboardLayout';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/apiService';
import { Calendar, User, BookOpen, Clock, Trash2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface Booking {
  id: number; studentName: string; tutorName: string;
  subject: string; notes: string; status: string;
  scheduledTime: string; createdAt: string;
}

const statusStyle: Record<string, React.CSSProperties> = {
  PENDING:   { background: '#FFFBEB', color: '#D97706' },
  CONFIRMED: { background: '#EFF6FF', color: '#2563EB' },
  COMPLETED: { background: '#ECFDF5', color: '#059669' },
  CANCELLED: { background: '#FEF2F2', color: '#DC2626' },
};
const accentLine: Record<string, string> = {
  PENDING: '#F59E0B', CONFIRMED: '#3B82F6', COMPLETED: '#10B981', CANCELLED: '#DC2626',
};

export function MyBookings() {
  const { currentUser } = useApp();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [cancelling, setCancelling] = useState<number | null>(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const data = await api.get<Booking[]>('/api/bookings/my-bookings');
      setBookings(data);
    } catch (e: any) {
      toast.error(e.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleCancel = async (id: number) => {
    if (!confirm('Cancel this booking? This cannot be undone.')) return;
    setCancelling(id);
    try {
      await api.patch(`/api/bookings/${id}/cancel`);
      toast.success('Booking cancelled.');
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'CANCELLED' } : b));
    } catch (e: any) {
      toast.error(e.message || 'Failed to cancel booking');
    } finally {
      setCancelling(null);
    }
  };

  if (!currentUser) return null;

  return (
    <DashboardLayout role="STUDENT">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ color: '#001a4d', fontWeight: 800, fontSize: '24px', letterSpacing: '-0.5px', marginBottom: '4px' }}>My Bookings</h1>
          <p style={{ color: '#5a7bad', fontSize: '14px' }}>Your tutoring session history and upcoming bookings.</p>
        </div>
        <button onClick={fetchBookings} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', borderRadius: '10px', background: '#EFF6FF', border: '1px solid #BFDBFE', color: '#2563EB', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>Loading bookings…</div>
      ) : bookings.length === 0 ? (
        <div style={{ background: 'white', borderRadius: '16px', padding: '60px 24px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,47,108,0.07)' }}>
          <Calendar size={56} style={{ color: '#BFDBFE', margin: '0 auto 16px' }} />
          <h3 style={{ color: '#001a4d', fontWeight: 700, fontSize: '18px', marginBottom: '8px' }}>No Bookings Yet</h3>
          <p style={{ color: '#5a7bad', fontSize: '14px' }}>Browse tutors and book your first session to get started.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {bookings.map(b => (
            <div key={b.id} style={{ background: 'white', borderRadius: '14px', padding: '20px 22px', boxShadow: '0 4px 16px rgba(0,47,108,0.06)', border: '1px solid rgba(59,130,246,0.08)', borderLeft: `4px solid ${accentLine[b.status] || '#e0eaff'}`, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '14px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg,#3B82F6,#0047AB)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <User size={18} color="white" />
                  </div>
                  <div>
                    <div style={{ color: '#001a4d', fontWeight: 700, fontSize: '15px' }}>{b.tutorName}</div>
                    <div style={{ color: '#94a3b8', fontSize: '12px' }}>Tutor</div>
                  </div>
                  <span style={{ marginLeft: 'auto', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, ...statusStyle[b.status] }}>
                    {b.status.charAt(0) + b.status.slice(1).toLowerCase()}
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px', color: '#5a7bad', fontSize: '13px' }}>
                    <BookOpen size={14} color="#93C5FD" />
                    <span><strong style={{ color: '#1e3a6e' }}>Subject:</strong> {b.subject}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px', color: '#5a7bad', fontSize: '13px' }}>
                    <Calendar size={14} color="#93C5FD" />
                    <span><strong style={{ color: '#1e3a6e' }}>Date:</strong> {new Date(b.scheduledTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px', color: '#5a7bad', fontSize: '13px' }}>
                    <Clock size={14} color="#93C5FD" />
                    <span><strong style={{ color: '#1e3a6e' }}>Time:</strong> {new Date(b.scheduledTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  {b.notes && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '7px', color: '#5a7bad', fontSize: '13px' }}>
                      <span style={{ flexShrink: 0 }}>📝</span>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.notes}</span>
                    </div>
                  )}
                </div>
              </div>

              {(b.status === 'PENDING' || b.status === 'CONFIRMED') && (
                <button onClick={() => handleCancel(b.id)} disabled={cancelling === b.id}
                  style={{ padding: '8px', borderRadius: '9px', border: '1px solid #FCA5A5', background: '#FEF2F2', color: '#DC2626', cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0 }}
                  title="Cancel booking"
                  onMouseEnter={e => e.currentTarget.style.background = '#FECACA'}
                  onMouseLeave={e => e.currentTarget.style.background = '#FEF2F2'}
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}