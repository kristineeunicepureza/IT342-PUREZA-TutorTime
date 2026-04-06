import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layouts/DashboardLayout';
import { api } from '../../services/apiService';
import { MapPin, Plus, Pencil, Trash2, Check, X, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface TutoringLocation { id: number; name: string; description?: string; isActive: boolean; }
type EditTarget = { id: number; name: string; description?: string };

export function AdminManageLocations() {
  const [locations,  setLocations]  = useState<TutoringLocation[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [newLocName, setNewLocName] = useState('');
  const [newLocDesc, setNewLocDesc] = useState('');
  const [editing,    setEditing]    = useState<EditTarget | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const l = await api.get<TutoringLocation[]>('/api/catalog/locations/all');
      setLocations(l);
    } catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const addLocation = async () => {
    if (!newLocName.trim()) { toast.error('Location name is required.'); return; }
    setSaving(true);
    try {
      const l = await api.post<TutoringLocation>('/api/catalog/locations', {
        name: newLocName.trim(),
        description: newLocDesc.trim() || undefined,
      });
      setLocations(prev => [...prev, l]); setNewLocName(''); setNewLocDesc('');
      toast.success('Location added!');
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const saveEdit = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const l = await api.put<TutoringLocation>(`/api/catalog/locations/${editing.id}`, {
        name: editing.name, description: editing.description,
      });
      setLocations(prev => prev.map(x => x.id === l.id ? l : x));
      setEditing(null); toast.success('Location updated.');
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const deleteLocation = async (id: number) => {
    if (!confirm('Delete this location?')) return;
    try {
      await api.delete(`/api/catalog/locations/${id}`);
      setLocations(prev => prev.filter(l => l.id !== id)); toast.success('Location deleted.');
    } catch (e: any) { toast.error(e.message); }
  };

  const inp: React.CSSProperties = {
    width: '100%', padding: '10px 13px', borderRadius: '10px',
    border: '1.5px solid #e0eaff', background: '#f7faff',
    fontSize: '13.5px', outline: 'none', color: '#001a4d', boxSizing: 'border-box',
  };

  return (
    <DashboardLayout role="ADMIN">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MapPin size={20} color="#10B981" />
            </div>
            <h1 style={{ color: '#001a4d', fontWeight: 800, fontSize: '24px', letterSpacing: '-0.5px' }}>Manage Locations</h1>
          </div>
          <p style={{ color: '#5a7bad', fontSize: '14px', marginLeft: '52px' }}>Add, edit, or remove tutoring locations available on TutorTime.</p>
        </div>
        <button onClick={load} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', borderRadius: '10px', background: '#ECFDF5', border: '1px solid #6EE7B7', color: '#059669', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px', color: '#94a3b8' }}>
          <Loader2 size={28} style={{ animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
          <div>Loading locations…</div>
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: '16px', padding: '28px', boxShadow: '0 4px 20px rgba(0,47,108,0.07)', border: '1px solid rgba(59,130,246,0.08)' }}>

          {/* Add form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
            <input
              value={newLocName}
              onChange={e => setNewLocName(e.target.value)}
              placeholder="Location name e.g., Room 201, Library…"
              style={inp}
              onFocus={e => e.target.style.borderColor = '#10B981'}
              onBlur={e => e.target.style.borderColor = '#e0eaff'}
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                value={newLocDesc}
                onChange={e => setNewLocDesc(e.target.value)}
                placeholder="Description (optional)"
                style={{ ...inp, flex: 1 }}
                onKeyDown={e => { if (e.key === 'Enter') addLocation(); }}
                onFocus={e => e.target.style.borderColor = '#10B981'}
                onBlur={e => e.target.style.borderColor = '#e0eaff'}
              />
              <button
                onClick={addLocation}
                disabled={saving}
                style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '10px 20px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg,#10B981,#059669)', color: 'white', fontWeight: 700, fontSize: '13px', cursor: saving ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap', boxShadow: '0 4px 12px rgba(5,150,105,0.28)' }}
              >
                {saving ? <Loader2 size={13} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Plus size={13} />} Add Location
              </button>
            </div>
          </div>

          {/* Count badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <span style={{ color: '#001a4d', fontWeight: 700, fontSize: '14px' }}>All Locations</span>
            <span style={{ background: '#ECFDF5', color: '#059669', fontWeight: 700, fontSize: '12px', padding: '2px 10px', borderRadius: '20px', border: '1px solid #6EE7B7' }}>
              {locations.length}
            </span>
          </div>

          {/* List */}
          <div>
            {locations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px', color: '#94a3b8' }}>
                <MapPin size={36} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                <div style={{ fontWeight: 600, marginBottom: '4px' }}>No locations yet</div>
                <div style={{ fontSize: '13px' }}>Add your first location above.</div>
              </div>
            ) : (
              locations.map(l =>
                editing?.id === l.id ? (
                  <div key={l.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '12px 0', borderBottom: '1px solid #f0f4fa' }}>
                    <input
                      value={editing.name}
                      onChange={e => setEditing(p => p ? { ...p, name: e.target.value } : p)}
                      placeholder="Name"
                      style={inp}
                      onFocus={e => e.target.style.borderColor = '#10B981'}
                      onBlur={e => e.target.style.borderColor = '#e0eaff'}
                    />
                    <input
                      value={editing.description ?? ''}
                      onChange={e => setEditing(p => p ? { ...p, description: e.target.value } : p)}
                      placeholder="Description (optional)"
                      style={inp}
                      onFocus={e => e.target.style.borderColor = '#10B981'}
                      onBlur={e => e.target.style.borderColor = '#e0eaff'}
                    />
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={saveEdit} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', background: '#10B981', color: 'white', fontWeight: 700, fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                        <Check size={13} /> Save
                      </button>
                      <button onClick={() => setEditing(null)} style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #e0eaff', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                        <X size={13} color="#94a3b8" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 0', borderBottom: '1px solid #f0f4fa' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: l.isActive ? '#10B981' : '#94a3b8', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ color: '#001a4d', fontWeight: 600, fontSize: '14px' }}>{l.name}</div>
                      {l.description && <div style={{ color: '#94a3b8', fontSize: '12px', marginTop: '2px' }}>{l.description}</div>}
                    </div>
                    <button onClick={() => setEditing({ id: l.id, name: l.name, description: l.description })} style={{ padding: '7px', borderRadius: '8px', border: '1px solid #BFDBFE', background: '#EFF6FF', cursor: 'pointer', display: 'flex' }}>
                      <Pencil size={13} color="#2563EB" />
                    </button>
                    <button onClick={() => deleteLocation(l.id)} style={{ padding: '7px', borderRadius: '8px', border: '1px solid #FCA5A5', background: '#FEF2F2', cursor: 'pointer', display: 'flex' }}>
                      <Trash2 size={13} color="#DC2626" />
                    </button>
                  </div>
                )
              )
            )}
          </div>
        </div>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </DashboardLayout>
  );
}