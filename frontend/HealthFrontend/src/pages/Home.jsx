import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="animated-fade flex-grow-1">
      {/* Hero Section */}
      <section className="py-5 text-center bg-gradient-primary text-white position-relative overflow-hidden mb-5">
        {/* Subtle background circles */}
        <div className="position-absolute" style={{ width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.05)', top: '-100px', left: '-100px' }}></div>
        <div className="position-absolute" style={{ width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.05)', bottom: '-50px', right: '-50px' }}></div>
        
        <div className="container py-5 position-relative z-1">
          <span className="badge bg-white text-primary mb-3 px-3 py-2 fw-semibold rounded-pill">COMMUNITY IMMUNIZATION PORTAL</span>
          <h1 className="display-4 fw-extrabold text-white mb-3">Community Health &<br />Vaccination Tracker</h1>
          <p className="lead text-white-50 fs-4 max-width-md mx-auto mb-4" style={{ maxWidth: '700px' }}>
            Empowering citizens to manage their immunization schedules, securely store medical records, and receive timely alerts for upcoming clinics.
          </p>
          <div className="d-flex justify-content-center gap-3">
            {user ? (
              <Link 
                to={user.role === 'citizen' ? '/dashboard' : user.role === 'health_worker' ? '/worker' : '/admin'} 
                className="btn btn-light text-primary fw-bold px-4 py-3 btn-lg shadow-sm"
              >
                Go to Dashboard <i className="bi bi-arrow-right-short fs-5 ms-1"></i>
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn btn-light text-primary fw-bold px-4 py-3 btn-lg shadow-sm">
                  Register / Sign In
                </Link>
                <Link to="/about" className="btn btn-outline-light px-4 py-3 btn-lg border-2">
                  Learn More
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Stats Block */}
      <section className="container mb-5">
        <div className="row g-4 justify-content-center text-center">
          <div className="col-6 col-md-3">
            <div className="card border-0 py-4 shadow-sm bg-body">
              <span className="display-6 fw-bold text-primary">15K+</span>
              <span className="text-muted fw-semibold">Vaccinations Handled</span>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card border-0 py-4 shadow-sm bg-body">
              <span className="display-6 fw-bold text-secondary">99.2%</span>
              <span className="text-muted fw-semibold">Accuracy Rate</span>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card border-0 py-4 shadow-sm bg-body">
              <span className="display-6 fw-bold text-info">24/7</span>
              <span className="text-muted fw-semibold">Due Reminders</span>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card border-0 py-4 shadow-sm bg-body">
              <span className="display-6 fw-bold text-accent">50+</span>
              <span className="text-muted fw-semibold">Active Health Camps</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container py-4 mb-5">
        <h2 className="text-center fw-bold mb-5 fs-2">Platform Features Designed for You</h2>
        <div className="row g-4">
          <div className="col-md-4">
            <div className="card h-100 p-4 border-0 shadow-sm glass-card text-start">
              <div className="bg-primary bg-opacity-10 text-primary rounded-3 d-inline-flex p-3 mb-4">
                <i className="bi bi-clock-history fs-3"></i>
              </div>
              <h3 className="h5 fw-bold mb-3">Vaccination Tracker</h3>
              <p className="text-secondary">
                View your complete vaccination schedule. Monitor upcoming vaccinations, check completed doses, and log immunizations securely.
              </p>
            </div>
          </div>
          
          <div className="col-md-4">
            <div className="card h-100 p-4 border-0 shadow-sm glass-card text-start">
              <div className="bg-secondary bg-opacity-10 text-secondary rounded-3 d-inline-flex p-3 mb-4">
                <i className="bi bi-file-earmark-medical fs-3"></i>
              </div>
              <h3 className="h5 fw-bold mb-3">Secure Health Records</h3>
              <p className="text-secondary">
                Maintain and update core medical records like blood groups, chronic conditions, and allergy listings to keep healthcare workers fully informed.
              </p>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card h-100 p-4 border-0 shadow-sm glass-card text-start">
              <div className="bg-info bg-opacity-10 text-info rounded-3 d-inline-flex p-3 mb-4">
                <i className="bi bi-pin-angle fs-3"></i>
              </div>
              <h3 className="h5 fw-bold mb-3">Local Health Camps</h3>
              <p className="text-secondary">
                Discover immunization and checking camps near you. Find locations, available vaccine brands, and camp operational schedules in real time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Info CTA Banner */}
      <section className="bg-light py-5 border-top border-bottom mb-5">
        <div className="container">
          <div className="row align-items-center g-4 text-start">
            <div className="col-md-8">
              <h2 className="fw-bold mb-2">Are you a Certified Health Worker?</h2>
              <p className="text-secondary fs-5 mb-0">
                Register as a worker to manage citizen records, log vaccination details, and schedule community health camps.
              </p>
            </div>
            <div className="col-md-4 text-md-end">
              <Link to="/login?mode=register&role=health_worker" className="btn btn-gradient-secondary btn-lg">
                <i className="bi bi-shield-lock-fill me-2"></i>Worker Registration
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
