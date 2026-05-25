import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Star, MessageSquare, Settings, LogOut, Menu, X, Zap } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { logoutApi } from '../api/auth';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/customers', icon: Users, label: 'Customers' },
  { to: '/requests', icon: Star, label: 'Requests' },
  { to: '/feedback', icon: MessageSquare, label: 'Feedback' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

const sidebarBg = 'linear-gradient(180deg, #0f172a 0%, #1a2744 50%, #0f172a 100%)';

export default function DashboardLayout() {
  const { business, logout } = useAuthStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logoutApi();
    logout();
    navigate('/login');
  };

  const NavLinks = ({ onClick }: { onClick?: () => void }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {navItems.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          onClick={onClick}
          style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '12px 16px', borderRadius: '12px',
            fontSize: '14px', fontWeight: 600,
            color: isActive ? 'white' : '#94a3b8',
            background: isActive ? '#3b82f6' : 'transparent',
            textDecoration: 'none', transition: 'all 0.2s',
          })}
        >
          <Icon size={18} />
          {label}
        </NavLink>
      ))}
    </div>
  );

  const SidebarContent = ({ onClose }: { onClose?: () => void }) => (
    <>
      <div style={{ padding: '24px 20px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={18} color="white" />
            </div>
            <span style={{ fontFamily: 'Syne, sans-serif', color: 'white', fontSize: '18px', fontWeight: 800 }}>ReviewNest</span>
          </div>
          {onClose && (
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
              <X size={20} />
            </button>
          )}
        </div>
        <div style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', padding: '12px' }}>
          <p style={{ fontSize: '11px', color: '#93c5fd', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>Business</p>
          <p style={{ fontSize: '13px', color: 'white', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{business?.businessName}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>Active</span>
          </div>
        </div>
      </div>
      <nav style={{ flex: 1, padding: '0 12px' }}>
        <p style={{ fontSize: '11px', color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', padding: '0 12px', marginBottom: '8px' }}>Menu</p>
        <NavLinks onClick={onClose} />
      </nav>
      <div style={{ padding: '12px 12px 24px' }}>
        <button
          onClick={handleLogout}
          style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '12px', fontSize: '14px', fontWeight: 600, color: '#94a3b8', background: 'transparent', border: 'none', cursor: 'pointer', width: '100%' }}
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </>
  );

  return (
    <>
      <style>{`
        .ss-sidebar-desktop { width: 240px; min-width: 240px; background: ${sidebarBg}; display: flex; flex-direction: column; position: sticky; top: 0; height: 100vh; box-shadow: 4px 0 24px rgba(0,0,0,0.3); }
        .ss-topbar { display: none; background: white; border-bottom: 1px solid #e2e8f0; padding: 14px 16px; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 10; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
        .ss-bottom-nav { display: none; position: fixed; bottom: 0; left: 0; right: 0; background: white; border-top: 1px solid #e2e8f0; z-index: 10; box-shadow: 0 -2px 12px rgba(0,0,0,0.06); }
        .ss-main { flex: 1; padding: 28px; padding-bottom: 32px; min-width: 0; }
        @media (max-width: 768px) {
          .ss-sidebar-desktop { display: none !important; }
          .ss-topbar { display: flex !important; }
          .ss-bottom-nav { display: flex !important; }
          .ss-main { padding: 16px; padding-bottom: 80px; }
        }
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9' }}>

        {/* Desktop sidebar */}
        <aside className="ss-sidebar-desktop">
          <SidebarContent />
        </aside>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 20 }} />
        )}

        {/* Mobile drawer */}
        <aside style={{
          position: 'fixed', top: 0, left: 0, height: '100%', width: '260px',
          background: sidebarBg, zIndex: 30, display: 'flex', flexDirection: 'column',
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s ease', boxShadow: '4px 0 24px rgba(0,0,0,0.4)',
        }}>
          <SidebarContent onClose={() => setSidebarOpen(false)} />
        </aside>

        {/* Main */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

          {/* Mobile topbar */}
          <header className="ss-topbar">
            <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569' }}>
              <Menu size={22} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap size={14} color="white" />
              </div>
              <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '16px', color: '#0f172a' }}>ReviewNest</span>
            </div>
            <div style={{ width: '22px' }} />
          </header>

          {/* Page content */}
          <main className="ss-main">
            <Outlet />
          </main>

          {/* Mobile bottom nav */}
          <nav className="ss-bottom-nav">
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                style={({ isActive }) => ({
                  flex: 1, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: '3px', padding: '10px 4px',
                  fontSize: '10px', fontWeight: 600, textDecoration: 'none',
                  color: isActive ? '#2563eb' : '#94a3b8',
                })}
              >
                <Icon size={20} />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
}
