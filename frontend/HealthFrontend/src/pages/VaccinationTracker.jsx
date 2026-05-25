import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const VaccinationTracker = () => {
  const { user } = useAuth();
  const [vaccinations, setVaccinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'completed'
  const [search, setSearch] = useState('');

  const fetchVaccinations = async () => {
    try {
      setLoading(true);
      const res = await api.get('vaccinations/');
      setVaccinations(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch vaccinations list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVaccinations();
  }, []);

  const handlePrintCertificate = () => {
    // Open a new tab and write structured HTML certificate for printing
    const printWindow = window.open('', '_blank');
    const completedVacs = vaccinations.filter(v => v.status === 'completed');
    
    const rowsHtml = completedVacs.length > 0 
      ? completedVacs.map(v => `
        <tr>
          <td><strong>${v.vaccine_name}</strong></td>
          <td>${v.due_date}</td>
          <td>${v.administered_date || 'N/A'}</td>
          <td>${v.administered_by_name || 'Community Health Clinic'}</td>
        </tr>
      `).join('')
      : `<tr><td colspan="4" class="text-center">No completed vaccinations found.</td></tr>`;

    printWindow.document.write(`
      <html>
        <head>
          <title>Vaccination Certificate - ${user.name || user.email}</title>
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #333; }
            .certificate-container { border: 10px double #0284c7; padding: 30px; border-radius: 10px; max-width: 800px; margin: 0 auto; background: #fff; box-shadow: 0 0 20px rgba(0,0,0,0.05); }
            .header-sec { border-bottom: 2px solid #0284c7; padding-bottom: 20px; margin-bottom: 30px; }
            .watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); opacity: 0.05; font-size: 100px; font-weight: bold; color: #0284c7; pointer-events: none; z-index: 0; }
            .sig-area { margin-top: 50px; }
          </style>
        </head>
        <body>
          <div class="certificate-container position-relative">
            <div class="watermark">SECURE</div>
            <div class="header-sec text-center">
              <h1 class="text-primary fw-bold mb-1">CommHealth Portal</h1>
              <p class="text-muted uppercase tracking-wider mb-0">Official Immunization & Health Certificate</p>
            </div>
            
            <div class="content-sec mt-4">
              <p class="fs-5">This document certifies that</p>
              <h2 class="fw-bold text-dark my-3">${user.name || user.email}</h2>
              <p class="fs-5 mb-4">has received the following immunization coverage logged under CommHealth Community Registry:</p>
              
              <table class="table table-bordered table-striped mt-3">
                <thead class="table-primary">
                  <tr>
                    <th>Vaccine Name</th>
                    <th>Due Date</th>
                    <th>Date Administered</th>
                    <th>Administered By</th>
                  </tr>
                </thead>
                <tbody>
                  ${rowsHtml}
                </tbody>
              </table>
            </div>
            
            <div class="sig-area row text-center mt-5">
              <div class="col-6">
                <p class="mb-4">Issued On: ${new Date().toLocaleDateString()}</p>
                <div style="border-top: 1px solid #ccc; width: 150px; margin: 0 auto;"></div>
                <small class="text-muted">Verification Date</small>
              </div>
              <div class="col-6">
                <p class="mb-4 text-primary fw-bold">Verified Digital Copy</p>
                <div style="border-top: 1px solid #ccc; width: 150px; margin: 0 auto;"></div>
                <small class="text-muted">Authorized Registrar</small>
              </div>
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const filteredVaccinations = vaccinations.filter(v => {
    const matchesSearch = v.vaccine_name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = 
      filter === 'all' || 
      (filter === 'pending' && v.status === 'pending') || 
      (filter === 'completed' && v.status === 'completed');
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="container py-5 animated-fade flex-grow-1 text-start">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h1 className="fw-bold mb-1">Vaccination Tracker</h1>
          <p className="text-secondary mb-0">Monitor immunization due dates, completed doses, and download reports.</p>
        </div>
        <button 
          onClick={handlePrintCertificate}
          className="btn btn-gradient d-flex align-items-center gap-2"
          disabled={vaccinations.filter(v => v.status === 'completed').length === 0}
        >
          <i className="bi bi-file-earmark-pdf-fill"></i>
          Download Certificate
        </button>
      </div>

      {error && (
        <div className="alert alert-danger alert-premium mb-4" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>{error}
        </div>
      )}

      {/* Filter and Search Controls */}
      <div className="row g-3 mb-4">
        <div className="col-md-8">
          <div className="input-group">
            <span className="input-group-text bg-white border-end-0"><i className="bi bi-search text-muted"></i></span>
            <input 
              type="text" 
              className="form-control border-start-0" 
              placeholder="Search vaccine by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="col-md-4">
          <select 
            className="form-select" 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">Show All Doses</option>
            <option value="pending">Show Pending Doses</option>
            <option value="completed">Show Completed Doses</option>
          </select>
        </div>
      </div>

      {/* Grid of vaccinations */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading vaccinations...</span>
          </div>
        </div>
      ) : filteredVaccinations.length > 0 ? (
        <div className="card border-0 shadow-sm p-4">
          <div className="table-responsive">
            <table className="table custom-table mb-0">
              <thead>
                <tr>
                  <th>Vaccine Name</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Administered Date</th>
                  <th>Administered By</th>
                </tr>
              </thead>
              <tbody>
                {filteredVaccinations.map((vac) => (
                  <tr key={vac.id}>
                    <td>
                      <div className="fw-bold">{vac.vaccine_name}</div>
                    </td>
                    <td>{vac.due_date}</td>
                    <td>
                      <span className={`badge badge-status ${vac.status === 'completed' ? 'badge-completed' : 'badge-pending'}`}>
                        <i className={`bi ${vac.status === 'completed' ? 'bi-check-circle-fill' : 'bi-clock-fill'} me-1`}></i>
                        {vac.status}
                      </span>
                    </td>
                    <td>{vac.administered_date || '—'}</td>
                    <td>{vac.administered_by_name || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card border-0 p-5 shadow-sm text-center">
          <i className="bi bi-shield-x text-muted display-4 mb-3"></i>
          <h3 className="h5 fw-bold">No Records Found</h3>
          <p className="text-secondary mb-0">No vaccinations found matching your filter selection.</p>
        </div>
      )}
    </div>
  );
};

export default VaccinationTracker;
