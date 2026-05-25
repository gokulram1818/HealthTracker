import React, { useState, useEffect } from 'react';
import api from '../api';

const HealthRecords = () => {
  const [record, setRecord] = useState({
    id: null,
    blood_group: 'Not Specified',
    allergies: '',
    medical_history: '',
    dob: '',
    gender: ''
  });
  
  // Form states
  const [bloodGroup, setBloodGroup] = useState('Not Specified');
  const [allergies, setAllergies] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchRecord = async () => {
    try {
      setLoading(true);
      const res = await api.get('health-records/me/');
      if (res.data) {
        setRecord(res.data);
        setBloodGroup(res.data.blood_group);
        setAllergies(res.data.allergies);
        setMedicalHistory(res.data.medical_history);
        setDob(res.data.dob || '');
        setGender(res.data.gender || '');
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load medical record.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecord();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setUpdating(true);
    
    try {
      // Record ID can be used for PUT. Our health-records ViewSet supports retrieve/update.
      const res = await api.put(`health-records/${record.id || 'me'}/`, {
        blood_group: bloodGroup,
        allergies: allergies,
        medical_history: medicalHistory,
        dob: dob || null,
        gender: gender,
        user: record.user // Include parent user ID
      });
      
      setRecord(res.data);
      setSuccess("Your medical record has been updated successfully.");
      setEditMode(false);
    } catch (err) {
      console.error(err);
      setError("Failed to update health record. Please make sure all values are valid.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center flex-grow-1">
        <div className="spinner-border text-primary my-5" role="status">
          <span className="visually-hidden">Loading record...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5 animated-fade flex-grow-1 text-start">
      <div className="mb-4">
        <h1 className="fw-bold mb-1">Health Records</h1>
        <p className="text-secondary mb-0">Manage your essential medical profiles to inform healthcare staff during immunizations.</p>
      </div>

      {success && (
        <div className="alert alert-success alert-premium d-flex align-items-center mb-4" role="alert">
          <i className="bi bi-check-circle-fill me-2 text-success"></i>
          <div>{success}</div>
        </div>
      )}

      {error && (
        <div className="alert alert-danger alert-premium d-flex align-items-center mb-4" role="alert">
          <i className="bi bi-exclamation-octagon-fill me-2 text-danger"></i>
          <div>{error}</div>
        </div>
      )}

      <div className="row">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm p-4">
            {!editMode ? (
              <div>
                <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-2">
                  <h3 className="h5 fw-bold mb-0 text-primary"><i className="bi bi-shield-heart me-2"></i>Medical Statement</h3>
                  <button className="btn btn-sm btn-outline-primary px-3" onClick={() => setEditMode(true)}>
                    <i className="bi bi-pencil-square me-1"></i>Edit Profile
                  </button>
                </div>
                
                <div className="row g-4">
                  <div className="col-md-4 mb-3">
                    <span className="text-muted d-block small uppercase fw-semibold">Blood Group</span>
                    <strong className="fs-4 text-danger d-block mt-1">
                      <i className="bi bi-heart-pulse-fill me-2"></i>{record.blood_group}
                    </strong>
                  </div>
                  
                  <div className="col-md-4 mb-3">
                    <span className="text-muted d-block small uppercase fw-semibold">Date of Birth</span>
                    <strong className="fs-5 text-primary d-block mt-2">
                      <i className="bi bi-calendar-date me-2"></i>{record.dob ? new Date(record.dob).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'Not Specified'}
                    </strong>
                  </div>

                  <div className="col-md-4 mb-3">
                    <span className="text-muted d-block small uppercase fw-semibold">Gender</span>
                    <strong className="fs-5 text-success d-block mt-2">
                      <i className="bi bi-gender-ambiguous me-2"></i>{record.gender ? record.gender.charAt(0).toUpperCase() + record.gender.slice(1).replace(/_/g, ' ') : 'Not Specified'}
                    </strong>
                  </div>
                  
                  <div className="col-12 mb-3">
                    <span className="text-muted d-block small uppercase fw-semibold">Allergies & Drug Reactions</span>
                    <div className="p-3 bg-light border rounded mt-2 text-dark" style={{ minHeight: '80px' }}>
                      {record.allergies ? record.allergies : <span className="text-muted italic">No allergies registered.</span>}
                    </div>
                  </div>

                  <div className="col-12">
                    <span className="text-muted d-block small uppercase fw-semibold">Pre-existing Medical History</span>
                    <div className="p-3 bg-light border rounded mt-2 text-dark" style={{ minHeight: '120px' }}>
                      {record.medical_history ? record.medical_history : <span className="text-muted italic">No chronic medical conditions registered.</span>}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSave}>
                <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-2">
                  <h3 className="h5 fw-bold mb-0 text-primary"><i className="bi bi-pencil-square me-2"></i>Update Health Record</h3>
                  <button type="button" className="btn btn-sm btn-outline-secondary px-3" onClick={() => setEditMode(false)}>
                    Cancel
                  </button>
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-md-4">
                    <label className="form-label fw-semibold">Blood Group</label>
                    <select 
                      className="form-select" 
                      value={bloodGroup}
                      onChange={(e) => setBloodGroup(e.target.value)}
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
                    <label className="form-label fw-semibold">Date of Birth</label>
                    <input 
                      type="date" 
                      className="form-control" 
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label fw-semibold">Gender</label>
                    <select 
                      className="form-select" 
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer_not_to_say">Prefer not to say</option>
                    </select>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Allergies & Drug Reactions</label>
                  <textarea 
                    className="form-control" 
                    rows="3" 
                    placeholder="Enter details of any medical allergies (e.g. Penicillin, Peanuts, Pollen)"
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                  ></textarea>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold">Pre-existing Conditions / Medical History</label>
                  <textarea 
                    className="form-control" 
                    rows="4" 
                    placeholder="Describe chronic conditions, surgeries, or ongoing medical requirements"
                    value={medicalHistory}
                    onChange={(e) => setMedicalHistory(e.target.value)}
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  className="btn btn-gradient px-4 d-flex align-items-center gap-2"
                  disabled={updating}
                >
                  {updating ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-save-fill"></i>
                      Save Record
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="col-lg-4 mt-4 mt-lg-0">
          <div className="card p-4 border-0 shadow-sm glass-card">
            <h4 className="fw-bold mb-3 h5"><i className="bi bi-info-circle text-info me-2"></i>Record Usage</h4>
            <p className="text-secondary small">
              This information is shared with certified health workers who update your vaccination logs.
            </p>
            <p className="text-secondary small mb-0">
              Please double check allergy listings as they are critical references during immunization clinics.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthRecords;
