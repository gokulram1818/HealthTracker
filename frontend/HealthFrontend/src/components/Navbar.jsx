import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(localStorage.getItem('theme') === 'dark');
  const [unreadCount, setUnreadCount] = useState(0);

  // Apply theme on load and toggle
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Fetch unread notification counts for citizens
  useEffect(() => {
    if (user && user.role === 'citizen') {
      const fetchUnread = async () => {
        try {
          const res = await api.get('notifications/');
          const unread = res.data.filter(n => !n.is_read).length;
          setUnreadCount(unread);
        } catch (e) {
          console.error("Failed to fetch notification count", e);
        }
      };
      fetchUnread();
      // Periodically refresh notifications
      const interval = setInterval(fetchUnread, 30000);
      return () => clearInterval(interval);
    } else {
      setUnreadCount(0);
    }
  }, [user, location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path ? 'active font-weight-bold text-primary' : '';

  return (
    <nav className="navbar navbar-expand-lg custom-navbar py-3">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <i className="bi bi-shield-plus text-primary fs-3 me-2"></i>
          <span className="fw-bold fs-4 text-primary">CommHealth</span>
        </Link>
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav" 
          aria-controls="navbarNav" 
          aria-expanded="false" 
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className={`nav-link mx-2 ${isActive('/')}`} to="/">Home</Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link mx-2 ${isActive('/about')}`} to="/about">About</Link>
            </li>
            
            {/* Citizen navigation */}
            {user && user.role === 'citizen' && (
              <>
                <li className="nav-item">
                  <Link className={`nav-link mx-2 ${isActive('/dashboard')}`} to="/dashboard">Dashboard</Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link mx-2 ${isActive('/tracker')}`} to="/tracker">Vaccinations</Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link mx-2 ${isActive('/records')}`} to="/records">Health Records</Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link mx-2 ${isActive('/camps')}`} to="/camps">Camps</Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link mx-2 position-relative ${isActive('/notifications')}`} to="/notifications">
                    Notifications
                    {unreadCount > 0 && (
                      <span className="position-absolute top-1 start-100 translate-middle badge rounded-pill bg-danger">
                        {unreadCount}
                      </span>
                    )}
                  </Link>
                </li>
              </>
            )}

            {/* Health Worker navigation */}
            {user && user.role === 'health_worker' && (
              <li className="nav-item">
                <Link className={`nav-link mx-2 ${isActive('/worker')}`} to="/worker">Worker Panel</Link>
              </li>
            )}

            {/* Admin navigation */}
            {user && user.role === 'admin' && (
              <li className="nav-item">
                <Link className={`nav-link mx-2 ${isActive('/admin')}`} to="/admin">Admin Panel</Link>
              </li>
            )}
          </ul>

          <div className="d-flex align-items-center gap-3">
            {/* Theme Toggle Button */}
            <button 
              className="btn btn-outline-secondary border-0 rounded-circle" 
              onClick={() => setDarkMode(!darkMode)}
              title="Toggle theme"
            >
              {darkMode ? <i className="bi bi-sun-fill"></i> : <i className="bi bi-moon-fill"></i>}
            </button>

            {user ? (
              <div className="dropdown">
                <button 
                  className="btn btn-outline-primary dropdown-toggle d-flex align-items-center gap-2" 
                  type="button" 
                  id="userDropdown" 
                  data-bs-toggle="dropdown" 
                  aria-expanded="false"
                >
                  <i className="bi bi-person-circle"></i>
                  <span>{user.name || user.email}</span>
                  <span className="badge bg-secondary text-uppercase" style={{ fontSize: '0.7rem' }}>{user.role}</span>
                </button>
                <ul className="dropdown-menu dropdown-menu-end shadow" aria-labelledby="userDropdown">
                  {user.role === 'citizen' && (
                    <>
                      <li><Link className="dropdown-item" to="/dashboard"><i className="bi bi-grid-fill me-2"></i>Dashboard</Link></li>
                      <li><Link className="dropdown-item" to="/records"><i className="bi bi-journal-medical me-2"></i>Medical Records</Link></li>
                      <li><hr className="dropdown-divider" /></li>
                    </>
                  )}
                  {user.role === 'health_worker' && (
                    <>
                      <li><Link className="dropdown-item" to="/worker"><i className="bi bi-shield-shaded me-2"></i>Worker Panel</Link></li>
                      <li><hr className="dropdown-divider" /></li>
                    </>
                  )}
                  {user.role === 'admin' && (
                    <>
                      <li><Link className="dropdown-item" to="/admin"><i className="bi bi-speedometer2 me-2"></i>Admin Panel</Link></li>
                      <li><hr className="dropdown-divider" /></li>
                    </>
                  )}
                  <li>
                    <button className="dropdown-item text-danger" onClick={handleLogout}>
                      <i className="bi bi-box-arrow-right me-2"></i>Logout
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <Link className="btn btn-gradient" to="/login">
                <i className="bi bi-box-arrow-in-right me-2"></i>Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
