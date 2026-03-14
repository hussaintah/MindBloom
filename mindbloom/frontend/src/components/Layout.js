import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const NAV = [
  { to: '/', icon: '🏡', label: 'Home' },
  { to: '/chat', icon: '💬', label: 'Chat with Bloom' },
  { to: '/sleep', icon: '🌙', label: 'Sleep Analysis' },
  { to: '/mood', icon: '🌈', label: 'Mood' },
  { to: '/breathe', icon: '🍃', label: 'Breathe' },
  { to: '/settings', icon: '⚙️', label: 'Settings' },
];

export default function Layout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const handleSignOut = async () => { await signOut(); navigate('/auth'); };
  const name = user?.user_metadata?.full_name?.split(' ')[0] || 'Friend';

  return (
    <div className="app-layout">
      <nav className="sidebar">
        <div className="sidebar-logo" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 6, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: 8 }}>
          <img src="/logo.jpeg" alt="Amity University" style={{ width: '100%', maxWidth: 160, objectFit: 'contain', borderRadius: 6, background: 'white', padding: 4 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <span>🌸</span>
            <span style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 16, fontWeight: 700 }}>MindBloom</span><span style={{ fontSize: 9, fontWeight: 700, color: '#fff', background: 'rgba(255,255,255,0.18)', borderRadius: 4, padding: '1px 5px', marginLeft: 5, letterSpacing: '0.05em', verticalAlign: 'middle', textTransform: 'uppercase' }}>Beta</span>
          </div>
        </div>
        {NAV.map(({ to, icon, label }) => (
          <NavLink key={to} to={to} end={to === '/'}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="icon">{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
        <div className="sidebar-bottom">
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginBottom: 8, paddingLeft: 16 }}>
            Hi, {name} 👋
          </div>
          <button className="sign-out-btn" onClick={handleSignOut}>Sign out</button>
        </div>
      </nav>
      <main className="main-content"><Outlet /></main>
    </div>
  );
}
