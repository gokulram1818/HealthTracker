import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginRegister = () => {
  const { login, register, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Tab configuration: 'login' or 'register'
  const [isRegister, setIsRegister] = useState(searchParams.get('mode') === 'register');
  
  // Registration and Login States
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState(searchParams.get('role') || 'citizen');
  
  // UI States
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'health_worker') navigate('/worker');
      else navigate('/dashboard');
    }
  }, [user, navigate]);

  // Sync mode parameter if it changes in URL
  useEffect(() => {
    setIsRegister(searchParams.get('mode') === 'register');
    if (searchParams.get('role')) {
      setRole(searchParams.get('role'));
    }
  }, [searchParams]);

  const validateForm = () => {
    if (!email) {
      setError('Email address is required.');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.');
      return false;
    }
    if (!password) {
      setError('Password is required.');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return false;
    }
    if (isRegister) {
      if (!name) {
        setError('Full Name is required for registration.');
        return false;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!validateForm()) return;
    
    const cleanEmail = email.trim().toLowerCase();
    setLoading(true);
    try {
      if (isRegister) {
        await register(name.trim(), cleanEmail, password, role);
        setSuccess('Account created successfully! You can now log in.');
        setIsRegister(false);
        // Clear fields
        setPassword('');
        setConfirmPassword('');
      } else {
        const loggedInUser = await login(cleanEmail, password);
        setSuccess(`Logged in successfully as ${loggedInUser.name || loggedInUser.email}`);
        
        // Navigation is handled by the useEffect redirecting based on role
      }
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data) {
        const serverError = err.response.data;
        if (serverError.detail) {
          setError(serverError.detail);
        } else if (serverError.email) {
          setError(serverError.email[0]);
        } else {
          setError(JSON.stringify(serverError));
        }
      } else {
        setError('Network error: Could not reach the server.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 d-flex justify-content-center align-items-center flex-grow-1 animated-fade">
      <div className="card border-0 shadow-lg overflow-hidden w-100" style={{ maxWidth: '500px' }}>
        <div className="bg-gradient-primary text-white p-4 text-center">
          <i className="bi bi-shield-plus fs-1"></i>
          <h2 className="fw-bold mt-2">{isRegister ? 'Create Account' : 'Welcome Back'}</h2>
          <p className="text-white-50 mb-0">
            {isRegister 
              ? 'Join the community vaccination tracker' 
              : 'Sign in to access your dashboard'}
          </p>
        </div>

        <div className="card-body p-4 text-start">
          {error && (
            <div className="alert alert-danger alert-premium d-flex align-items-center" role="alert">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              <div>{error}</div>
            </div>
          )}

          {success && (
            <div className="alert alert-success alert-premium d-flex align-items-center" role="alert">
              <i className="bi bi-check-circle-fill me-2"></i>
              <div>{success}</div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {isRegister && (
              <div className="mb-3">
                <label className="form-label fw-semibold">Full Name</label>
                <div className="input-group">
                  <span className="input-group-text bg-light"><i className="bi bi-person text-muted"></i></span>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Enter full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="mb-3">
              <label className="form-label fw-semibold">Email Address</label>
              <div className="input-group">
                <span className="input-group-text bg-light"><i className="bi bi-envelope text-muted"></i></span>
                <input 
                  type="email" 
                  className="form-control" 
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Password</label>
              <div className="input-group">
                <span className="input-group-text bg-light"><i className="bi bi-lock text-muted"></i></span>
                <input 
                  type="password" 
                  className="form-control" 
                  placeholder="Enter password (min 6 chars)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {isRegister && (
              <>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Confirm Password</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light"><i className="bi bi-lock-fill text-muted"></i></span>
                    <input 
                      type="password" 
                      className="form-control" 
                      placeholder="Repeat password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold">Register As</label>
                  <div className="d-flex gap-3">
                    <div className="form-check flex-fill p-3 border rounded text-center" style={{ cursor: 'pointer', borderColor: role === 'citizen' ? 'var(--primary)' : 'var(--border-color)', backgroundColor: role === 'citizen' ? 'rgba(2, 132, 199, 0.05)' : 'transparent' }} onClick={() => setRole('citizen')}>
                      <input 
                        className="form-check-input d-none" 
                        type="radio" 
                        name="role" 
                        id="roleCitizen" 
                        checked={role === 'citizen'} 
                        onChange={() => setRole('citizen')}
                      />
                      <label className="form-check-label w-100 fw-bold" style={{ cursor: 'pointer' }} htmlFor="roleCitizen">
                        <i className="bi bi-people fs-4 d-block mb-1 text-primary"></i>
                        Citizen
                      </label>
                    </div>
                    <div className="form-check flex-fill p-3 border rounded text-center" style={{ cursor: 'pointer', borderColor: role === 'health_worker' ? 'var(--secondary)' : 'var(--border-color)', backgroundColor: role === 'health_worker' ? 'rgba(16, 185, 129, 0.05)' : 'transparent' }} onClick={() => setRole('health_worker')}>
                      <input 
                        className="form-check-input d-none" 
                        type="radio" 
                        name="role" 
                        id="roleWorker" 
                        checked={role === 'health_worker'} 
                        onChange={() => setRole('health_worker')}
                      />
                      <label className="form-check-label w-100 fw-bold" style={{ cursor: 'pointer' }} htmlFor="roleWorker">
                        <i className="bi bi-shield-shaded fs-4 d-block mb-1 text-secondary"></i>
                        Health Worker
                      </label>
                    </div>
                  </div>
                </div>
              </>
            )}

            <button 
              type="submit" 
              className={`w-100 btn ${isRegister ? 'btn-gradient-secondary' : 'btn-gradient'} d-flex justify-content-center align-items-center gap-2`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  Please wait...
                </>
              ) : (
                <>
                  <i className={isRegister ? 'bi bi-person-plus-fill' : 'bi bi-box-arrow-in-right'}></i>
                  {isRegister ? 'Sign Up' : 'Sign In'}
                </>
              )}
            </button>
          </form>

          <hr className="my-4" />

          <div className="text-center">
            <button 
              className="btn btn-link text-decoration-none fw-semibold"
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
                setSuccess('');
              }}
            >
              {isRegister 
                ? 'Already have an account? Sign In' 
                : "Don't have an account? Sign Up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginRegister;
