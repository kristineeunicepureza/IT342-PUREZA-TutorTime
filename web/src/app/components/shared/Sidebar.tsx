import { useNavigate, useLocation } from 'react-router';
import { useApp } from '../../context/AppContext';
import {
  Home, Users, Calendar, User, LogOut,
  Menu, X, ChevronLeft, ChevronRight,
  BookOpen, GraduationCap, Settings, LayoutDashboard,
} from 'lucide-react';
import { useState } from 'react';

interface SidebarProps {
  role: 'STUDENT' | 'TUTOR' | 'ADMIN';
}

type MenuItem = { icon: React.ElementType; label: string; path: string };

function getMenuItems(role: string): MenuItem[] {
  switch (role) {
    case 'STUDENT':
      return [
        { icon: LayoutDashboard, label: 'Dashboard',   path: '/student/dashboard' },
        { icon: Users,           label: 'Find Tutors', path: '/student/tutors'    },
        { icon: Calendar,        label: 'My Bookings', path: '/student/bookings'  },
        { icon: User,            label: 'Profile',     path: '/profile'           },
      ];
    case 'TUTOR':
      return [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/tutor/dashboard' },
        { icon: Calendar,        label: 'Schedule',  path: '/tutor/schedule'  },
        { icon: GraduationCap,   label: 'Students',  path: '/tutor/students'  },
        { icon: User,            label: 'Profile',   path: '/profile'         },
      ];
    case 'ADMIN':
      return [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
        { icon: Users,           label: 'Users',     path: '/admin/users'     },
        { icon: BookOpen,        label: 'Sessions',  path: '/admin/sessions'  },
        { icon: Settings,        label: 'Settings',  path: '/profile'         },
      ];
    default: return [];
  }
}

const roleLabel: Record<string, string> = {
  STUDENT: 'Student Portal',
  TUTOR:   'Tutor Portal',
  ADMIN:   'Admin Panel',
};

export function Sidebar({ role }: SidebarProps) {
  const navigate   = useNavigate();
  const location   = useLocation();
  const { logout, currentUser } = useApp();

  const [mobileOpen,      setMobileOpen]      = useState(false);
  const [minimized,       setMinimized]       = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const menuItems = getMenuItems(role);
  const isActive  = (p: string) => location.pathname === p;

  const handleLogout = async () => {
    setShowLogoutModal(false);
    await logout();
    navigate('/login');
  };

  // ── Sidebar width ────────────────────────────────────────────────────────
  const W = minimized ? '72px' : '256px';

  // ── Shared button base ───────────────────────────────────────────────────
  const navBtn = (active: boolean): React.CSSProperties => ({
    width: '100%', display: 'flex', alignItems: 'center',
    gap: minimized ? 0 : '11px',
    justifyContent: minimized ? 'center' : 'flex-start',
    padding: minimized ? '11px' : '11px 14px',
    borderRadius: '10px', border: 'none', cursor: 'pointer',
    transition: 'all 0.18s ease', textAlign: 'left',
    background: active
      ? 'linear-gradient(135deg, rgba(59,130,246,0.3), rgba(37,99,235,0.2))'
      : 'transparent',
    boxShadow: active ? 'inset 0 0 0 1px rgba(59,130,246,0.25)' : 'none',
    color: active ? '#93C5FD' : 'rgba(148,163,184,0.82)',
    position: 'relative',
  });

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2.5 rounded-xl shadow-lg"
        style={{ background: 'linear-gradient(135deg,#3B82F6,#0047AB)', color: 'white' }}
      >
        {mobileOpen ? <X size={21} /> : <Menu size={21} />}
      </button>

      {/* ── Sidebar panel ───────────────────────────────────────────────── */}
      <div
        className={`fixed left-0 top-0 h-screen z-40 flex flex-col transition-all duration-300 lg:relative lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{
          width: W, minHeight: '100vh',
          background: 'linear-gradient(180deg,#001a4d 0%,#002F6C 45%,#003a8c 100%)',
          boxShadow: '4px 0 28px rgba(0,47,108,0.4)',
        }}
      >
        {/* Header */}
        <div style={{
          position: 'relative', overflow: 'hidden',
          background: 'linear-gradient(135deg,rgba(59,130,246,0.22),rgba(0,71,171,0.14))',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          padding: minimized ? '16px 10px' : '18px',
        }}>
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(59,130,246,0.12)' }} />
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {!minimized ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg,#60A5FA,#2563EB)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(59,130,246,0.4)', flexShrink: 0 }}>
                  <BookOpen size={17} color="white" />
                </div>
                <div>
                  <div style={{ color: 'white', fontWeight: 800, fontSize: '15px', letterSpacing: '-0.3px', lineHeight: 1.2 }}>TutorTime</div>
                  <div style={{ color: 'rgba(147,197,253,0.7)', fontSize: '11px' }}>{roleLabel[role]}</div>
                </div>
              </div>
            ) : (
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg,#60A5FA,#2563EB)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                <BookOpen size={17} color="white" />
              </div>
            )}
            <button
              onClick={() => setMinimized(!minimized)}
              className="hidden lg:flex items-center justify-center"
              style={{ width: '24px', height: '24px', borderRadius: '6px', background: 'rgba(255,255,255,0.09)', color: 'rgba(147,197,253,0.85)', border: 'none', cursor: 'pointer', flexShrink: 0 }}
            >
              {minimized ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
            </button>
          </div>

          {/* User pill */}
          {!minimized && currentUser && (
            <div style={{ marginTop: '13px', padding: '8px 11px', borderRadius: '9px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: '9px' }}>
              {currentUser.profilePhotoUrl ? (
                <img src={currentUser.profilePhotoUrl} alt="" style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
              ) : (
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg,#60A5FA,#3B82F6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ color: 'white', fontSize: '11px', fontWeight: 700 }}>
                    {currentUser.firstName?.[0]}{currentUser.lastName?.[0]}
                  </span>
                </div>
              )}
              <div style={{ overflow: 'hidden', flex: 1 }}>
                <div style={{ color: 'white', fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {currentUser.firstName} {currentUser.lastName}
                </div>
                <div style={{ color: 'rgba(147,197,253,0.6)', fontSize: '10px' }}>{currentUser.email}</div>
              </div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: minimized ? '10px 8px' : '10px' }}>
          {!minimized && (
            <div style={{ color: 'rgba(147,197,253,0.4)', fontSize: '10px', fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase', padding: '4px 10px 8px' }}>
              Menu
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {menuItems.map(({ icon: Icon, label, path }) => {
              const active = isActive(path);
              return (
                <button
                  key={path}
                  onClick={() => { navigate(path); setMobileOpen(false); }}
                  title={minimized ? label : ''}
                  style={navBtn(active)}
                  onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(147,197,253,0.95)'; } }}
                  onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(148,163,184,0.82)'; } }}
                >
                  {active && !minimized && (
                    <div style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', width: '3px', height: '58%', borderRadius: '0 3px 3px 0', background: 'linear-gradient(180deg,#60A5FA,#3B82F6)' }} />
                  )}
                  <Icon size={18} strokeWidth={active ? 2.2 : 1.8} />
                  {!minimized && <span style={{ fontSize: '13.5px', fontWeight: active ? 600 : 500 }}>{label}</span>}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Logout */}
        <div style={{ padding: minimized ? '8px' : '10px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button
            onClick={() => setShowLogoutModal(true)}
            title={minimized ? 'Logout' : ''}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: minimized ? 0 : '11px', justifyContent: minimized ? 'center' : 'flex-start', padding: minimized ? '11px' : '11px 14px', borderRadius: '10px', border: '1px solid rgba(239,68,68,0.18)', cursor: 'pointer', transition: 'all 0.2s', background: 'rgba(239,68,68,0.09)', color: 'rgba(252,165,165,0.85)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.22)'; e.currentTarget.style.color = '#FCA5A5'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.09)'; e.currentTarget.style.color = 'rgba(252,165,165,0.85)'; }}
          >
            <LogOut size={18} />
            {!minimized && <span style={{ fontSize: '13.5px', fontWeight: 500 }}>Logout</span>}
          </button>
        </div>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 lg:hidden" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)' }} onClick={() => setMobileOpen(false)} />
      )}

      {/* ── Logout Modal ────────────────────────────────────────────────── */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,10,35,0.7)', backdropFilter: 'blur(6px)' }} onClick={() => setShowLogoutModal(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'linear-gradient(145deg,#ffffff,#f0f7ff)', borderRadius: '20px', padding: '32px', maxWidth: '360px', width: '100%', boxShadow: '0 28px 60px rgba(0,47,108,0.28), 0 0 0 1px rgba(59,130,246,0.12)', textAlign: 'center', animation: 'ttModal 0.22s cubic-bezier(0.34,1.56,0.64,1)' }}>
            <div style={{ width: '62px', height: '62px', borderRadius: '50%', background: 'linear-gradient(135deg,#FEE2E2,#FECACA)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 8px 22px rgba(220,38,38,0.18)' }}>
              <LogOut size={26} color="#DC2626" />
            </div>
            <h3 style={{ color: '#001f5c', fontWeight: 800, fontSize: '20px', marginBottom: '10px' }}>Sign Out?</h3>
            <p style={{ color: '#4471B0', fontSize: '14px', lineHeight: 1.6, marginBottom: '26px' }}>
              You'll be signed out of your TutorTime account.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setShowLogoutModal(false)} style={{ flex: 1, padding: '12px 0', borderRadius: '12px', border: '1.5px solid #BFDBFE', background: 'white', color: '#1E40AF', fontWeight: 600, fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#EFF6FF'} onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                Stay
              </button>
              <button onClick={handleLogout} style={{ flex: 1, padding: '12px 0', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg,#EF4444,#B91C1C)', color: 'white', fontWeight: 700, fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 14px rgba(220,38,38,0.35)' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(220,38,38,0.45)'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(220,38,38,0.35)'; }}>
                Yes, Sign Out
              </button>
            </div>
          </div>
          <style>{`@keyframes ttModal { from { opacity:0; transform:scale(0.88) translateY(12px); } to { opacity:1; transform:scale(1) translateY(0); } }`}</style>
        </div>
      )}
    </>
  );
}