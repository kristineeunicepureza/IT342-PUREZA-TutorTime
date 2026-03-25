import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { DashboardLayout } from '../../components/layouts/DashboardLayout';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/apiService';
import { ArrowLeft, Star, MapPin, Clock, Calendar, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface TutorData {
  id: number; firstName: string; lastName: string; email: string;
  bio?: string; expertise?: string; rating?: number; reviewCount?: number;
  subjects?: string[]; location?: string; isVerified?: boolean; profilePhotoUrl?: string;
}

interface Slot {
  id: number; date: string; time: string; location?: string; isBooked: boolean; startTime: string;
}

export function TutorProfile() {
  const { currentUser } = useApp();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [tutor,    setTutor]    = useState<TutorData | null>(null);
  const [slots,    setSlots]    = useState<Slot[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [selected, setSelected] = useState<Slot | null>(null);
  const [notes,    setNotes]    = useState('');
  const [booking,  setBooking]  = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      api.get<TutorData>(`/api/tutors/${id}`),
      api.get<Slot[]>(`/api/tutors/${id}/availability`),
    ]).then(([t, s]) => { setTutor(t); setSlots(s); })
      .catch(e => toast.error(e.message || 'Failed to load tutor'))
      .finally(() => setLoading(false));
  }, [id]);

  if (!currentUser) return null;

  const available = slots.filter(s => !s.isBooked);

  const handleBook = async () => {
    if (!selected) { toast.error('Please select a time slot.'); return; }
    setBooking(true);
    try {
      const dateStr = new Date(selected.startTime).toISOString().slice(0, 10);
      const timeStr = selected.time.length === 5 ? selected.time : selected.time.slice(0, 5);
      await api.post('/api/bookings', {
        tutorId:       parseInt(id!),
        subject:       tutor?.expertise || 'General Tutoring',
        notes,
        scheduledTime: `${dateStr} ${timeStr}`,
      });
      toast.success('Booking created successfully!');
      setSelected(null); setNotes('');
      // refresh slots
      const fresh = await api.get<Slot[]>(`/api/tutors/${id}/availability`);
      setSlots(fresh);
    } catch (e: any) {
      toast.error(e.message || 'Booking failed');
    } finally {
      setBooking(false);
    }
  };

  return (
    <DashboardLayout role="STUDENT">
      <button onClick={() => navigate('/student/tutors')} style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '8px 14px', borderRadius: '10px', border: '1.5px solid #BFDBFE', background: 'white', color: '#1E40AF', fontWeight: 600, fontSize: '13px', cursor: 'pointer', marginBottom: '20px' }}>
        <ArrowLeft size={15} /> Back to Tutors
      </button>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>Loading tutor profile…</div>
      ) : !tutor ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>Tutor not found.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '24px', alignItems: 'start' }}>

          {/* Left: tutor card */}
          <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,47,108,0.07)', border: '1px solid rgba(59,130,246,0.08)' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', margin: '0 auto 14px', border: '3px solid #DBEAFE' }}>
              {tutor.profilePhotoUrl ? (
                <img src={tutor.profilePhotoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#3B82F6,#0047AB)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: 'white', fontWeight: 700, fontSize: '28px' }}>{tutor.firstName[0]}</span>
                </div>
              )}
            </div>
            <h2 style={{ textAlign: 'center', color: '#001a4d', fontWeight: 800, fontSize: '18px', marginBottom: '4px' }}>
              {tutor.firstName} {tutor.lastName}
              {tutor.isVerified && <span style={{ display: 'block', fontSize: '11px', color: '#2563EB', marginTop: '4px' }}>✓ Verified Tutor</span>}
            </h2>
            <p style={{ textAlign: 'center', color: '#5a7bad', fontSize: '13px', marginBottom: '14px' }}>{tutor.email}</p>

            {!!tutor.rating && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px', marginBottom: '16px' }}>
                {[...Array(5)].map((_, i) => <Star key={i} size={14} style={{ color: i < Math.round(tutor.rating!) ? '#FCD34D' : '#E5E7EB', fill: i < Math.round(tutor.rating!) ? '#FCD34D' : 'none' }} />)}
                <span style={{ color: '#94a3b8', fontSize: '12px', marginLeft: '4px' }}>({tutor.reviewCount})</span>
              </div>
            )}

            {tutor.expertise && (
              <div style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #e0eaff' }}>
                <div style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' }}>Expertise</div>
                <div style={{ color: '#1e3a6e', fontSize: '13.5px' }}>{tutor.expertise}</div>
              </div>
            )}

            {tutor.bio && (
              <div style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #e0eaff' }}>
                <div style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' }}>About</div>
                <div style={{ color: '#5a7bad', fontSize: '13px', lineHeight: 1.6 }}>{tutor.bio}</div>
              </div>
            )}

            {tutor.subjects && tutor.subjects.length > 0 && (
              <div style={{ marginBottom: '12px' }}>
                <div style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>Subjects</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                  {tutor.subjects.map(s => <span key={s} style={{ padding: '3px 10px', borderRadius: '20px', background: '#EFF6FF', color: '#2563EB', fontSize: '12px', fontWeight: 600 }}>{s.trim()}</span>)}
                </div>
              </div>
            )}

            {tutor.location && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#5a7bad', fontSize: '13px', marginTop: '12px' }}>
                <MapPin size={14} color="#3B82F6" /> {tutor.location}
              </div>
            )}
          </div>

          {/* Right: booking */}
          <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,47,108,0.07)', border: '1px solid rgba(59,130,246,0.08)' }}>
            <h3 style={{ color: '#001a4d', fontWeight: 800, fontSize: '18px', marginBottom: '18px' }}>Available Time Slots</h3>

            {available.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                <Calendar size={40} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                <p>No available slots at the moment.</p>
              </div>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: '10px', marginBottom: '20px' }}>
                  {available.map(slot => (
                    <button key={slot.id} onClick={() => setSelected(s => s?.id === slot.id ? null : slot)}
                      style={{ padding: '13px 14px', borderRadius: '12px', border: `1.5px solid ${selected?.id === slot.id ? '#3B82F6' : '#e0eaff'}`, background: selected?.id === slot.id ? 'linear-gradient(135deg,#EFF6FF,#DBEAFE)' : 'white', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#001a4d', fontWeight: 600, fontSize: '13px', marginBottom: '5px' }}>
                        <Calendar size={13} color="#3B82F6" />
                        {new Date(slot.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#5a7bad', fontSize: '12.5px' }}>
                        <Clock size={12} color="#93C5FD" /> {slot.time}
                      </div>
                      {slot.location && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#94a3b8', fontSize: '11.5px', marginTop: '4px' }}>
                          <MapPin size={11} /> {slot.location}
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {selected && (
                  <div style={{ borderTop: '1px solid #e0eaff', paddingTop: '18px' }}>
                    <div style={{ padding: '14px', borderRadius: '12px', background: 'linear-gradient(135deg,#f0f6ff,#e8f0fe)', border: '1px solid #BFDBFE', marginBottom: '14px' }}>
                      <p style={{ color: '#001a4d', fontWeight: 700, fontSize: '13.5px', marginBottom: '6px' }}>Booking Summary</p>
                      <p style={{ color: '#5a7bad', fontSize: '13px' }}><strong>Tutor:</strong> {tutor.firstName} {tutor.lastName}</p>
                      <p style={{ color: '#5a7bad', fontSize: '13px' }}><strong>Date:</strong> {new Date(selected.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                      <p style={{ color: '#5a7bad', fontSize: '13px' }}><strong>Time:</strong> {selected.time}</p>
                      {selected.location && <p style={{ color: '#5a7bad', fontSize: '13px' }}><strong>Location:</strong> {selected.location}</p>}
                    </div>
                    <label style={{ color: '#1e3a6e', fontWeight: 600, fontSize: '13px', display: 'block', marginBottom: '7px' }}>Notes (optional)</label>
                    <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Topics you'd like to focus on…"
                      style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #e0eaff', background: '#f7faff', fontSize: '13.5px', outline: 'none', resize: 'vertical', boxSizing: 'border-box', marginBottom: '14px' }}
                      onFocus={e => e.target.style.borderColor = '#3B82F6'} onBlur={e => e.target.style.borderColor = '#e0eaff'}
                    />
                    <button onClick={handleBook} disabled={booking}
                      style={{ width: '100%', padding: '13px', borderRadius: '12px', border: 'none', background: booking ? 'linear-gradient(135deg,#93C5FD,#60A5FA)' : 'linear-gradient(135deg,#3B82F6,#1D4ED8)', color: 'white', fontWeight: 700, fontSize: '15px', cursor: booking ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 14px rgba(37,99,235,0.35)' }}
                      onMouseEnter={e => { if (!booking) e.currentTarget.style.transform = 'translateY(-1px)'; }} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      {booking ? <><Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> Booking…</> : <><CheckCircle size={16} /> Confirm Booking</>}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </DashboardLayout>
  );
}