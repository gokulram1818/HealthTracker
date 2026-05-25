import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Pages
import Home from './pages/Home';
import About from './pages/About';
import LoginRegister from './pages/LoginRegister';
import CitizenDashboard from './pages/CitizenDashboard';
import VaccinationTracker from './pages/VaccinationTracker';
import HealthRecords from './pages/HealthRecords';
import Notifications from './pages/Notifications';
import HealthCamps from './pages/HealthCamps';
import HealthWorkerDashboard from './pages/HealthWorkerDashboard';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="d-flex flex-column min-vh-100">
          <Navbar />
          
          <main className="flex-grow-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/login" element={<LoginRegister />} />
              
              {/* Protected Citizen Routes */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['citizen']}>
                    <CitizenDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/tracker" 
                element={
                  <ProtectedRoute allowedRoles={['citizen']}>
                    <VaccinationTracker />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/records" 
                element={
                  <ProtectedRoute allowedRoles={['citizen']}>
                    <HealthRecords />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/notifications" 
                element={
                  <ProtectedRoute allowedRoles={['citizen']}>
                    <Notifications />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/camps" 
                element={
                  <ProtectedRoute allowedRoles={['citizen']}>
                    <HealthCamps />
                  </ProtectedRoute>
                } 
              />
              
              {/* Protected Health Worker Routes */}
              <Route 
                path="/worker" 
                element={
                  <ProtectedRoute allowedRoles={['health_worker', 'admin']}>
                    <HealthWorkerDashboard />
                  </ProtectedRoute>
                } 
              />
              
              {/* Protected Admin Routes */}
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          
          <footer className="py-4 border-top text-center text-secondary bg-body mt-auto">
            <div className="container">
              <p className="mb-0 small">&copy; {new Date().getFullYear()} CommHealth Portal. Empowering community health & vaccination tracking.</p>
            </div>
          </footer>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
