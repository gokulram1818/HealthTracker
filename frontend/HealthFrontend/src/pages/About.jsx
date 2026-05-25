import React from 'react';

const About = () => {
  return (
    <div className="container py-5 animated-fade flex-grow-1 text-start">
      <div className="row mb-5">
        <div className="col-lg-8 mx-auto text-center">
          <h1 className="fw-bold mb-3 gradient-text">About Our Platform</h1>
          <p className="lead text-secondary">
            CommHealth is designed to simplify community immunization programs. We bridge the gap between citizens, medical professionals, and regional administrators.
          </p>
        </div>
      </div>

      <div className="row g-4 mb-5">
        <div className="col-md-6">
          <h2 className="fw-bold mb-3 h4">Why Track Vaccinations?</h2>
          <p className="text-secondary mb-3">
            Immunizations are the most effective way to protect ourselves and our families against infectious diseases. Maintaining records is essential to ensuring booster doses are taken at the correct intervals.
          </p>
          <p className="text-secondary">
            With CommHealth, you receive notifications as due dates approach, preventing missed immunizations and establishing robust community protection.
          </p>
        </div>
        <div className="col-md-6">
          <h2 className="fw-bold mb-3 h4">How It Works</h2>
          <div className="d-flex gap-3 mb-3">
            <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px', flexShrink: 0 }}>
              <strong>1</strong>
            </div>
            <div>
              <h5 className="fw-bold">Sign Up & Profile Creation</h5>
              <p className="text-secondary">Create your profile, enter your basic health details (blood group, allergies) and log in.</p>
            </div>
          </div>
          <div className="d-flex gap-3 mb-3">
            <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px', flexShrink: 0 }}>
              <strong>2</strong>
            </div>
            <div>
              <h5 className="fw-bold">View Vaccination Schedules</h5>
              <p className="text-secondary">See pending and completed vaccinations directly. Download certified reports.</p>
            </div>
          </div>
          <div className="d-flex gap-3">
            <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px', flexShrink: 0 }}>
              <strong>3</strong>
            </div>
            <div>
              <h5 className="fw-bold">Attend Health Camps</h5>
              <p className="text-secondary">Find nearby healthcare camps scheduled by community health workers.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Suggested Timeline Schedule */}
      <h2 className="fw-bold mb-4 fs-3">Standard Immunization Reference</h2>
      <div className="card border-0 shadow-sm p-4 mb-5">
        <div className="table-responsive">
          <table className="table custom-table mb-0">
            <thead>
              <tr>
                <th>Vaccine Name</th>
                <th>Recommended Age/Target</th>
                <th>Disease Protected Against</th>
                <th>Interval/Doses Required</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="fw-semibold">BCG</td>
                <td>At birth</td>
                <td>Tuberculosis</td>
                <td>Single dose</td>
              </tr>
              <tr>
                <td className="fw-semibold">Hepatitis B</td>
                <td>Birth, 1-2 months, 6-18 months</td>
                <td>Hepatitis B infection</td>
                <td>3-dose series</td>
              </tr>
              <tr>
                <td className="fw-semibold">OPV / IPV (Polio)</td>
                <td>2, 4, 6-18 months, 4-6 years</td>
                <td>Poliomyelitis</td>
                <td>4-dose series + boosters</td>
              </tr>
              <tr>
                <td className="fw-semibold">MMR</td>
                <td>12-15 months, 4-6 years</td>
                <td>Measles, Mumps, Rubella</td>
                <td>2-dose series</td>
              </tr>
              <tr>
                <td className="fw-semibold">Tdap Booster</td>
                <td>11-12 years, and every 10 years</td>
                <td>Tetanus, Diphtheria, Pertussis</td>
                <td>1 dose every 10 years</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQs */}
      <h2 className="fw-bold mb-4 fs-3">Frequently Asked Questions</h2>
      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <div className="card p-3 border-0 shadow-sm h-100">
            <h5 className="fw-bold text-primary"><i className="bi bi-question-circle me-2"></i>How do I get my vaccination records updated?</h5>
            <p className="text-secondary mb-0 mt-2">
              Authorized Health Workers in your sector review patients and add/update vaccination items once they are administered. Ask your health worker to log the dose in CommHealth.
            </p>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card p-3 border-0 shadow-sm h-100">
            <h5 className="fw-bold text-primary"><i className="bi bi-question-circle me-2"></i>Is my medical history data secure?</h5>
            <p className="text-secondary mb-0 mt-2">
              Yes, your data is protected using role-based access tokens. Health history, allergies, and blood groups are accessible only by you, authorized staff, and admins.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
