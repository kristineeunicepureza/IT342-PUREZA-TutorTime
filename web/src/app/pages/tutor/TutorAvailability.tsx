import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layouts/DashboardLayout';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/apiService';
import { Calendar, MapPin, Clock, Trash2, Plus, RefreshCw, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Slot {
  id: number; startTime: string; endTime: string; location: string; isBooked: boolean;
}

export function TutorAvailability() {
  const { currentUser } = useApp();
  const [slots,    setSlots]    = useState<Slot[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [form, setForm] = useState({ startTime: '', endTime: '', location: '' });

  const fetchSlots = async () => {
    setLoading(true);
    try {
      const data = await api.get<Slot[]>('/api/availability/my-slots');
      setSlots(data);
    } catch (e: any) {
      toast.error(e.message || 'Failed to load slots');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSlots(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.startTime || !form.endTime || !form.location.trim()) {
      toast.error('Please fill in all fields.'); return;
    }
    if (new Date(form.startTime) >= new Date(form.endTime)) {
      toast.error('End time must be after start time.'); return;
    }
    setSaving(true);
    try {
      const start = form.startTime.replace('T', ' ');
      const end   = form.endTime.replace('T', ' ');
      const slot  = await api.post<Slot>('/api/availability', { startTime: start, endTime: end, location: form.location.trim() });
      setSlots(prev => [...prev, slot]);
      setForm({ startTime: '', endTime: '', location: '' });
      setShowForm(false);
      toast.success('Availability slot added!');
    } catch (e: any) {
      toast.error(e.message || 'Failed to add slot');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this slot?')) return;
    setDeleting(id);
    try {
      await api.delete(`/api/availability/${id}`);
      setSlots(prev => prev.filter(s => s.id !== id));
      toast.success('Slot deleted.');
    } catch (e: any) {
      toast.error(e.message || 'Failed to delete slot');
    } finally {
      setDeleting(null);
    }
  };

  if (!currentUser || currentUser.role !== 'TUTOR') return null;

  const inputSt: React.CSSProperties = { width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #e0eaff', background: '#f7faff', color: '#001a4d', fontSize: '14px', outline: 'none', boxSizing: 'border-box' };

  return (
    <DashboardLayout role="TUTOR">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ color: '#001a4d', fontWeight: 800, fontSize: '24px', letterSpacing: '-0.5px', marginBottom: '4px' }}>Manage Availability</h1>
          <p style={{ color: '#5a7bad', fontSize: '14px' }}>Set your tutoring time slots for students to book.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={fetchSlots} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', borderRadius: '10px', background: '#EFF6FF', border: '1px solid #BFDBFE', color: '#2563EB', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
            <RefreshCw size={14} /> Refresh
          </button>
          <button onClick={() => setShowForm(!showForm)} style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '10px 18px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg,#3B82F6,#1D4ED8)', color: 'white', fontWeight: 700, fontSize: '13.5px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(37,99,235,0.32)' }}>
            <Plus size={16} /> Add Slot
          </button>
        </div>
      </div>

      {/* Add form */}
      {showForm && (
        <div style={{ background: 'white', borderRadius: '14px', padding: '22px', marginBottom: '20px', boxShadow: '0 4px 20px rgba(0,47,108,0.08)', border: '1px solid rgba(59,130,246,0.12)' }}>
          <h3 style={{ color: '#001a4d', fontWeight: 700, fontSize: '15px', marginBottom: '18px' }}>New Availability Slot</h3>
          <form onSubmit={handleAdd}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginBottom: '16px' }}>
              <div>
                <label style={{ color: '#1e3a6e', fontWeight: 600, fontSize: '13px', display: 'block', marginBottom: '6px' }}>Start Time</label>
                <input type="datetime-local" value={form.startTime} onChange={e => setForm(p => ({ ...p, startTime: e.target.value }))} style={inputSt} onFocus={e => e.target.style.borderColor = '#3B82F6'} onBlur={e => e.target.style.borderColor = '#e0eaff'} />
              </div>
              <div>
                <label style={{ color: '#1e3a6e', fontWeight: 600, fontSize: '13px', display: 'block', marginBottom: '6px' }}>End Time</label>
                <input type="datetime-local" value={form.endTime} onChange={e => setForm(p => ({ ...p, endTime: e.target.value }))} style={inputSt} onFocus={e => e.target.style.borderColor = '#3B82F6'} onBlur={e => e.target.style.borderColor = '#e0eaff'} />
              </div>
              <div>
                <label style={{ color: '#1e3a6e', fontWeight: 600, fontSize: '13px', display: 'block', marginBottom: '6px' }}>Location</label>
                <input type="text" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} placeholder="e.g., Room 201, Online" style={inputSt} onFocus={e => e.target.style.borderColor = '#3B82F6'} onBlur={e => e.target.style.borderColor = '#e0eaff'} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '10px 20px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg,#3B82F6,#1D4ED8)', color: 'white', fontWeight: 700, fontSize: '13.5px', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
                {saving ? <Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Plus size={14} />}
                {saving ? 'Saving…' : 'Save Slot'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} style={{ padding: '10px 20px', borderRadius: '10px', border: '1.5px solid #BFDBFE', background: 'white', color: '#1E40AF', fontWeight: 600, fontSize: '13.5px', cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Slots */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>Loading slots…</div>
      ) : slots.length === 0 ? (
        <div style={{ background: 'white', borderRadius: '14px', padding: '60px 24px', textAlign: 'center', boxShadow: '0 4px 16px rgba(0,47,108,0.07)' }}>
          <Calendar size={48} style={{ color: '#BFDBFE', margin: '0 auto 14px' }} />
          <h3 style={{ color: '#001a4d', fontWeight: 700, fontSize: '17px', marginBottom: '6px' }}>No Slots Yet</h3>
          <p style={{ color: '#5a7bad', fontSize: '14px' }}>Add your first availability slot to start accepting bookings.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {slots.map(slot => (
            <div key={slot.id} style={{ background: 'white', borderRadius: '14px', padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 4px 14px rgba(0,47,108,0.06)', border: `1px solid ${slot.isBooked ? 'rgba(239,68,68,0.15)' : 'rgba(59,130,246,0.08)'}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: slot.isBooked ? '#FEF2F2' : '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Calendar size={20} color={slot.isBooked ? '#EF4444' : '#3B82F6'} />
                </div>
                <div>
                  <div style={{ color: '#001a4d', fontWeight: 700, fontSize: '14.5px', marginBottom: '4px' }}>
                    {new Date(slot.startTime).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                    <span style={{ marginLeft: '10px', padding: '2px 9px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, background: slot.isBooked ? '#FEF2F2' : '#ECFDF5', color: slot.isBooked ? '#DC2626' : '#059669' }}>
                      {slot.isBooked ? 'Booked' : 'Available'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#5a7bad', fontSize: '13px' }}>
                      <Clock size={13} color="#93C5FD" />
                      {new Date(slot.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} – {new Date(slot.endTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#5a7bad', fontSize: '13px' }}>
                      <MapPin size={13} color="#93C5FD" /> {slot.location}
                    </div>
                  </div>
                </div>
              </div>
              <button onClick={() => handleDelete(slot.id)} disabled={!!deleting || slot.isBooked} title={slot.isBooked ? 'Cannot delete a booked slot' : 'Delete slot'}
                style={{ padding: '9px', borderRadius: '9px', border: '1px solid #FCA5A5', background: '#FEF2F2', color: '#DC2626', cursor: (deleting || slot.isBooked) ? 'not-allowed' : 'pointer', opacity: slot.isBooked ? 0.5 : 1, flexShrink: 0 }}
                onMouseEnter={e => { if (!slot.isBooked) e.currentTarget.style.background = '#FECACA'; }}
                onMouseLeave={e => e.currentTarget.style.background = '#FEF2F2'}
              >
                {deleting === slot.id ? <Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Trash2 size={16} />}
              </button>
            </div>
          ))}
        </div>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </DashboardLayout>
  );
}