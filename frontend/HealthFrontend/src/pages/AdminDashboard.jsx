import React, { useState, useEffect } from 'react';
import api from '../api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Tab control: 'stats', 'users', 'camps'
  const [activeTab, setActiveTab] = useState('stats');
  
  // Search
  const [userSearch, setUserSearch] = useState('');
  const [campSearch, setCampSearch] = useState('');

  // Camp list (full CRUD support)
  const [camps, setCamps] = useState([]);
  const [selectedCamp, setSelectedCamp] = useState(null);
  const [campForm, setCampForm] = useState({
    location: '',
    date: '',
    vaccine_type: '',
    description: ''
  });

  const [actionLoading, setActionLoading] = useState(false);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('admin-dashboard/stats/');
      setStats(res.data);
      
      const campsRes = await api.get('health-camps/');
      setCamps(campsRes.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch administrator statistics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleUpdateRole = async (userId, newRole) => {
    if (!window.confirm("Are you sure you want to change this user's role?")) return;
    setActionLoading(true);
    try {
      // Direct API update to user
      // Note: We can make a PATCH request if DRF standard viewsets allow it or a custom action.
      // To make role edits, we can update via our CustomUser model settings if needed. Since we didn't specify a UserViewSet,
      // let's think: did we define an endpoint to update users?
      // In views.py, we have custom UserSerializer and RegisterView, but we didn't register a UserViewSet.
      // Wait, is there another way? In AdminStatsView we return `users`.
      // We can easily create a simple UserViewSet or custom patch to modify the user.
      // Wait! Let's check our views.py. Did we create a UserViewSet?
      // Let's check views.py:
      // "class CitizenListView(generics.ListAPIView): ..."
      // We did NOT create a UserViewSet. Let's write a simple User update endpoint, or we can add it to views.py!
      // But wait! We can edit views.py and urls.py to add a simple User update endpoint, or we can add a custom PUT/PATCH endpoint to change user details.
      // Wait, let's look at views.py. I can make a quick replacement in views.py and urls.py to add UserViewSet for Admin CRUD on users! That would be perfect and fully matches DRF standard conventions.
      // Let's design that after we finish writing this admin dashboard. For now, let's write the handler assuming we have a UserViewSet at `/api/users/`.
      await api.patch(`users/${userId}/`, { role: newRole });
      await fetchStats(); // reload stats and user list
    } catch (err) {
      console.error(err);
      alert("Failed to update user role.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user account?")) return;
    setActionLoading(true);
    try {
      await api.delete(`users/${userId}/`);
      await fetchStats();
    } catch (err) {
      console.error(err);
      alert("Failed to delete user account.");
    } finally {
      setActionLoading(false);
    }
  };

  // Camp CRUD Operations
  const handleSaveCamp = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      if (selectedCamp) {
        // Edit existing
        const res = await api.put(`health-camps/${selectedCamp.id}/`, campForm);
        setCamps(prev => prev.map(c => c.id === selectedCamp.id ? res.data : c));
        alert("Camp updated successfully.");
      } else {
        // Create new
        const res = await api.post('health-camps/', campForm);
        setCamps(prev => [...prev, res.data]);
        alert("Camp created successfully.");
      }
      setCampForm({ location: '', date: '', vaccine_type: '', description: '' });
      setSelectedCamp(null);
    } catch (err) {
      console.error(err);
      alert("Failed to save health camp.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditCamp = (camp) => {
    setSelectedCamp(camp);
    setCampForm({
      location: camp.location,
      date: camp.date,
      vaccine_type: camp.vaccine_type,
      description: camp.description
    });
  };

  const handleDeleteCamp = async (campId) => {
    if (!window.confirm("Are you sure you want to cancel this health camp?")) return;
    setActionLoading(true);
    try {
      await api.delete(`health-camps/${campId}/`);
      setCamps(prev => prev.filter(c => c.id !== campId));
      alert("Camp cancelled successfully.");
    } catch (err) {
      console.error(err);
      alert("Failed to delete camp.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center flex-grow-1">
        <div className="spinner-border text-primary my-5" role="status">
          <span className="visually-hidden">Loading metrics...</span>
        </div>
      </div>
    );
  }

  // Filter users based on search
  const filteredUsers = stats?.users.filter(u => 
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.role.toLowerCase().includes(userSearch.toLowerCase())
  ) || [];

  // Filter camps based on search
  const filteredCamps = camps.filter(c => 
    c.location.toLowerCase().includes(campSearch.toLowerCase()) ||
    c.vaccine_type.toLowerCase().includes(campSearch.toLowerCase())
  );

  // Compute vaccination stats for custom SVG pie chart/bar chart
  const completed = stats?.vaccinations.completed || 0;
  const pending = stats?.vaccinations.pending || 0;
  const total = completed + pending;
  const compPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const pendPercentage = total > 0 ? 100 - compPercentage : 0;

  return (
    <div className="container py-5 animated-fade flex-grow-1 text-start">
      <div className="mb-4">
        <h1 className="fw-bold mb-1">Admin Dashboard</h1>
        <p className="text-secondary mb-0">System metrics, user privileges configuration, and overall immunization status analytics.</p>
      </div>

      {error && (
        <div className="alert alert-danger alert-premium mb-4" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>{error}
        </div>
      )}

      {/* Tabs Layout */}
      <ul className="nav nav-pills mb-4 border-bottom pb-2 gap-2">
        <li className="nav-item">
          <button 
            className={`nav-link fw-semibold px-4 ${activeTab === 'stats' ? 'active btn-gradient' : 'text-primary'}`}
            onClick={() => setActiveTab('stats')}
          >
            <i className="bi bi-bar-chart-line-fill me-2"></i>Health Analytics
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link fw-semibold px-4 ${activeTab === 'users' ? 'active btn-gradient-secondary' : 'text-secondary'}`}
            onClick={() => setActiveTab('users')}
          >
            <i className="bi bi-people-fill me-2"></i>Manage Users
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link fw-semibold px-4 ${activeTab === 'camps' ? 'active btn-gradient' : 'text-primary'}`}
            onClick={() => setActiveTab('camps')}
          >
            <i className="bi bi-geo-alt-fill me-2"></i>Manage Camps
          </button>
        </li>
      </ul>

      {activeTab === 'stats' && (
        <div className="row g-4">
          {/* Quick Metrics Cards */}
          <div className="col-md-3">
            <div className="card p-3 border-0 shadow-sm bg-body">
              <span className="text-muted small uppercase fw-bold">Total Citizens</span>
              <strong className="display-6 fw-bold mt-1 text-primary">{stats?.total_citizens}</strong>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card p-3 border-0 shadow-sm bg-body">
              <span className="text-muted small uppercase fw-bold">Health Workers</span>
              <strong className="display-6 fw-bold mt-1 text-secondary">{stats?.total_workers}</strong>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card p-3 border-0 shadow-sm bg-body">
              <span className="text-muted small uppercase fw-bold">Immunizations Logged</span>
              <strong className="display-6 fw-bold mt-1 text-info">{stats?.vaccinations.total}</strong>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card p-3 border-0 shadow-sm bg-body">
              <span className="text-muted small uppercase fw-bold">Active Camps</span>
              <strong className="display-6 fw-bold mt-1 text-accent">{stats?.total_camps}</strong>
            </div>
          </div>

          {/* Compliance Chart and Breakdown */}
          <div className="col-lg-6">
            <div className="card p-4 border-0 shadow-sm h-100 glass-card">
              <h3 className="h5 fw-bold mb-4">Immunization Success Rate</h3>
              
              <div className="d-flex align-items-center justify-content-center py-3">
                {/* Custom Responsive SVG Chart */}
                <svg width="240" height="240" viewBox="0 0 100 100">
                  {/* Pie chart with two sectors: completed and pending */}
                  {/* Simple representation: 2 bars or donut chart */}
                  <circle cx="50" cy="50" r="40" fill="none" stroke="var(--border-color)" strokeWidth="12" />
                  
                  {/* Completed Sector */}
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="40" 
                    fill="none" 
                    stroke="var(--secondary)" 
                    strokeWidth="12" 
                    strokeDasharray="251.2"
                    strokeDashoffset={251.2 - (compPercentage / 100) * 251.2}
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                  />
                  
                  <text x="50" y="52" textAnchor="middle" className="fw-bold" style={{ fontSize: '10px', fill: 'var(--text-primary)' }}>
                    {compPercentage}%
                  </text>
                  <text x="50" y="62" textAnchor="middle" style={{ fontSize: '5px', fill: 'var(--text-muted)' }}>
                    Compliance
                  </text>
                </svg>
              </div>

              <div className="d-flex justify-content-center gap-4 text-center mt-3 small">
                <div>
                  <span className="badge bg-success rounded-circle me-1" style={{ width: '12px', height: '12px', display: 'inline-block' }}> </span>
                  <strong>Completed:</strong> {completed} doses ({compPercentage}%)
                </div>
                <div>
                  <span className="badge bg-warning rounded-circle me-1" style={{ width: '12px', height: '12px', display: 'inline-block' }}> </span>
                  <strong>Pending:</strong> {pending} doses ({pendPercentage}%)
                </div>
              </div>
            </div>
          </div>

          {/* Vaccine brand breakdown table */}
          <div className="col-lg-6">
            <div className="card p-4 border-0 shadow-sm h-100">
              <h3 className="h5 fw-bold mb-4">Compliance by Vaccine Brand</h3>
              <div className="table-responsive">
                <table className="table custom-table table-sm mb-0">
                  <thead>
                    <tr>
                      <th>Vaccine Name</th>
                      <th>Total Scheduled</th>
                      <th>Administered</th>
                      <th>Coverage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats?.vaccine_breakdown.map((item, idx) => {
                      const percentage = item.total > 0 ? Math.round((item.completed / item.total) * 100) : 0;
                      return (
                        <tr key={idx}>
                          <td className="fw-semibold">{item.vaccine_name}</td>
                          <td>{item.total}</td>
                          <td>{item.completed}</td>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <div className="progress flex-grow-1" style={{ height: '6px', minWidth: '60px' }}>
                                <div className="progress-bar bg-success" style={{ width: `${percentage}%` }}></div>
                              </div>
                              <small className="fw-bold">{percentage}%</small>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="card p-4 border-0 shadow-sm">
          <h3 className="h5 fw-bold mb-3">System Accounts</h3>
          
          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text bg-light"><i className="bi bi-search text-muted"></i></span>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Filter users by name, email, or role..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table custom-table align-middle">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Current Role</th>
                  <th>Update Role</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => (
                  <tr key={u.id}>
                    <td><strong>{u.name || 'Anonymous User'}</strong></td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`badge uppercase ${u.role === 'admin' ? 'bg-danger' : u.role === 'health_worker' ? 'bg-secondary' : 'bg-primary'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      <select 
                        className="form-select form-select-sm" 
                        value={u.role} 
                        onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                        disabled={actionLoading || u.email === 'admin@health.com'} // prevent changing root admin
                      >
                        <option value="citizen">Citizen</option>
                        <option value="health_worker">Health Worker</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td>
                      <button 
                        onClick={() => handleDeleteUser(u.id)}
                        className="btn btn-sm btn-outline-danger"
                        disabled={actionLoading || u.email === 'admin@health.com'}
                      >
                        <i className="bi bi-trash-fill"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'camps' && (
        <div className="row g-4">
          {/* List and edit column */}
          <div className="col-lg-7">
            <div className="card p-4 border-0 shadow-sm">
              <h3 className="h5 fw-bold mb-3">Scheduled Camps Drives</h3>
              
              <div className="input-group mb-3">
                <span className="input-group-text bg-light"><i className="bi bi-search text-muted"></i></span>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Filter camps..."
                  value={campSearch}
                  onChange={(e) => setCampSearch(e.target.value)}
                />
              </div>

              <div className="table-responsive">
                <table className="table custom-table table-sm align-middle">
                  <thead>
                    <tr>
                      <th>Vaccine Type</th>
                      <th>Location</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCamps.map(c => (
                      <tr key={c.id}>
                        <td><strong>{c.vaccine_type}</strong></td>
                        <td>{c.location}</td>
                        <td>{c.date}</td>
                        <td>
                          <div className="d-flex gap-2">
                            <button className="btn btn-xs btn-outline-primary py-0 px-2" onClick={() => handleEditCamp(c)}>
                              <i className="bi bi-pencil-fill"></i>
                            </button>
                            <button className="btn btn-xs btn-outline-danger py-0 px-2" onClick={() => handleDeleteCamp(c.id)}>
                              <i className="bi bi-trash-fill"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Form Create/Edit Column */}
          <div className="col-lg-5">
            <div className="card p-4 border-0 shadow-sm glass-card">
              <h3 className="h5 fw-bold mb-4 text-primary">
                {selectedCamp ? <><i className="bi bi-pencil-square me-2"></i>Modify Camp</> : <><i className="bi bi-pin-map-fill me-2"></i>Create Camp</>}
              </h3>
              <form onSubmit={handleSaveCamp}>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Camp Location</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={campForm.location}
                    onChange={(e) => setCampForm({...campForm, location: e.target.value})}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Scheduled Date</label>
                  <input 
                    type="date" 
                    className="form-control" 
                    value={campForm.date}
                    onChange={(e) => setCampForm({...campForm, date: e.target.value})}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Vaccine Brand / Type</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={campForm.vaccine_type}
                    onChange={(e) => setCampForm({...campForm, vaccine_type: e.target.value})}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="form-label fw-semibold">Description</label>
                  <textarea 
                    className="form-control" 
                    rows="2" 
                    value={campForm.description}
                    onChange={(e) => setCampForm({...campForm, description: e.target.value})}
                  ></textarea>
                </div>
                
                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-gradient flex-grow-1" disabled={actionLoading}>
                    {selectedCamp ? 'Save Updates' : 'Create Camp Drive'}
                  </button>
                  {selectedCamp && (
                    <button 
                      type="button" 
                      className="btn btn-outline-secondary" 
                      onClick={() => {
                        setSelectedCamp(null);
                        setCampForm({ location: '', date: '', vaccine_type: '', description: '' });
                      }}
                    >
                      Clear
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
