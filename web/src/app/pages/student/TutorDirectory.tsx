import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { DashboardLayout } from '../../components/layouts/DashboardLayout';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/apiService';
import { Search, Star, MapPin, BookOpen, Users, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

interface Tutor {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  bio?: string;
  expertise?: string;
  rating?: number;
  reviewCount?: number;
  subjects?: string[];
  location?: string;
  isVerified?: boolean;
  profilePhotoUrl?: string;
}

export function TutorDirectory() {
  const { currentUser } = useApp();
  const navigate = useNavigate();
  const [tutors,  setTutors]  = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');

  useEffect(() => {
    api.get<Tutor[]>('/api/tutors')
      .then(setTutors)
      .catch(e => toast.error(e.message || 'Failed to load tutors'))
      .finally(() => setLoading(false));
  }, []);

  if (!currentUser) return null;

  const filtered = tutors.filter(t =>
    `${t.firstName} ${t.lastName} ${t.expertise || ''}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout role="STUDENT">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ color: '#001a4d', fontWeight: 800, fontSize: '24px', letterSpacing: '-0.5px', marginBottom: '4px' }}>
          Find a Tutor
        </h1>
        <p style={{ color: '#5a7bad', fontSize: '14px' }}>Browse qualified peer tutors and book a session.</p>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', maxWidth: '480px', marginBottom: '24px' }}>
        <Search size={17} color="#93C5FD" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or expertise…"
          style={{ width: '100%', padding: '13px 16px 13px 46px', borderRadius: '12px', border: '1.5px solid #e0eaff', background: 'white', fontSize: '14px', outline: 'none', color: '#001a4d', boxSizing: 'border-box', boxShadow: '0 2px 10px rgba(0,47,108,0.06)' }}
          onFocus={e => { e.target.style.borderColor = '#3B82F6'; e.target.style.boxShadow = '0 0 0 4px rgba(59,130,246,0.1)'; }}
          onBlur={e => { e.target.style.borderColor = '#e0eaff'; e.target.style.boxShadow = '0 2px 10px rgba(0,47,108,0.06)'; }}
        />
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '16px' }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{ background: 'white', borderRadius: '16px', padding: '24px', height: '200px', animation: 'pulse 1.5s ease-in-out infinite', boxShadow: '0 4px 16px rgba(0,47,108,0.07)' }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <Users size={56} style={{ color: '#BFDBFE', margin: '0 auto 16px' }} />
          <h3 style={{ color: '#001a4d', fontWeight: 700, fontSize: '18px', marginBottom: '6px' }}>No Tutors Found</h3>
          <p style={{ color: '#5a7bad', fontSize: '14px' }}>
            {search ? 'Try a different search term.' : 'No tutors have registered yet.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '16px' }}>
          {filtered.map(tutor => (
            <div
              key={tutor.id}
              onClick={() => navigate(`/student/tutor/${tutor.id}`)}
              style={{ background: 'white', borderRadius: '16px', padding: '22px', cursor: 'pointer', transition: 'all 0.22s', boxShadow: '0 4px 16px rgba(0,47,108,0.07)', border: '1px solid rgba(59,130,246,0.08)' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 14px 32px rgba(37,99,235,0.14)'; e.currentTarget.style.borderColor = '#93C5FD'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,47,108,0.07)'; e.currentTarget.style.borderColor = 'rgba(59,130,246,0.08)'; }}
            >
              {/* Avatar + name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: '2px solid #DBEAFE', boxShadow: '0 3px 10px rgba(0,47,108,0.12)' }}>
                  {tutor.profilePhotoUrl ? (
                    <img src={tutor.profilePhotoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#3B82F6,#0047AB)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ color: 'white', fontWeight: 700, fontSize: '18px' }}>{tutor.firstName?.[0]}</span>
                    </div>
                  )}
                </div>
                <div>
                  <div style={{ color: '#001a4d', fontWeight: 700, fontSize: '15px' }}>
                    {tutor.firstName} {tutor.lastName}
                    {tutor.isVerified && <span style={{ marginLeft: '6px', background: '#DBEAFE', color: '#2563EB', fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '20px' }}>✓ Verified</span>}
                  </div>
                  {tutor.expertise && <div style={{ color: '#5a7bad', fontSize: '12.5px', marginTop: '2px' }}>{tutor.expertise}</div>}
                </div>
              </div>

              {/* Rating */}
              {!!tutor.rating && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '10px' }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={13} style={{ color: i < Math.round(tutor.rating!) ? '#FCD34D' : '#E5E7EB', fill: i < Math.round(tutor.rating!) ? '#FCD34D' : 'none' }} />
                  ))}
                  <span style={{ color: '#94a3b8', fontSize: '12px', marginLeft: '4px' }}>({tutor.reviewCount || 0})</span>
                </div>
              )}

              {/* Bio */}
              {tutor.bio && (
                <p style={{ color: '#5a7bad', fontSize: '13px', lineHeight: 1.55, marginBottom: '12px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {tutor.bio}
                </p>
              )}

              {/* Subjects */}
              {tutor.subjects && tutor.subjects.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '12px' }}>
                  {tutor.subjects.slice(0, 3).map(s => (
                    <span key={s} style={{ padding: '3px 9px', borderRadius: '20px', background: '#EFF6FF', color: '#2563EB', fontSize: '11.5px', fontWeight: 600 }}>{s.trim()}</span>
                  ))}
                  {tutor.subjects.length > 3 && <span style={{ padding: '3px 9px', borderRadius: '20px', background: '#f0f4fa', color: '#94a3b8', fontSize: '11.5px' }}>+{tutor.subjects.length-3}</span>}
                </div>
              )}

              {/* Footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', paddingTop: '12px', borderTop: '1px solid #f0f4fa' }}>
                {tutor.location ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#94a3b8', fontSize: '12px' }}>
                    <MapPin size={12} /> {tutor.location}
                  </div>
                ) : <span />}
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#3B82F6', fontSize: '13px', fontWeight: 600 }}>
                  Book <ArrowRight size={13} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>
    </DashboardLayout>
  );
}