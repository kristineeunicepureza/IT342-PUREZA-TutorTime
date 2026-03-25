import { ReactNode } from 'react';
import { Sidebar } from '../shared/Sidebar';
import { useApp } from '../../context/AppContext';
import { Navigate, useNavigate } from 'react-router';

interface DashboardLayoutProps {
  children: ReactNode;
  role: 'STUDENT' | 'TUTOR' | 'ADMIN';
}

export function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const { currentUser } = useApp();
  const navigate = useNavigate();

  if (!currentUser) return <Navigate to="/login" replace />;

  const userRole = currentUser.role.toUpperCase();
  const reqRole  = role.toUpperCase();
  if (userRole !== reqRole) return <Navigate to="/login" replace />;

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });

  return (
    <div className="flex min-h-screen" style={{ background: 'linear-gradient(160deg,#f0f6ff 0%,#e8f0fe 50%,#EFF6FF 100%)' }}>
      <Sidebar role={role} />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Sticky top bar */}
        <div style={{
          background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(59,130,246,0.1)',
          padding: '12px 28px', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 12px rgba(0,47,108,0.06)',
          position: 'sticky', top: 0, zIndex: 20,
        }}>
          <div>
            <div style={{ color: '#94a3b8', fontSize: '11.5px', fontWeight: 500 }}>{today}</div>
            <div style={{ color: '#001a4d', fontSize: '14.5px', fontWeight: 700, marginTop: '1px' }}>
              Hello, {currentUser.firstName}! 👋
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => navigate('/profile')}
              style={{
                width: '36px', height: '36px', borderRadius: '50%',
                overflow: 'hidden', border: '2px solid #BFDBFE',
                cursor: 'pointer', flexShrink: 0,
                background: 'linear-gradient(135deg,#60A5FA,#2563EB)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 3px 10px rgba(59,130,246,0.3)',
              }}
            >
              {currentUser.profilePhotoUrl ? (
                <img src={currentUser.profilePhotoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ color: 'white', fontSize: '12px', fontWeight: 700 }}>
                  {currentUser.firstName?.[0]}{currentUser.lastName?.[0]}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Page content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '28px 28px 40px' }}>
          {children}
        </main>
      </div>
    </div>
  );
}