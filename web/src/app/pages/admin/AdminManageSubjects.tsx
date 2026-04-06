import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layouts/DashboardLayout';
import { api } from '../../services/apiService';
import { BookOpen, Plus, Pencil, Trash2, Check, X, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface Subject { id: number; name: string; isActive: boolean; }
type EditTarget = { id: number; name: string };

export function AdminManageSubjects() {
  const [subjects,   setSubjects]   = useState<Subject[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [editing,    setEditing]    = useState<EditTarget | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const s = await api.get<Subject[]>('/api/catalog/subjects/all');
      setSubjects(s);
    } catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const addSubject = async () => {
    if (!newSubject.trim()) { toast.error('Subject name is required.'); return; }
    setSaving(true);
    try {
      const s = await api.post<Subject>('/api/catalog/subjects', { name: newSubject.trim() });
      setSubjects(prev => [...prev, s]); setNewSubject('');
      toast.success('Subject added!');
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const saveEdit = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const s = await api.put<Subject>(`/api/catalog/subjects/${editing.id}`, { name: editing.name });
      setSubjects(prev => prev.map(x => x.id === s.id ? s : x));
      setEditing(null); toast.success('Subject updated.');
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const deleteSubject = async (id: number) => {
    if (!confirm('Delete this subject?')) return;
    try {
      await api.delete(`/api/catalog/subjects/${id}`);
      setSubjects(prev => prev.filter(s => s.id !== id)); toast.success('Subject deleted.');
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
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BookOpen size={20} color="#3B82F6" />
            </div>
            <h1 style={{ color: '#001a4d', fontWeight: 800, fontSize: '24px', letterSpacing: '-0.5px' }}>Manage Subjects</h1>
          </div>
          <p style={{ color: '#5a7bad', fontSize: '14px', marginLeft: '52px' }}>Add, edit, or remove subjects available on TutorTime.</p>
        </div>
        <button onClick={load} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', borderRadius: '10px', background: '#EFF6FF', border: '1px solid #BFDBFE', color: '#2563EB', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px', color: '#94a3b8' }}>
          <Loader2 size={28} style={{ animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
          <div>Loading subjects…</div>
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: '16px', padding: '28px', boxShadow: '0 4px 20px rgba(0,47,108,0.07)', border: '1px solid rgba(59,130,246,0.08)' }}>

          {/* Add form */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
            <input
              value={newSubject}
              onChange={e => setNewSubject(e.target.value)}
              placeholder="e.g., Mathematics, Physics, English…"
              style={inp}
              onKeyDown={e => { if (e.key === 'Enter') addSubject(); }}
              onFocus={e => e.target.style.borderColor = '#3B82F6'}
              onBlur={e => e.target.style.borderColor = '#e0eaff'}
            />
            <button
              onClick={addSubject}
              disabled={saving}
              style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '10px 20px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg,#3B82F6,#1D4ED8)', color: 'white', fontWeight: 700, fontSize: '13px', cursor: saving ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap', boxShadow: '0 4px 12px rgba(37,99,235,0.28)' }}
            >
              {saving ? <Loader2 size={13} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Plus size={13} />} Add Subject
            </button>
          </div>

          {/* Count badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <span style={{ color: '#001a4d', fontWeight: 700, fontSize: '14px' }}>All Subjects</span>
            <span style={{ background: '#EFF6FF', color: '#2563EB', fontWeight: 700, fontSize: '12px', padding: '2px 10px', borderRadius: '20px', border: '1px solid #BFDBFE' }}>
              {subjects.length}
            </span>
          </div>

          {/* List */}
          <div>
            {subjects.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px', color: '#94a3b8' }}>
                <BookOpen size={36} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                <div style={{ fontWeight: 600, marginBottom: '4px' }}>No subjects yet</div>
                <div style={{ fontSize: '13px' }}>Add your first subject above.</div>
              </div>
            ) : (
              subjects.map(s =>
                editing?.id === s.id ? (
                  <div key={s.id} style={{ display: 'flex', gap: '8px', padding: '12px 0', borderBottom: '1px solid #f0f4fa' }}>
                    <input
                      value={editing.name}
                      onChange={e => setEditing(p => p ? { ...p, name: e.target.value } : p)}
                      style={{ ...inp, flex: 1 }}
                      onFocus={e => e.target.style.borderColor = '#3B82F6'}
                      onBlur={e => e.target.style.borderColor = '#e0eaff'}
                    />
                    <button onClick={saveEdit} style={{ padding: '8px 14px', borderRadius: '8px', border: 'none', background: '#10B981', color: 'white', fontWeight: 700, fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Check size={13} /> Save
                    </button>
                    <button onClick={() => setEditing(null)} style={{ padding: '8px', borderRadius: '8px', border: '1px solid #e0eaff', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                      <X size={13} color="#94a3b8" />
                    </button>
                  </div>
                ) : (
                  <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 0', borderBottom: '1px solid #f0f4fa' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.isActive ? '#10B981' : '#94a3b8', flexShrink: 0 }} />
                    <div style={{ flex: 1, color: '#001a4d', fontWeight: 600, fontSize: '14px' }}>{s.name}</div>
                    <button onClick={() => setEditing({ id: s.id, name: s.name })} style={{ padding: '7px', borderRadius: '8px', border: '1px solid #BFDBFE', background: '#EFF6FF', cursor: 'pointer', display: 'flex' }}>
                      <Pencil size={13} color="#2563EB" />
                    </button>
                    <button onClick={() => deleteSubject(s.id)} style={{ padding: '7px', borderRadius: '8px', border: '1px solid #FCA5A5', background: '#FEF2F2', cursor: 'pointer', display: 'flex' }}>
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