import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import Result from './pages/Result';
import History from './pages/History';
import Diseases from './pages/Diseases';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import FertilizerCalculator from './pages/FertilizerCalculator';
import DiseaseMap from './pages/DiseaseMap';
import MarketPrices from './pages/MarketPrices';
import AgriStores from './pages/AgriStores';
import ExpertChat from './pages/ExpertChat';
import CommunityFeed from './pages/CommunityFeed';
import Schemes from './pages/Schemes';

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
      <div style={{ display: 'flex', flex: 1 }}>
        {user && <Sidebar />}
        <div style={{ flex: 1, minWidth: 0 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } />
            <Route path="/upload" element={
              <PrivateRoute>
                <Upload />
              </PrivateRoute>
            } />
            <Route path="/result/:id" element={
              <PrivateRoute>
                <Result />
              </PrivateRoute>
            } />
            <Route path="/history" element={
              <PrivateRoute>
                <History />
              </PrivateRoute>
            } />
            <Route path="/diseases" element={<Diseases />} />
            <Route path="/profile" element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            } />
            <Route path="/admin" element={
              <AdminRoute>
                <Admin />
              </AdminRoute>
            } />
            <Route path="/fertilizer" element={<FertilizerCalculator />} />
            <Route path="/disease-map" element={<DiseaseMap />} />
            <Route path="/market-prices" element={<MarketPrices />} />
            <Route path="/nearby-stores" element={<AgriStores />} />
            <Route path="/expert-chat" element={<ExpertChat />} />
            <Route path="/community" element={<CommunityFeed />} />
            <Route path="/schemes" element={<Schemes />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

function AppRoutes() {
  return <AppContent />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

