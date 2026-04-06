import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layouts/DashboardLayout';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/apiService';
import {
  Calendar, User, BookOpen, Clock, MapPin, RefreshCw,
  XCircle, Loader2, Ban, UserX,
} from 'lucide-react';
import { toast } from 'sonner';

interface Booking {
  id: number; studentName: string; tutorName: string;
  subject: string; location?: string; notes: string; status: string;
  scheduledTime: string; createdAt: string;
  cancellationReason?: string; rejectionReason?: string;
}

const statusStyle: Record<string, React.CSSProperties> = {
  PENDING:         { background: '#FFFBEB', color: '#D97706' },
  CONFIRMED:       { background: '#EFF6FF', color: '#2563EB' },
  COMPLETED:       { background: '#ECFDF5', color: '#059669' },
  CANCELLED:       { background: '#FEF2F2', color: '#DC2626' },
  REJECTED:        { background: '#FEF2F2', color: '#DC2626' },
  NO_SHOW_STUDENT: { background: '#FFF7ED', color: '#C2410C' },
  NO_SHOW_TUTOR:   { background: '#FFF7ED', color: '#C2410C' },
};
const accentLine: Record<string, string> = {
  PENDING: '#F59E0B', CONFIRMED: '#3B82F6', COMPLETED: '#10B981',
  CANCELLED: '#DC2626', REJECTED: '#DC2626',
  NO_SHOW_STUDENT: '#F97316', NO_SHOW_TUTOR: '#F97316',
};

type StudentAction = 'cancel' | 'no_show_tutor';

const actionConfig: Record<StudentAction, {
  label: string; desc: string; icon: React.ElementType;
  color: string; bg: string; confirmBg: string;
}> = {
  cancel: {
    label: 'Cancel Session',
    desc: 'The tutor will be notified of the cancellation.',
    icon: Ban,
    color: '#DC2626',
    bg: 'linear-gradient(135deg,#EF4444,#B91C1C)',
    confirmBg: '0 4px 14px rgba(220,38,38,0.35)',
  },
  no_show_tutor: {
    label: 'Tutor No-Show',
    desc: 'Report that the tutor did not attend this session.',
    icon: UserX,
    color: '#C2410C',
    bg: 'linear-gradient(135deg,#F97316,#C2410C)',
    confirmBg: '0 4px 14px rgba(194,65,12,0.35)',
  },
};

export function MyBookings() {
  const { currentUser } = useApp();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [acting,   setActing]   = useState<number | null>(null);

  const [actionModal,  setActionModal]  = useState<{ id: number; action: StudentAction } | null>(null);
  const [actionReason, setActionReason] = useState('');

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

  const handleActionSubmit = async () => {
    if (!actionModal) return;
    const { id, action } = actionModal;
    const endpointMap: Record<StudentAction, string> = {
      cancel:       `/api/bookings/${id}/cancel`,
      no_show_tutor: `/api/bookings/${id}/no-show-tutor`,
    };
    const statusMap: Record<StudentAction, string> = {
      cancel:       'CANCELLED',
      no_show_tutor: 'NO_SHOW_TUTOR',
    };
    const successMap: Record<StudentAction, string> = {
      cancel:       'Booking cancelled.',
      no_show_tutor: 'Reported tutor as no-show.',
    };
    setActing(id);
    try {
      await api.patch(endpointMap[action], actionReason ? { reason: actionReason } : {});
      toast.success(successMap[action]);
      setBookings(prev => prev.map(b =>
        b.id === id
          ? { ...b, status: statusMap[action], cancellationReason: action === 'cancel' ? actionReason : b.cancellationReason }
          : b
      ));
      setActionModal(null);
      setActionReason('');
    } catch (e: any) {
      toast.error(e.message || 'Action failed');
    } finally {
      setActing(null);
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
          {bookings.map(b => {
            const isPending   = b.status === 'PENDING';
            const isConfirmed = b.status === 'CONFIRMED';
            const isActing    = acting === b.id;

            return (
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
                    <span style={{ marginLeft: 'auto', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, ...(statusStyle[b.status] || statusStyle.PENDING) }}>
                      {b.status.replace(/_/g, ' ').charAt(0) + b.status.replace(/_/g, ' ').slice(1).toLowerCase()}
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
                    {b.location && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '7px', color: '#5a7bad', fontSize: '13px' }}>
                        <MapPin size={14} color="#93C5FD" />
                        <span><strong style={{ color: '#1e3a6e' }}>Location:</strong> {b.location}</span>
                      </div>
                    )}
                    {b.notes && (
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '7px', color: '#5a7bad', fontSize: '13px' }}>
                        <span style={{ flexShrink: 0 }}>📝</span>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.notes}</span>
                      </div>
                    )}
                  </div>

                  {(b.cancellationReason || b.rejectionReason) && (
                    <div style={{ marginTop: '10px', padding: '8px 12px', borderRadius: '8px', background: '#FEF2F2', border: '1px solid #FECACA', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <XCircle size={13} color="#DC2626" />
                      <span style={{ color: '#991B1B', fontSize: '12px', fontWeight: 600 }}>
                        {b.cancellationReason ? `Cancelled: ${b.cancellationReason}` : `Rejected: ${b.rejectionReason}`}
                      </span>
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 }}>
                  {isPending && (
                    <button
                      onClick={() => { setActionModal({ id: b.id, action: 'cancel' }); setActionReason(''); }}
                      disabled={isActing}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '9px', border: '1.5px solid #FCA5A5', background: '#FEF2F2', color: '#DC2626', fontWeight: 600, fontSize: '12.5px', cursor: isActing ? 'not-allowed' : 'pointer', opacity: isActing ? 0.7 : 1, whiteSpace: 'nowrap' }}
                    >
                      <Ban size={13} /> Cancel Session
                    </button>
                  )}
                  {isConfirmed && (
                    <>
                      <button
                        onClick={() => { setActionModal({ id: b.id, action: 'cancel' }); setActionReason(''); }}
                        disabled={isActing}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '9px', border: '1.5px solid #FCA5A5', background: '#FEF2F2', color: '#DC2626', fontWeight: 600, fontSize: '12.5px', cursor: isActing ? 'not-allowed' : 'pointer', opacity: isActing ? 0.7 : 1, whiteSpace: 'nowrap' }}
                      >
                        <Ban size={13} /> Cancel Session
                      </button>
                      <button
                        onClick={() => { setActionModal({ id: b.id, action: 'no_show_tutor' }); setActionReason(''); }}
                        disabled={isActing}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '9px', border: 'none', background: 'linear-gradient(135deg,#F97316,#C2410C)', color: 'white', fontWeight: 600, fontSize: '12.5px', cursor: isActing ? 'not-allowed' : 'pointer', opacity: isActing ? 0.7 : 1, whiteSpace: 'nowrap', boxShadow: '0 2px 8px rgba(194,65,12,0.3)' }}
                      >
                        {isActing ? <Loader2 size={13} style={{ animation: 'spin 0.8s linear infinite' }} /> : <UserX size={13} />}
                        Tutor No-Show
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Action Modal */}
      {actionModal && (() => {
        const cfg = actionConfig[actionModal.action];
        const Ic  = cfg.icon;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,10,35,0.65)', backdropFilter: 'blur(6px)' }}
            onClick={() => setActionModal(null)}
          >
            <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: '18px', padding: '28px', maxWidth: '420px', width: '100%', boxShadow: '0 28px 60px rgba(0,47,108,0.25)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Ic size={22} color={cfg.color} />
                </div>
                <div>
                  <h3 style={{ color: '#001a4d', fontWeight: 800, fontSize: '17px', marginBottom: '2px' }}>{cfg.label}</h3>
                  <p style={{ color: '#5a7bad', fontSize: '13px' }}>{cfg.desc}</p>
                </div>
              </div>
              <label style={{ color: '#1e3a6e', fontWeight: 600, fontSize: '13px', display: 'block', marginBottom: '7px' }}>
                Reason (optional)
              </label>
              <textarea
                value={actionReason}
                onChange={e => setActionReason(e.target.value)}
                placeholder={actionModal.action === 'cancel' ? 'e.g., Schedule conflict, no longer needed…' : 'e.g., Tutor never arrived…'}
                rows={3}
                style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #e0eaff', background: '#f7faff', fontSize: '14px', outline: 'none', resize: 'vertical', boxSizing: 'border-box', marginBottom: '18px' }}
                onFocus={e => e.target.style.borderColor = '#3B82F6'} onBlur={e => e.target.style.borderColor = '#e0eaff'}
              />
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => setActionModal(null)} style={{ flex: 1, padding: '11px', borderRadius: '11px', border: '1.5px solid #BFDBFE', background: 'white', color: '#1E40AF', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>
                  Keep Booking
                </button>
                <button onClick={handleActionSubmit} disabled={acting !== null}
                  style={{ flex: 1, padding: '11px', borderRadius: '11px', border: 'none', background: cfg.bg, color: 'white', fontWeight: 700, fontSize: '14px', cursor: acting !== null ? 'not-allowed' : 'pointer', boxShadow: cfg.confirmBg, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', opacity: acting !== null ? 0.7 : 1 }}>
                  {acting !== null ? <Loader2 size={15} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Ic size={15} />}
                  Confirm
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </DashboardLayout>
  );
}