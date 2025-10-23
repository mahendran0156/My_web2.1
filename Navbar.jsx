import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Shield, Activity, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

const Navbar = ({ account, isAuthenticated, setIsAuthenticated, setAccount }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    // Clear authentication
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setAccount(null);
    
    // Close mobile menu
    setMobileMenuOpen(false);
    
    // Redirect to home
    navigate('/');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const NavLink = ({ to, children, onClick }) => (
    <Link 
      to={to}
      onClick={onClick}
      className={`px-3 py-2 rounded-md transition-colors font-medium ${
        isActive(to) 
          ? 'bg-blue-100 text-blue-700' 
          : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
      }`}
    >
      {children}
    </Link>
  );

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Shield className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-800">SecureHealth</span>
              <Activity className="h-6 w-6 text-green-600" />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {/* Always show Home */}
            <NavLink to="/">Home</NavLink>

            {/* Protected Navigation - Only show when authenticated */}
            {isAuthenticated ? (
              <>
                <NavLink to="/dashboard">Dashboard</NavLink>
                <NavLink to="/records">Records</NavLink>
                <NavLink to="/ai-analysis">AI Analysis</NavLink>
                <NavLink to="/blockchain">Blockchain</NavLink>
                <NavLink to="/security">Security</NavLink>

                {/* User Info & Logout */}
                <div className="flex items-center gap-3 ml-4 pl-4 border-l-2 border-gray-200">
                  <div className="bg-green-100 text-green-800 px-3 py-1.5 rounded-lg text-sm font-medium">
                    {account?.substring(0, 20)}{account?.length > 20 ? '...' : ''}
                  </div>
                  <button 
                    onClick={handleLogout} 
                    className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-semibold shadow-md hover:shadow-lg"
                    title="Logout"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              // Public Navigation - Show when NOT authenticated
              <>
                <NavLink to="/login">Login</NavLink>
                <Link 
                  to="/signup"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-md hover:shadow-lg ml-2"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-gray-700 hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link 
              to="/" 
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-md ${
                isActive('/') ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Home
            </Link>

            {isAuthenticated ? (
              <>
                <Link 
                  to="/dashboard" 
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md ${
                    isActive('/dashboard') ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/records" 
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md ${
                    isActive('/records') ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Records
                </Link>
                <Link 
                  to="/ai-analysis" 
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md ${
                    isActive('/ai-analysis') ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  AI Analysis
                </Link>
                <Link 
                  to="/cancer-detection" 
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md ${
                    isActive('/cancer-detection') ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Cancer Detection
                </Link>
                <Link 
                  to="/blockchain" 
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md ${
                    isActive('/blockchain') ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Blockchain
                </Link>
                <Link 
                  to="/security" 
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md ${
                    isActive('/security') ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Security
                </Link>

                <div className="border-t border-gray-200 pt-3 mt-3">
                  <div className="px-3 py-2 text-sm text-gray-600">
                    Logged in as: <span className="font-semibold">{account}</span>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded-md font-semibold"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
                >
                  Login
                </Link>
                <Link 
                  to="/signup" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
