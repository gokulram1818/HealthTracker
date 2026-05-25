import React, { useState, useEffect } from 'react';
import api from '../api';

const HealthCamps = () => {
  const [camps, setCamps] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [campsRes, regsRes] = await Promise.all([
        api.get('health-camps/'),
        api.get('camp-registrations/')
      ]);
      setCamps(campsRes.data);
      setRegistrations(regsRes.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch health camps or registration data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRegister = async (campId) => {
    setActionLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await api.post('camp-registrations/', { camp: campId });
      setRegistrations(prev => [...prev, res.data]);
      setSuccess("Successfully registered for the health camp!");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Failed to register for this camp. You may already be registered.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelRegistration = async (registrationId) => {
    if (!window.confirm("Are you sure you want to cancel your registration for this camp?")) return;
    setActionLoading(true);
    setError('');
    setSuccess('');
    try {
      await api.delete(`camp-registrations/${registrationId}/`);
      setRegistrations(prev => prev.filter(r => r.id !== registrationId));
      setSuccess("Registration cancelled successfully.");
    } catch (err) {
      console.error(err);
      setError("Failed to cancel registration.");
    } finally {
      setActionLoading(false);
    }
  };

  const filteredCamps = camps.filter(camp => 
    camp.location.toLowerCase().includes(search.toLowerCase()) ||
    camp.vaccine_type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container py-5 animated-fade flex-grow-1 text-start">
      <div className="mb-4">
        <h1 className="fw-bold mb-1">Health Camps & Clinics</h1>
        <p className="text-secondary mb-0">Locate regional immunization drives, general health checkup camps, and secure your registration.</p>
      </div>

      {success && (
        <div className="alert alert-success alert-premium mb-4" role="alert">
          <i className="bi bi-check-circle-fill me-2"></i>{success}
        </div>
      )}

      {error && (
        <div className="alert alert-danger alert-premium mb-4" role="alert">
          <i className="bi bi-exclamation-octagon-fill me-2"></i>{error}
        </div>
      )}

      {/* Search Input */}
      <div className="row mb-4">
        <div className="col-12 col-md-6">
          <div className="input-group shadow-sm">
            <span className="input-group-text bg-white border-end-0"><i className="bi bi-search text-muted"></i></span>
            <input 
              type="text" 
              className="form-control border-start-0" 
              placeholder="Search by location or vaccine brand..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Grid listing */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading camps...</span>
          </div>
        </div>
      ) : filteredCamps.length > 0 ? (
        <div className="row g-4">
          {filteredCamps.map((camp) => {
            const registration = registrations.find(r => r.camp === camp.id);
            const isRegistered = !!registration;

            return (
              <div key={camp.id} className="col-md-6">
                <div className="card h-100 p-4 border-0 shadow-sm glass-card d-flex flex-column justify-content-between">
                  <div>
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className="d-flex flex-wrap gap-2">
                        <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 fw-bold">
                          <i className="bi bi-heart-pulse-fill me-1"></i> {camp.vaccine_type}
                        </span>
                        {isRegistered && (
                          <span className="badge bg-success bg-opacity-10 text-success px-3 py-2 fw-bold">
                            <i className="bi bi-check-circle-fill me-1"></i> Registered
                          </span>
                        )}
                      </div>
                      <span className="text-secondary small fw-semibold">
                        <i className="bi bi-calendar-event me-1"></i> {camp.date}
                      </span>
                    </div>
                    
                    <h3 className="h5 fw-bold mb-2 text-dark">{camp.vaccine_type} Immunization Drive</h3>
                    
                    <p className="text-secondary mb-3 small" style={{ minHeight: '40px' }}>
                      {camp.description || 'General immunization drive for community residents. Register and attend with active identification card.'}
                    </p>
                  </div>
                  
                  <div className="border-top pt-3 mt-2 d-flex justify-content-between align-items-center flex-wrap gap-2">
                    <div className="d-flex align-items-center text-secondary small">
                      <i className="bi bi-geo-alt-fill text-danger fs-5 me-2"></i>
                      <div>
                        <span className="text-muted d-block small uppercase" style={{ fontSize: '0.75rem' }}>Location</span>
                        <strong className="text-dark">{camp.location}</strong>
                      </div>
                    </div>
                    
                    <div>
                      {isRegistered ? (
                        <button 
                          className="btn btn-sm btn-outline-danger" 
                          onClick={() => handleCancelRegistration(registration.id)}
                          disabled={actionLoading}
                        >
                          <i className="bi bi-x-circle me-1"></i> Cancel Registration
                        </button>
                      ) : (
                        <button 
                          className="btn btn-sm btn-gradient" 
                          onClick={() => handleRegister(camp.id)}
                          disabled={actionLoading}
                        >
                          <i className="bi bi-clipboard-plus me-1"></i> Register for Camp
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card border-0 p-5 shadow-sm text-center">
          <i className="bi bi-pin-map text-muted display-4 mb-3"></i>
          <h3 className="h5 fw-bold">No Scheduled Camps Found</h3>
          <p className="text-secondary mb-0">No active clinics matched your search query. Check back soon for new drives.</p>
        </div>
      )}
    </div>
  );
};

export default HealthCamps;
