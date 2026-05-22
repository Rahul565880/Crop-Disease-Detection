import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/index.css'
import './i18n'

navigator.serviceWorker?.ready.then(reg => {
  if ('PushManager' in window) {
    Notification.requestPermission().then(perm => {
      if (perm === 'granted') {
        reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array('BEx6jJxfIalBv7KouZPN7bPmPJmJsLk8cTO-RhAn4VY3TqL-QIK-M7b6nBfPxn_7GsFYBQ-jwL4jSgVkKjqF2rA') }).then(sub => {
          const token = localStorage.getItem('token');
          if (token) {
            fetch(`${import.meta.env.VITE_API_URL || 'https://crop-disease-detection-98fp.onrender.com/api'}/notifications/subscribe`, {
              method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({ subscription: sub.toJSON() })
            }).catch(() => {});
          }
        }).catch(() => {});
      }
    }).catch(() => {});
  }
});

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
