import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Upload = lazy(() => import('./pages/Upload'));
const Result = lazy(() => import('./pages/Result'));
const History = lazy(() => import('./pages/History'));
const Diseases = lazy(() => import('./pages/Diseases'));
const Profile = lazy(() => import('./pages/Profile'));
const Admin = lazy(() => import('./pages/Admin'));
const FertilizerCalculator = lazy(() => import('./pages/FertilizerCalculator'));
const DiseaseMap = lazy(() => import('./pages/DiseaseMap'));
const MarketPrices = lazy(() => import('./pages/MarketPrices'));
const AgriStores = lazy(() => import('./pages/AgriStores'));
const ExpertChat = lazy(() => import('./pages/ExpertChat'));
const CommunityFeed = lazy(() => import('./pages/CommunityFeed'));
const Schemes = lazy(() => import('./pages/Schemes'));

const PageLoader = () => (
  <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{ width: '50px', height: '50px', border: '4px solid #e2e8f0', borderTopColor: '#22c55e', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  </div>
);

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }
  
  return user ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return user.role === 'admin' ? children : <Navigate to="/dashboard" />;
};

function AppContent() {
  const { user } = useAuth();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ position: 'relative' }}>
        {user && <Sidebar />}
        <div style={{ padding: user ? '12px 16px 0' : 0, animation: 'fadeIn 0.3s ease' }}>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/upload" element={<PrivateRoute><Upload /></PrivateRoute>} />
              <Route path="/result/:id" element={<PrivateRoute><Result /></PrivateRoute>} />
              <Route path="/history" element={<PrivateRoute><History /></PrivateRoute>} />
              <Route path="/diseases" element={<Diseases />} />
              <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
              <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
              <Route path="/fertilizer" element={<FertilizerCalculator />} />
              <Route path="/disease-map" element={<DiseaseMap />} />
              <Route path="/market-prices" element={<MarketPrices />} />
              <Route path="/nearby-stores" element={<AgriStores />} />
              <Route path="/expert-chat" element={<ExpertChat />} />
              <Route path="/community" element={<CommunityFeed />} />
              <Route path="/schemes" element={<Schemes />} />
            </Routes>
          </Suspense>
        </div>
      </div>
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}

function AppRoutes() {
  return <AppContent />;
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <div className="app">
            <AppRoutes />
          </div>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;

