import React, { useState, useEffect } from 'react';
import api from '../api';

const HealthWorkerDashboard = () => {
  // Tabs: 'patients', 'camps'
  const [activeTab, setActiveTab] = useState('patients');
  
  // Data States
  const [citizens, setCitizens] = useState([]);
  const [allVaccinations, setAllVaccinations] = useState([]);
  const [camps, setCamps] = useState([]);
  const [selectedCitizen, setSelectedCitizen] = useState(null);
  const [selectedCamp, setSelectedCamp] = useState(null);
  const [citizenRecord, setCitizenRecord] = useState(null);
  
  // Search
  const [citizenSearch, setCitizenSearch] = useState('');
  
  // Forms
  const [newVac, setNewVac] = useState({
    vaccine_name: '',
    due_date: '',
    status: 'pending',
    administered_date: ''
  });
  
  const [newCamp, setNewCamp] = useState({
    location: '',
    date: '',
    vaccine_type: '',
    description: ''
  });

  const [editRecord, setEditRecord] = useState({
    blood_group: 'Not Specified',
    allergies: '',
    medical_history: '',
    dob: '',
    gender: ''
  });

  // UI States
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Custom private patient registration states
  const [isRegistering, setIsRegistering] = useState(false);
  const [isEditingBasic, setIsEditingBasic] = useState(false);
  const [basicInfo, setBasicInfo] = useState({ name: '', email: '' });
  const [newPatient, setNewPatient] = useState({
    name: '',
    email: '',
    blood_group: 'Not Specified',
    dob: '',
    gender: '',
    allergies: '',
    medical_history: '',
    vaccine_name: '',
    due_date: '',
    status: 'pending',
    administered_date: ''
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [citizensRes, vacsRes, campsRes] = await Promise.all([
        api.get('citizens/'),
        api.get('vaccinations/'),
        api.get('health-camps/')
      ]);
      setCitizens(citizensRes.data);
      setAllVaccinations(vacsRes.data);
      setCamps(campsRes.data);
    } catch (e) {
      console.error(e);
      showMsg('danger', 'Failed to retrieve database records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showMsg = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleSelectCitizen = async (citizen) => {
    setSelectedCitizen(citizen);
    setIsRegistering(false);
    setIsEditingBasic(false);
    setBasicInfo({ name: citizen.name || '', email: citizen.email || '' });
    try {
      setActionLoading(true);
      const res = await api.get('health-records/');
      const records = res.data;
      const matchingRecord = records.find(r => r.user === citizen.id);
      
      setCitizenRecord(matchingRecord || null);
      if (matchingRecord) {
        setEditRecord({
          blood_group: matchingRecord.blood_group,
          allergies: matchingRecord.allergies,
          medical_history: matchingRecord.medical_history,
          dob: matchingRecord.dob || '',
          gender: matchingRecord.gender || ''
        });
      } else {
        setEditRecord({
          blood_group: 'Not Specified',
          allergies: '',
          medical_history: '',
          dob: '',
          gender: ''
        });
      }
    } catch (e) {
      console.error(e);
      showMsg('danger', 'Failed to retrieve patient health card.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartRegisterPatient = () => {
    setSelectedCitizen(null);
    setIsRegistering(true);
    setIsEditingBasic(false);
  };

  const handleSaveBasicInfo = async () => {
    if (!basicInfo.name || !basicInfo.email) {
      showMsg('danger', 'Name and email are required.');
      return;
    }
    setActionLoading(true);
    try {
      const res = await api.patch(`users/${selectedCitizen.id}/`, {
        name: basicInfo.name,
        email: basicInfo.email
      });
      setSelectedCitizen(res.data);
      setCitizens(prev => prev.map(c => c.id === selectedCitizen.id ? res.data : c));
      setIsEditingBasic(false);
      showMsg('success', 'Patient basic details updated successfully.');
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.email) {
        showMsg('danger', `Failed to save: ${err.response.data.email[0]}`);
      } else {
        showMsg('danger', 'Failed to update patient profile info.');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleRegisterPatientSubmit = async (e) => {
    e.preventDefault();
    if (!newPatient.name || !newPatient.email) {
      showMsg('danger', 'Name and email are required.');
      return;
    }

    setActionLoading(true);
    try {
      // 1. Create Patient User with unusable password
      const userRes = await api.post('users/', {
        name: newPatient.name,
        email: newPatient.email,
        role: 'citizen'
      });
      const createdUser = userRes.data;

      // 2. Fetch the newly created user's health record and update it
      const recordsRes = await api.get('health-records/');
      const matchingRecord = recordsRes.data.find(r => r.user === createdUser.id);
      
      if (matchingRecord) {
        await api.put(`health-records/${matchingRecord.id}/`, {
          user: createdUser.id,
          blood_group: newPatient.blood_group,
          dob: newPatient.dob || null,
          gender: newPatient.gender,
          allergies: newPatient.allergies,
          medical_history: newPatient.medical_history
        });
      }

      // 3. Create initial vaccination if provided
      if (newPatient.vaccine_name) {
        const vacPayload = {
          user: createdUser.id,
          vaccine_name: newPatient.vaccine_name,
          due_date: newPatient.due_date || new Date().toISOString().split('T')[0],
          status: newPatient.status,
          administered_date: newPatient.status === 'completed' ? (newPatient.administered_date || new Date().toISOString().split('T')[0]) : null
        };
        await api.post('vaccinations/', vacPayload);
      }

      showMsg('success', `Patient '${newPatient.name}' created and configured successfully.`);
      setIsRegistering(false);
      
      // Reset form
      setNewPatient({
        name: '',
        email: '',
        blood_group: 'Not Specified',
        dob: '',
        gender: '',
        allergies: '',
        medical_history: '',
        vaccine_name: '',
        due_date: '',
        status: 'pending',
        administered_date: ''
      });

      // Reload registry data and auto-select
      const [citizensRes, vacsRes] = await Promise.all([
        api.get('citizens/'),
        api.get('vaccinations/')
      ]);
      setCitizens(citizensRes.data);
      setAllVaccinations(vacsRes.data);
      
      handleSelectCitizen(createdUser);
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.email) {
        showMsg('danger', `Failed to create patient: ${err.response.data.email[0]}`);
      } else {
        showMsg('danger', 'Failed to register patient profile.');
      }
    } finally {
      setActionLoading(false);
    }
  };

  // Add vaccination record
  const handleAddVaccination = async (e) => {
    e.preventDefault();
    if (!selectedCitizen) return;
    if (!newVac.vaccine_name || !newVac.due_date) {
      showMsg('danger', 'Vaccine name and due date are required.');
      return;
    }

    setActionLoading(true);
    try {
      const payload = {
        ...newVac,
        user: selectedCitizen.id,
        administered_date: newVac.status === 'completed' ? (newVac.administered_date || new Date().toISOString().split('T')[0]) : null
      };
      
      const res = await api.post('vaccinations/', payload);
      setAllVaccinations(prev => [...prev, res.data]);
      showMsg('success', `Vaccination '${newVac.vaccine_name}' added for ${selectedCitizen.name || selectedCitizen.email}.`);
      setNewVac({ vaccine_name: '', due_date: '', status: 'pending', administered_date: '' });
    } catch (err) {
      console.error(err);
      showMsg('danger', 'Failed to log vaccination.');
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle vaccination status to completed
  const handleCompleteVaccination = async (vac) => {
    setActionLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const res = await api.patch(`vaccinations/${vac.id}/`, {
        status: 'completed',
        administered_date: today
      });
      
      setAllVaccinations(prev => prev.map(v => v.id === vac.id ? res.data : v));
      showMsg('success', `Marked ${vac.vaccine_name} as completed.`);
    } catch (err) {
      console.error(err);
      showMsg('danger', 'Failed to update vaccination status.');
    } finally {
      setActionLoading(false);
    }
  };

  // Edit patient health records
  const handleUpdateRecord = async (e) => {
    e.preventDefault();
    if (!selectedCitizen) return;

    setActionLoading(true);
    try {
      let res;
      if (citizenRecord) {
        res = await api.put(`health-records/${citizenRecord.id}/`, {
          ...editRecord,
          dob: editRecord.dob || null,
          user: selectedCitizen.id
        });
      } else {
        res = await api.post('health-records/', {
          ...editRecord,
          dob: editRecord.dob || null,
          user: selectedCitizen.id
        });
      }
      setCitizenRecord(res.data);
      showMsg('success', 'Patient medical card updated successfully.');
    } catch (err) {
      console.error(err);
      showMsg('danger', 'Failed to save health card.');
    } finally {
      setActionLoading(false);
    }
  };

  // Create new health camp
  const handleCreateCamp = async (e) => {
    e.preventDefault();
    if (!newCamp.location || !newCamp.date || !newCamp.vaccine_type) {
      showMsg('danger', 'Location, date, and vaccine type are required.');
      return;
    }

    setActionLoading(true);
    try {
      const res = await api.post('health-camps/', newCamp);
      showMsg('success', `Health camp at ${newCamp.location} scheduled successfully!`);
      setCamps(prev => [...prev, res.data]);
      setNewCamp({ location: '', date: '', vaccine_type: '', description: '' });
    } catch (err) {
      console.error(err);
      showMsg('danger', 'Failed to register camp.');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredCitizens = citizens.filter(c => 
    (c.name || '').toLowerCase().includes(citizenSearch.toLowerCase()) ||
    c.email.toLowerCase().includes(citizenSearch.toLowerCase())
  );

  const selectedCitizenVaccinations = allVaccinations.filter(v => selectedCitizen && v.user === selectedCitizen.id);

  return (
    <div className="container py-5 animated-fade flex-grow-1 text-start">
      <div className="mb-4">
        <h1 className="fw-bold mb-1">Health Worker Dashboard</h1>
        <p className="text-secondary mb-0">Record community vaccination completions, edit medical charts, and schedule clinics.</p>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type} alert-premium mb-4`} role="alert">
          <i className={`bi ${message.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'} me-2`}></i>
          {message.text}
        </div>
      )}

      {/* Tabs Menu */}
      <ul className="nav nav-pills mb-4 border-bottom pb-2 gap-2">
        <li className="nav-item">
          <button 
            className={`nav-link fw-semibold px-4 ${activeTab === 'patients' ? 'active btn-gradient' : 'text-primary'}`}
            onClick={() => setActiveTab('patients')}
          >
            <i className="bi bi-people-fill me-2"></i>Patient Management
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link fw-semibold px-4 ${activeTab === 'camps' ? 'active btn-gradient-secondary' : 'text-secondary'}`}
            onClick={() => setActiveTab('camps')}
          >
            <i className="bi bi-pin-map-fill me-2"></i>Schedule Camps
          </button>
        </li>
      </ul>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading worker details...</span>
          </div>
        </div>
      ) : activeTab === 'patients' ? (
        <div className="row g-4">
          {/* Citizens List Column */}
          <div className="col-lg-4">
            <div className="card p-4 border-0 shadow-sm h-100">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h3 className="h5 fw-bold mb-0">Citizens Registry</h3>
                <button 
                  className="btn btn-xs btn-gradient px-2 py-1"
                  onClick={handleStartRegisterPatient}
                >
                  <i className="bi bi-person-plus-fill me-1"></i>Add Patient
                </button>
              </div>
              
              <div className="input-group mb-3">
                <span className="input-group-text bg-light"><i className="bi bi-search text-muted"></i></span>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Filter by name/email..."
                  value={citizenSearch}
                  onChange={(e) => setCitizenSearch(e.target.value)}
                />
              </div>

              <div className="list-group overflow-auto" style={{ maxHeight: '400px' }}>
                {filteredCitizens.length > 0 ? (
                  filteredCitizens.map(c => (
                    <button
                      key={c.id}
                      onClick={() => handleSelectCitizen(c)}
                      className={`list-group-item list-group-item-action border-0 rounded p-3 mb-2 d-flex justify-content-between align-items-center ${selectedCitizen && selectedCitizen.id === c.id ? 'active bg-primary bg-opacity-10 text-primary fw-bold' : 'text-secondary bg-light bg-opacity-50'}`}
                    >
                      <div>
                        <span className="d-block">{c.name || 'Anonymous Citizen'}</span>
                        <small className="text-muted text-xs d-block fw-normal">{c.email}</small>
                      </div>
                      <i className="bi bi-chevron-right text-xs"></i>
                    </button>
                  ))
                ) : (
                  <p className="text-muted text-center py-4">No citizens registered.</p>
                )}
              </div>
            </div>
          </div>

          {/* Citizen Details Column */}
          <div className="col-lg-8">
            {isRegistering ? (
              <div className="card p-4 border-0 shadow-sm">
                <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-2">
                  <h3 className="h5 fw-bold mb-0 text-primary">
                    <i className="bi bi-person-plus-fill me-2"></i>Add New Patient Profile
                  </h3>
                  <button 
                    type="button" 
                    className="btn btn-sm btn-outline-secondary px-3" 
                    onClick={() => setIsRegistering(false)}
                  >
                    Cancel
                  </button>
                </div>
                
                <form onSubmit={handleRegisterPatientSubmit}>
                  {/* Section 1: Basic Info */}
                  <h5 className="fw-bold mb-3 text-secondary border-bottom pb-1" style={{ fontSize: '0.9rem' }}>
                    1. Account Information
                  </h5>
                  <div className="row g-3 mb-4">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Patient Name</label>
                      <input 
                        type="text" 
                        className="form-control form-control-sm"
                        placeholder="e.g. John Doe"
                        value={newPatient.name}
                        onChange={(e) => setNewPatient({...newPatient, name: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Email Address</label>
                      <input 
                        type="email" 
                        className="form-control form-control-sm"
                        placeholder="e.g. john@example.com"
                        value={newPatient.email}
                        onChange={(e) => setNewPatient({...newPatient, email: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  {/* Section 2: Medical Report */}
                  <h5 className="fw-bold mb-3 text-secondary border-bottom pb-1" style={{ fontSize: '0.9rem' }}>
                    2. Medical Report (Health Record)
                  </h5>
                  <div className="row g-3 mb-4">
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Blood Group</label>
                      <select 
                        className="form-select form-select-sm"
                        value={newPatient.blood_group}
                        onChange={(e) => setNewPatient({...newPatient, blood_group: e.target.value})}
                      >
                        <option value="Not Specified">Select Blood Group</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Date of Birth</label>
                      <input 
                        type="date" 
                        className="form-control form-control-sm"
                        value={newPatient.dob}
                        onChange={(e) => setNewPatient({...newPatient, dob: e.target.value})}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Gender</label>
                      <select 
                        className="form-select form-select-sm"
                        value={newPatient.gender}
                        onChange={(e) => setNewPatient({...newPatient, gender: e.target.value})}
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="prefer_not_to_say">Prefer not to say</option>
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-semibold">Allergies</label>
                      <input 
                        type="text" 
                        className="form-control form-control-sm"
                        placeholder="List any medical allergies (optional)"
                        value={newPatient.allergies}
                        onChange={(e) => setNewPatient({...newPatient, allergies: e.target.value})}
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-semibold">Medical History</label>
                      <textarea 
                        className="form-control form-control-sm"
                        rows="2"
                        placeholder="List pre-existing conditions, chronic diseases, or surgeries (optional)"
                        value={newPatient.medical_history}
                        onChange={(e) => setNewPatient({...newPatient, medical_history: e.target.value})}
                      ></textarea>
                    </div>
                  </div>

                  {/* Section 3: Initial Vaccination (Optional) */}
                  <h5 className="fw-bold mb-3 text-secondary border-bottom pb-1" style={{ fontSize: '0.9rem' }}>
                    3. Initial Vaccination (Optional)
                  </h5>
                  <div className="row g-3 mb-4">
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Vaccine Name</label>
                      <input 
                        type="text" 
                        className="form-control form-control-sm"
                        placeholder="e.g. Covid-19, BCG"
                        value={newPatient.vaccine_name}
                        onChange={(e) => setNewPatient({...newPatient, vaccine_name: e.target.value})}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Due Date</label>
                      <input 
                        type="date" 
                        className="form-control form-control-sm"
                        value={newPatient.due_date}
                        onChange={(e) => setNewPatient({...newPatient, due_date: e.target.value})}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Status</label>
                      <select 
                        className="form-select form-select-sm"
                        value={newPatient.status}
                        onChange={(e) => setNewPatient({...newPatient, status: e.target.value})}
                      >
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                    {newPatient.status === 'completed' && (
                      <div className="col-md-4">
                        <label className="form-label small fw-semibold">Administered Date</label>
                        <input 
                          type="date" 
                          className="form-control form-control-sm"
                          value={newPatient.administered_date}
                          onChange={(e) => setNewPatient({...newPatient, administered_date: e.target.value})}
                        />
                      </div>
                    )}
                  </div>

                  <div className="text-end">
                    <button 
                      type="submit" 
                      className="btn btn-sm btn-gradient px-4" 
                      disabled={actionLoading}
                    >
                      {actionLoading ? 'Creating Patient...' : 'Register Patient'}
                    </button>
                  </div>
                </form>
              </div>
            ) : selectedCitizen ? (
              <div className="d-flex flex-column gap-4">
                {/* Profile Overview */}
                {!isEditingBasic ? (
                  <div className="card p-4 border-0 shadow-sm glass-card">
                    <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
                      <h3 className="h5 fw-bold mb-0 text-primary">
                        <i className="bi bi-person-badge-fill me-2"></i>Patient Profile
                      </h3>
                      <button 
                        className="btn btn-xs btn-outline-primary px-3 py-1"
                        onClick={() => setIsEditingBasic(true)}
                      >
                        <i className="bi bi-pencil-square me-1"></i>Edit Info
                      </button>
                    </div>
                    <div className="row text-secondary">
                      <div className="col-md-6 mb-2"><strong>Name:</strong> {selectedCitizen.name || 'Anonymous'}</div>
                      <div className="col-md-6 mb-2"><strong>Email:</strong> {selectedCitizen.email}</div>
                    </div>
                  </div>
                ) : (
                  <div className="card p-4 border-0 shadow-sm glass-card">
                    <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
                      <h3 className="h5 fw-bold mb-0 text-primary">
                        <i className="bi bi-pencil-square me-2"></i>Edit Patient Info
                      </h3>
                      <div className="d-flex gap-2">
                        <button 
                          type="button" 
                          className="btn btn-xs btn-outline-secondary px-2 py-1"
                          onClick={() => setIsEditingBasic(false)}
                        >
                          Cancel
                        </button>
                        <button 
                          type="button" 
                          className="btn btn-xs btn-primary px-2 py-1"
                          onClick={handleSaveBasicInfo}
                          disabled={actionLoading}
                        >
                          Save
                        </button>
                      </div>
                    </div>
                    <div className="row g-2">
                      <div className="col-md-6">
                        <label className="form-label small fw-semibold">Name</label>
                        <input 
                          type="text" 
                          className="form-control form-control-sm"
                          value={basicInfo.name}
                          onChange={(e) => setBasicInfo({...basicInfo, name: e.target.value})}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-semibold">Email</label>
                        <input 
                          type="email" 
                          className="form-control form-control-sm"
                          value={basicInfo.email}
                          onChange={(e) => setBasicInfo({...basicInfo, email: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Edit Medical Profile */}
                <div className="card p-4 border-0 shadow-sm">
                  <h4 className="fw-bold mb-3 h5"><i className="bi bi-file-medical-fill text-danger me-2"></i>Medical Profile</h4>
                  <form onSubmit={handleUpdateRecord}>
                    <div className="row g-3">
                      <div className="col-md-4">
                        <label className="form-label small fw-semibold">Blood Group</label>
                        <select 
                          className="form-select form-select-sm"
                          value={editRecord.blood_group}
                          onChange={(e) => setEditRecord({...editRecord, blood_group: e.target.value})}
                        >
                          <option value="Not Specified">Select Blood Group</option>
                          <option value="A+">A+</option>
                          <option value="A-">A-</option>
                          <option value="B+">B+</option>
                          <option value="B-">B-</option>
                          <option value="AB+">AB+</option>
                          <option value="AB-">AB-</option>
                          <option value="O+">O+</option>
                          <option value="O-">O-</option>
                        </select>
                      </div>
                      <div className="col-md-4">
                        <label className="form-label small fw-semibold">Date of Birth</label>
                        <input 
                          type="date" 
                          className="form-control form-control-sm"
                          value={editRecord.dob}
                          onChange={(e) => setEditRecord({...editRecord, dob: e.target.value})}
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label small fw-semibold">Gender</label>
                        <select 
                          className="form-select form-select-sm"
                          value={editRecord.gender}
                          onChange={(e) => setEditRecord({...editRecord, gender: e.target.value})}
                        >
                          <option value="">Select Gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                          <option value="prefer_not_to_say">Prefer not to say</option>
                        </select>
                      </div>
                      <div className="col-12">
                        <label className="form-label small fw-semibold">Allergies</label>
                        <input 
                          type="text" 
                          className="form-control form-control-sm" 
                          placeholder="List allergies or leave empty"
                          value={editRecord.allergies}
                          onChange={(e) => setEditRecord({...editRecord, allergies: e.target.value})}
                        />
                      </div>
                      <div className="col-12">
                        <label className="form-label small fw-semibold">Medical History</label>
                        <textarea 
                          className="form-control form-control-sm" 
                          rows="2" 
                          placeholder="Underlying medical issues, surgeries, etc."
                          value={editRecord.medical_history}
                          onChange={(e) => setEditRecord({...editRecord, medical_history: e.target.value})}
                        ></textarea>
                      </div>
                    </div>
                    <div className="text-end mt-3">
                      <button type="submit" className="btn btn-sm btn-gradient" disabled={actionLoading}>
                        Update Health Card
                      </button>
                    </div>
                  </form>
                </div>

                {/* Patient Vaccinations */}
                <div className="card p-4 border-0 shadow-sm">
                  <h4 className="fw-bold mb-3 h5"><i className="bi bi-shield-plus text-primary me-2"></i>Vaccination History</h4>
                  
                  {selectedCitizenVaccinations.length > 0 ? (
                    <div className="table-responsive">
                      <table className="table custom-table table-sm align-middle mb-4">
                        <thead>
                          <tr>
                            <th>Vaccine</th>
                            <th>Due Date</th>
                            <th>Status</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedCitizenVaccinations.map(v => (
                            <tr key={v.id}>
                              <td><strong>{v.vaccine_name}</strong></td>
                              <td>{v.due_date}</td>
                              <td>
                                <span className={`badge badge-status ${v.status === 'completed' ? 'badge-completed' : 'badge-pending'}`}>
                                  {v.status}
                                </span>
                              </td>
                              <td>
                                {v.status === 'pending' ? (
                                  <button 
                                    className="btn btn-xs btn-success py-1 px-2 fw-semibold"
                                    onClick={() => handleCompleteVaccination(v)}
                                    disabled={actionLoading}
                                  >
                                    <i className="bi bi-check-lg"></i> Complete
                                  </button>
                                ) : (
                                  <small className="text-muted">{v.administered_date}</small>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-muted small">No vaccination timeline set up for this citizen.</p>
                  )}

                  {/* Add Vaccination Form */}
                  <div className="border-top pt-4">
                    <h5 className="fw-bold mb-3 h6">Assign Vaccination Doses</h5>
                    <form onSubmit={handleAddVaccination}>
                      <div className="row g-2">
                        <div className="col-md-4">
                          <input 
                            type="text" 
                            className="form-control form-control-sm" 
                            placeholder="Vaccine Name (e.g., BCG)"
                            value={newVac.vaccine_name}
                            onChange={(e) => setNewVac({...newVac, vaccine_name: e.target.value})}
                            required
                          />
                        </div>
                        <div className="col-md-3">
                          <input 
                            type="date" 
                            className="form-control form-control-sm" 
                            title="Due Date"
                            value={newVac.due_date}
                            onChange={(e) => setNewVac({...newVac, due_date: e.target.value})}
                            required
                          />
                        </div>
                        <div className="col-md-3">
                          <select 
                            className="form-select form-select-sm"
                            value={newVac.status}
                            onChange={(e) => setNewVac({...newVac, status: e.target.value})}
                          >
                            <option value="pending">Pending</option>
                            <option value="completed">Completed</option>
                          </select>
                        </div>
                        <div className="col-md-2">
                          <button type="submit" className="btn btn-sm btn-gradient-secondary w-100" disabled={actionLoading}>
                            Add Dose
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card p-5 border-0 shadow-sm text-center h-100 d-flex flex-column justify-content-center align-items-center">
                <i className="bi bi-person-fill-exclamation text-muted display-4 mb-3"></i>
                <h3 className="h5 fw-bold text-secondary">No Patient Selected</h3>
                <p className="text-muted mb-0">Select a citizen from the sidebar to modify vaccine cards and medical records.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Camps Registration & Scheduling split view */
        <div className="row g-4">
          {/* Scheduled Camps List */}
          <div className="col-lg-6">
            <div className="card p-4 border-0 shadow-sm">
              <h3 className="h5 fw-bold mb-3">Scheduled Camps</h3>
              <div className="list-group overflow-auto mb-4" style={{ maxHeight: '350px' }}>
                {camps.length > 0 ? (
                  camps.map(camp => (
                    <button
                      key={camp.id}
                      type="button"
                      onClick={() => setSelectedCamp(camp)}
                      className={`list-group-item list-group-item-action border-0 rounded p-3 mb-2 d-flex justify-content-between align-items-center ${selectedCamp && selectedCamp.id === camp.id ? 'active bg-primary bg-opacity-10 text-primary fw-bold' : 'text-secondary bg-light bg-opacity-50'}`}
                    >
                      <div>
                        <span className="d-block fw-bold text-dark">{camp.vaccine_type} Clinic</span>
                        <small className="text-secondary d-block"><i className="bi bi-geo-alt-fill text-danger me-1"></i>{camp.location}</small>
                        <small className="text-muted d-block"><i className="bi bi-calendar-event me-1"></i>{camp.date}</small>
                      </div>
                      <span className="badge bg-primary text-white rounded-pill">{camp.registrations_count || 0} Regs</span>
                    </button>
                  ))
                ) : (
                  <p className="text-muted text-center py-4">No camps scheduled yet.</p>
                )}
              </div>

              {/* Schedule New Camp Form Card */}
              <div className="border-top pt-3">
                <h4 className="fw-bold mb-3 h6">Schedule New Camp</h4>
                <form onSubmit={handleCreateCamp}>
                  <div className="mb-2">
                    <input 
                      type="text" 
                      className="form-control form-control-sm" 
                      placeholder="Camp Location"
                      value={newCamp.location}
                      onChange={(e) => setNewCamp({...newCamp, location: e.target.value})}
                      required
                    />
                  </div>
                  <div className="row g-2 mb-2">
                    <div className="col-6">
                      <input 
                        type="date" 
                        className="form-control form-control-sm" 
                        value={newCamp.date}
                        onChange={(e) => setNewCamp({...newCamp, date: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <input 
                        type="text" 
                        className="form-control form-control-sm" 
                        placeholder="Vaccine Brand"
                        value={newCamp.vaccine_type}
                        onChange={(e) => setNewCamp({...newCamp, vaccine_type: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <div className="mb-2">
                    <textarea 
                      className="form-control form-control-sm" 
                      rows="2" 
                      placeholder="Description details..."
                      value={newCamp.description}
                      onChange={(e) => setNewCamp({...newCamp, description: e.target.value})}
                    ></textarea>
                  </div>
                  <button type="submit" className="btn btn-sm btn-gradient-secondary w-100" disabled={actionLoading}>
                    Schedule Camp Drive
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Registered Citizens List */}
          <div className="col-lg-6">
            {selectedCamp ? (
              <div className="card p-4 border-0 shadow-sm h-100">
                <h3 className="h5 fw-bold mb-2 border-bottom pb-2 text-primary">
                  <i className="bi bi-bookmark-check-fill me-2"></i>Registrations: {selectedCamp.vaccine_type} Camp
                </h3>
                <p className="text-secondary small mb-3">
                  <strong>Date:</strong> {selectedCamp.date} | <strong>Location:</strong> {selectedCamp.location}
                </p>

                <h4 className="fw-bold mb-2 h6 text-secondary">Registered Patients List</h4>
                <div className="list-group overflow-auto" style={{ maxHeight: '350px' }}>
                  {selectedCamp.registered_users && selectedCamp.registered_users.length > 0 ? (
                    selectedCamp.registered_users.map(u => (
                      <div key={u.id} className="list-group-item border-0 bg-light rounded p-3 mb-2 d-flex justify-content-between align-items-center">
                        <div className="text-start">
                          <strong className="text-dark d-block">{u.name || 'Anonymous Citizen'}</strong>
                          <span className="text-muted small">{u.email}</span>
                        </div>
                        <span className="badge bg-success bg-opacity-10 text-success fw-bold">Citizen</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-5 text-muted">
                      <i className="bi bi-people-fill display-6 mb-2"></i>
                      <p className="small mb-0">No citizens registered for this camp yet.</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="card p-5 border-0 shadow-sm text-center h-100 d-flex flex-column justify-content-center align-items-center">
                <i className="bi bi-clipboard2-check text-muted display-4 mb-3"></i>
                <h3 className="h5 fw-bold text-secondary">No Camp Selected</h3>
                <p className="text-muted mb-0">Select a scheduled camp from the list to view its registered citizens list.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthWorkerDashboard;
