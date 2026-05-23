import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

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
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <div style={{
        width: collapsed ? '60px' : '220px',
        background: '#1a3a1a',
        minHeight: 'calc(100vh - 56px)',
        transition: 'width 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid #2d5a2d',
        flexShrink: 0,
      }}>
        <button onClick={() => setCollapsed(!collapsed)} style={{
          background: 'transparent', border: 'none', color: '#a0c0a0', padding: '12px',
          cursor: 'pointer', fontSize: '1.2rem', textAlign: collapsed ? 'center' : 'right',
        }}>
          {collapsed ? '☰' : '✕'}
        </button>

        <div style={{ padding: '0.5rem 0' }}>
          {SIDEBAR_ITEMS.map(item => {
            const active = isActive(item.path);
            return (
              <Link key={item.path} to={item.path} style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: collapsed ? '12px 0' : '10px 16px',
                margin: '2px 8px', borderRadius: '8px',
                background: active ? '#2d5a2d' : 'transparent',
                color: active ? '#fff' : '#a0c0a0',
                textDecoration: 'none', fontWeight: active ? '600' : '400',
                fontSize: '0.9rem', transition: 'all 0.2s',
                justifyContent: collapsed ? 'center' : 'flex-start',
                whiteSpace: 'nowrap',
              }}>
                <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </div>
      </div>

      {collapsed && (
        <div style={{
          position: 'fixed', left: '60px', top: '56px', zIndex: 999,
          background: '#1a3a1a', borderRadius: '0 8px 8px 0', padding: '0.5rem',
          display: 'none',
        }}>
          {SIDEBAR_ITEMS.map(item => (
            <Link key={item.path} to={item.path} style={{
              display: 'block', padding: '8px 12px', color: '#fff', textDecoration: 'none',
              fontSize: '0.85rem', whiteSpace: 'nowrap',
            }}>
              {item.icon} {item.label}
            </Link>
          ))}
        </div>
      )}
    </>
  );
};

export default Sidebar;
