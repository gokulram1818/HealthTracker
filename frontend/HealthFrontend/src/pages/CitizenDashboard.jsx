import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const CitizenDashboard = () => {
  const { user } = useAuth();
  const [vaccinations, setVaccinations] = useState([]);
  const [record, setRecord] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [camps, setCamps] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Call all citizen endpoints
        const [vacsRes, recordRes, notifRes, campsRes, regsRes] = await Promise.all([
          api.get('vaccinations/'),
          api.get('health-records/me/'),
          api.get('notifications/'),
          api.get('health-camps/'),
          api.get('camp-registrations/')
        ]);
        
        setVaccinations(vacsRes.data);
        setRecord(recordRes.data);
        setRegistrations(regsRes.data);
        
        // Show only unread notifications (limit to 3 for preview)
        setNotifications(notifRes.data.filter(n => !n.is_read).slice(0, 3));
        
        // Show next 2 camps
        setCamps(campsRes.data.slice(0, 2));
      } catch (err) {
        console.error("Dashboard data fetch failure:", err);
        setError("Failed to load dashboard data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);


  if (loading) {
    return (
      <div className="container py-5 text-center flex-grow-1">
        <div className="spinner-border text-primary my-5" role="status">
          <span className="visually-hidden">Loading Dashboard...</span>
        </div>
      </div>
    );
  }

  // Calculate vaccination progress
  const totalVacs = vaccinations.length;
  const completedVacs = vaccinations.filter(v => v.status === 'completed').length;
  const progressPercent = totalVacs > 0 ? Math.round((completedVacs / totalVacs) * 100) : 0;
  
  // Find next pending vaccination
  const nextDue = vaccinations
    .filter(v => v.status === 'pending')
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))[0];

  // SVG Circle calculations
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="container py-5 animated-fade flex-grow-1 text-start">
      {/* Welcome Banner */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card bg-gradient-primary text-white border-0 p-4 position-relative overflow-hidden shadow-sm">
            <div className="position-absolute" style={{ width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.05)', top: '-50px', right: '-50px' }}></div>
            <div className="position-relative z-1">
              <h1 className="h2 fw-bold text-white mb-1">Hello, {user.name || user.email}!</h1>
              <p className="mb-0 text-white-50 fs-5">Welcome to your health dashboard. Keep track of your vaccination status and guidelines.</p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger alert-premium mb-4" role="alert">
          <i className="bi bi-exclamation-octagon-fill me-2"></i>{error}
        </div>
      )}

      {/* Main Grid */}
      <div className="row g-4">
        {/* Progress Ring & Next Due */}
        <div className="col-lg-8">
          <div className="row g-4">
            {/* Progress Card */}
            <div className="col-md-6">
              <div className="card h-100 p-4 border-0 shadow-sm glass-card d-flex flex-column align-items-center justify-content-center text-center">
                <h3 className="h5 fw-bold mb-3">Vaccination Coverage</h3>
                
                <div className="metric-ring mb-3">
                  <svg className="metric-ring-svg" width="120" height="120">
                    <circle className="metric-ring-bg" cx="60" cy="60" r={radius} />
                    <circle 
                      className="metric-ring-fill" 
                      cx="60" 
                      cy="60" 
                      r={radius} 
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                    />
                  </svg>
                  <div className="metric-ring-text">{progressPercent}%</div>
                </div>

                <p className="text-secondary small mt-2">
                  Completed {completedVacs} out of {totalVacs} scheduled vaccinations
                </p>
                <Link to="/tracker" className="btn btn-sm btn-outline-primary mt-3 px-3">
                  View Vaccination List
                </Link>
              </div>
            </div>

            {/* Next Due Vaccination Card */}
            <div className="col-md-6">
              <div className="card h-100 p-4 border-0 shadow-sm glass-card d-flex flex-column justify-content-between">
                <div>
                  <h3 className="h5 fw-bold mb-3">Next Vaccination Due</h3>
                  {nextDue ? (
                    <div className="py-2">
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <span className="badge bg-warning bg-opacity-20 text-warning px-2 py-1 fw-bold">
                          <i className="bi bi-clock-fill me-1"></i>Pending
                        </span>
                      </div>
                      <h4 className="fw-bold mb-1">{nextDue.vaccine_name}</h4>
                      <p className="text-secondary mb-0">Due Date: <strong className="text-primary">{nextDue.due_date}</strong></p>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <i className="bi bi-shield-check text-success fs-1"></i>
                      <p className="text-secondary fw-semibold mt-2">You are fully vaccinated!</p>
                    </div>
                  )}
                </div>
                {nextDue && (
                  <Link to="/tracker" className="btn btn-sm btn-gradient w-100 mt-3">
                    View Details
                  </Link>
                )}
              </div>
            </div>

            {/* Medical Info Card */}
            <div className="col-12">
              <div className="card p-4 border-0 shadow-sm bg-body">
                <h3 className="h5 fw-bold mb-3"><i className="bi bi-journal-medical text-primary me-2"></i>Medical Summary</h3>
                {record ? (
                  <div className="row g-3 text-start">
                    <div className="col-md-2 col-sm-4">
                      <span className="text-muted d-block small">Blood Group</span>
                      <strong className="text-danger"><i className="bi bi-heart-pulse-fill me-1"></i>{record.blood_group || 'Not Specified'}</strong>
                    </div>
                    <div className="col-md-3 col-sm-4">
                      <span className="text-muted d-block small">Date of Birth</span>
                      <strong className="text-primary"><i className="bi bi-calendar-date me-1"></i>{record.dob ? new Date(record.dob).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'Not Specified'}</strong>
                    </div>
                    <div className="col-md-2 col-sm-4">
                      <span className="text-muted d-block small">Gender</span>
                      <strong className="text-success"><i className="bi bi-gender-ambiguous me-1"></i>{record.gender ? record.gender.charAt(0).toUpperCase() + record.gender.slice(1).replace(/_/g, ' ') : 'Not Specified'}</strong>
                    </div>
                    <div className="col-md-2 col-sm-6">
                      <span className="text-muted d-block small">Known Allergies</span>
                      <span className="text-dark d-block text-truncate" title={record.allergies}>{record.allergies || 'None'}</span>
                    </div>
                    <div className="col-md-3 col-sm-6">
                      <span className="text-muted d-block small">Chronic History</span>
                      <span className="text-dark d-block text-truncate" title={record.medical_history}>{record.medical_history || 'None'}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-secondary mb-0">No health history set up. Please update your details.</p>
                )}
                <div className="mt-3 text-end">
                  <Link to="/records" className="btn btn-sm btn-outline-primary px-3">
                    Edit Health Record
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Widgets (Notifications & Camps) */}
        <div className="col-lg-4">
          <div className="row g-4">
            {/* Quick Alerts / Notifications */}
            <div className="col-12">
              <div className="card p-4 border-0 shadow-sm glass-card">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h3 className="h5 fw-bold mb-0"><i className="bi bi-bell-fill text-warning me-2"></i>Due Alerts</h3>
                  <Link to="/notifications" className="small text-decoration-none">View All</Link>
                </div>
                {notifications.length > 0 ? (
                  <div className="d-flex flex-column gap-3">
                    {notifications.map(n => (
                      <div key={n.id} className="alert alert-warning alert-premium alert-premium-warning p-3 mb-0" role="alert">
                        <div className="small fw-semibold">{n.message}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted">
                    <i className="bi bi-check2-circle fs-3 text-success"></i>
                    <p className="small mb-0 mt-2">No pending reminders</p>
                  </div>
                )}
              </div>
            </div>

            {/* Health Camps Widget */}
            <div className="col-12">
              <div className="card p-4 border-0 shadow-sm glass-card">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h3 className="h5 fw-bold mb-0"><i className="bi bi-pin-map-fill text-danger me-2"></i>Nearby Camps</h3>
                  <Link to="/camps" className="small text-decoration-none">View All</Link>
                </div>
                {camps.length > 0 ? (
                  <div className="d-flex flex-column gap-3">
                    {camps.map(camp => (
                      <div key={camp.id} className="p-3 border rounded">
                        <h6 className="fw-bold mb-1 text-primary">{camp.vaccine_type} Camp</h6>
                        <div className="small text-secondary mb-1"><i className="bi bi-geo-alt-fill me-1 text-danger"></i>{camp.location}</div>
                        <div className="small text-secondary"><i className="bi bi-calendar-event me-1 text-primary"></i>{camp.date}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-secondary small text-center my-3">No upcoming camps scheduled</p>
                )}
              </div>
            </div>

            {/* My Registered Camps Widget */}
            <div className="col-12">
              <div className="card p-4 border-0 shadow-sm glass-card">
                <h3 className="h5 fw-bold mb-3"><i className="bi bi-bookmark-check-fill text-success me-2"></i>My Registered Camps</h3>
                {registrations.length > 0 ? (
                  <div className="d-flex flex-column gap-3">
                    {registrations.map(reg => (
                      <div key={reg.id} className="p-3 border rounded bg-success bg-opacity-5">
                        <h6 className="fw-bold mb-1 text-success">{reg.camp_vaccine_type} Camp</h6>
                        <div className="small text-secondary mb-1"><i className="bi bi-geo-alt-fill me-1 text-danger"></i>{reg.camp_location}</div>
                        <div className="small text-secondary mb-2"><i className="bi bi-calendar-event me-1 text-primary"></i>{reg.camp_date}</div>
                        <Link to="/camps" className="btn btn-sm btn-outline-success w-100 py-1" style={{ fontSize: '0.8rem' }}>
                          Manage Registration
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-3 text-muted">
                    <i className="bi bi-journal-check fs-3"></i>
                    <p className="small mb-0 mt-2">No registered camps yet. Go to <Link to="/camps">Health Camps</Link> to register.</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default CitizenDashboard;
