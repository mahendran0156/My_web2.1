import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import PatientRecords from './pages/PatientRecords';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AIAnalysis from './pages/AIAnalysis';
import BlockchainTransactions from './pages/BlockchainTransactions';
import SecuritySettings from './pages/SecuritySettings';

// Layout component to conditionally show navbar
function Layout({ children, account, setAccount, isAuthenticated, setIsAuthenticated }) {
  const location = useLocation();
  
  // Hide navbar on login and signup pages
  const hideNavbar = location.pathname === '/login' || location.pathname === '/signup';

  return (
    <>
      {!hideNavbar && (
        <Navbar 
          account={account} 
          setAccount={setAccount} 
          isAuthenticated={isAuthenticated} 
          setIsAuthenticated={setIsAuthenticated} 
        />
      )}
      <div className={hideNavbar ? '' : 'pt-0'}>
        {children}
      </div>
    </>
  );
}

function App() {
  const [account, setAccount] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      try {
        const userData = JSON.parse(user);
        setAccount(userData.email);
        setIsAuthenticated(true);
      } catch (err) {
        console.error('Failed to parse user data:', err);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
        <div className="text-center">
          <div className="animate-spin h-16 w-16 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold text-lg">Loading SecureHealth...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
        <Layout 
          account={account} 
          setAccount={setAccount} 
          isAuthenticated={isAuthenticated} 
          setIsAuthenticated={setIsAuthenticated}
        >
          <Routes>
            {/* ========================================= */}
            {/* PUBLIC ROUTES */}
            {/* ========================================= */}
            <Route path="/" element={<LandingPage />} />
            
            <Route 
              path="/login" 
              element={
                isAuthenticated ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <Login setIsAuthenticated={setIsAuthenticated} setAccount={setAccount} />
                )
              } 
            />
            
            <Route 
              path="/signup" 
              element={
                isAuthenticated ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <Signup />
                )
              } 
            />

            {/* ========================================= */}
            {/* PROTECTED ROUTES */}
            {/* ========================================= */}
            
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard account={account} />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/records" 
              element={
                <ProtectedRoute>
                  <PatientRecords account={account} />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/ai-analysis" 
              element={
                <ProtectedRoute>
                  <AIAnalysis />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/blockchain" 
              element={
                <ProtectedRoute>
                  <BlockchainTransactions account={account} />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/security" 
              element={
                <ProtectedRoute>
                  <SecuritySettings />
                </ProtectedRoute>
              } 
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </div>
    </Router>
  );
}

export default App;
