import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

const SIDEBAR_ITEMS = [
  { path: '/fertilizer', icon: '🧪', label: 'Fertilizer' },
  { path: '/disease-map', icon: '🗺️', label: 'Outbreaks' },
  { path: '/market-prices', icon: '📈', label: 'Prices' },
  { path: '/nearby-stores', icon: '🏪', label: 'Stores' },
  { path: '/expert-chat', icon: '💬', label: 'Chat' },
  { path: '/community', icon: '🌾', label: 'Community' },
  { path: '/schemes', icon: '🏛️', label: 'Schemes' },
];

const Sidebar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleClick = (e) => {
      if (open && !e.target.closest('[data-sidebar]') && !e.target.closest('[data-sidebar-toggle]')) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <button data-sidebar-toggle onClick={() => setOpen(true)} style={{
        position: 'fixed', left: 0, top: '70px', zIndex: 1001,
        background: '#1a3a1a', border: 'none', color: '#fff', cursor: 'pointer',
        padding: '10px 12px', borderRadius: '0 16px 16px 0', fontSize: '1.2rem',
        boxShadow: '2px 2px 8px rgba(0,0,0,0.3)',
        display: open ? 'none' : 'block',
      }}>☰</button>

      {open && (
        <div data-sidebar style={{
          position: 'fixed', left: 0, top: '56px', zIndex: 1000,
          width: '220px', height: 'calc(100vh - 56px)',
          background: '#1a3a1a', borderRight: '1px solid #2d5a2d',
          display: 'flex', flexDirection: 'column',
          boxShadow: '4px 0 20px rgba(0,0,0,0.3)',
          animation: 'slideIn 0.2s ease',
          borderRadius: '0 20px 20px 0',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid #2d5a2d' }}>
            <span style={{ color: '#a0c0a0', fontSize: '0.85rem', fontWeight: 600 }}>🧰 Tools</span>
            <button onClick={() => setOpen(false)} style={{
              background: 'transparent', border: 'none', color: '#a0c0a0', cursor: 'pointer', fontSize: '1.1rem', padding: '4px'
            }}>✕</button>
          </div>

          <div style={{ padding: '0.5rem 0', flex: 1, overflowY: 'auto' }}>
            {SIDEBAR_ITEMS.map(item => {
              const active = isActive(item.path);
              return (
                <Link key={item.path} to={item.path} onClick={() => setOpen(false)} style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 16px', margin: '2px 8px', borderRadius: '8px',
                  background: active ? '#2d5a2d' : 'transparent',
                  color: active ? '#fff' : '#a0c0a0',
                  textDecoration: 'none', fontWeight: active ? '600' : '400',
                  fontSize: '0.9rem', transition: 'all 0.2s',
                }}>
                  <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideIn { from { transform: translateX(-100%); } to { transform: translateX(0); } }
      `}</style>
    </>
  );
};

export default Sidebar;
