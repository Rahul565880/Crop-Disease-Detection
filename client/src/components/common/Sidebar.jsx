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

  useEffect(() => { setOpen(false); }, [location.pathname]);

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          background: '#1a3a1a', border: 'none', color: '#fff', cursor: 'pointer',
          padding: '8px 14px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 600,
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          transition: 'all 0.2s',
          marginBottom: '12px',
        }}
      >
        ☰ <span style={{ display: 'none' }} className="toggle-label">Menu</span>
      </button>

      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 999,
            background: 'rgba(0,0,0,0.5)',
            animation: 'fadeIn 0.2s ease',
          }}
        />
      )}

      <div data-sidebar style={{
        position: 'fixed', top: 0, left: 0, zIndex: 1000,
        width: 'min(280px, 80vw)', height: '100vh',
        background: '#1a3a1a',
        display: 'flex', flexDirection: 'column',
        boxShadow: '4px 0 30px rgba(0,0,0,0.4)',
        transform: open ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        pointerEvents: open ? 'auto' : 'none',
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '18px 20px', borderBottom: '1px solid #2d5a2d',
        }}>
          <span style={{ color: '#e2e8f0', fontSize: '1rem', fontWeight: 700 }}>
            🧰 Tools
          </span>
          <button onClick={() => setOpen(false)} style={{
            background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff',
            cursor: 'pointer', fontSize: '1.1rem', padding: '6px 12px',
            borderRadius: '8px', transition: 'background 0.2s',
          }}>✕</button>
        </div>

        <div style={{
          padding: '10px 12px', flex: 1, overflowY: 'auto',
        }}>
          {SIDEBAR_ITEMS.map(item => {
            const active = isActive(item.path);
            return (
              <Link key={item.path} to={item.path} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px 16px', margin: '3px 0', borderRadius: '10px',
                background: active ? '#2d5a2d' : 'transparent',
                color: active ? '#fff' : '#c8e6c9',
                textDecoration: 'none', fontWeight: active ? '600' : '400',
                fontSize: '0.95rem', transition: 'all 0.2s',
              }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
              >
                <span style={{ fontSize: '1.3rem', width: '28px', textAlign: 'center' }}>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        <div style={{
          padding: '14px 20px', borderTop: '1px solid #2d5a2d',
          fontSize: '0.75rem', color: '#6b8f6b', textAlign: 'center',
        }}>
          Crop Disease Detection v1.0
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @media (max-width: 640px) {
          .toggle-label { display: inline !important; }
        }
      `}</style>
    </>
  );
};

export default Sidebar;
