import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getRoleConfig } from '../config/navigation.js';
import { getAllSchemes } from '../api/schemeApi.js';
import { getMyApplications } from '../api/applicationApi.js';

function countStatus(items, status) {
  return items.filter((item) => item.status === status).length;
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(value || 0));
}

function statusMeta(status) {
  const map = {
    SUBMITTED: { label: 'Submitted', tone: 'submitted', icon: '•' },
    UNDER_VERIFICATION: { label: 'Under Verification', tone: 'pending', icon: '◷' },
    VERIFIED: { label: 'Verified', tone: 'verified', icon: '✓' },
    APPROVED: { label: 'Approved', tone: 'approved', icon: '✓' },
    REJECTED: { label: 'Rejected', tone: 'rejected', icon: '!' },
  };
  return map[status] || { label: status || 'Unknown', tone: 'neutral', icon: '•' };
}

function StatusBadge({ status }) {
  const meta = statusMeta(status);
  return <span className={`dashboard-status ${meta.tone}`}><span aria-hidden="true">{meta.icon}</span>{meta.label}</span>;
}

export default function Dashboard() {
  const { email, role } = useAuth();
  const navigate = useNavigate();
  const roleConfig = getRoleConfig(role);
  const [schemes, setSchemes] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError('');

    // Staff dashboards intentionally stay lightweight. They do not call
    // beneficiary-only APIs immediately after login, which prevents an
    // authorization response from interrupting the login redirect.
    if (role !== 'BENEFICIARY') {
      setLoading(false);
      return;
    }

    const results = await Promise.allSettled([getAllSchemes(), getMyApplications()]);
    const readArray = (result) => result?.status === 'fulfilled' && Array.isArray(result.value?.data) ? result.value.data : [];
    setSchemes(readArray(results[0]));
    setApplications(readArray(results[1]));
    if (results.some((result) => result.status === 'rejected')) {
      setError('Some dashboard information could not be loaded. The available data is still shown.');
    }
    setLoading(false);
  }, [role]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const activeSchemes = useMemo(() => schemes.filter((item) => item.active), [schemes]);
  const approved = countStatus(applications, 'APPROVED');
  const rejected = countStatus(applications, 'REJECTED');
  const underVerification = countStatus(applications, 'UNDER_VERIFICATION');
  const submitted = countStatus(applications, 'SUBMITTED');
  const verified = countStatus(applications, 'VERIFIED');

  if (role !== 'BENEFICIARY') {
    const labels = {
      ADMIN: ['Administrator', 'Monitor subsidy operations, configuration and workflow activity from one place.'],
      FIELD_OFFICER: ['Field Officer', 'Review beneficiary and application activity requiring field-level action.'],
      DISTRICT_OFFICER: ['District Officer', 'Review verified applications and support district-level approval workflow.'],
      FINANCE_OFFICER: ['Finance Officer', 'Monitor approved applications and finance-controlled disbursement activity.'],
    };
    const [title, description] = labels[role] || ['Portal', 'Manage government subsidy and grant services.'];
    return (
      <div className="staff-dashboard">
        <section className="staff-hero">
          <div><p className="eyebrow">GOVERNMENT SERVICE OPERATIONS</p><h1>{title} Dashboard</h1><p>{description}</p></div>
          <div className="staff-hero-mark">GS</div>
        </section>
        {error && <div className="form-error dashboard-notice" role="alert">{error}</div>}
        <section className="dashboard-panel staff-welcome">
          <p className="eyebrow">SIGNED IN ACCOUNT</p><h2>{email}</h2><p>Your access is governed by your assigned role and the backend security policy.</p>
          <div className="staff-actions">
            <button type="button" className="btn-primary" onClick={() => navigate(`${roleConfig?.homePath}/applications`)}>Open Applications</button>
            <button type="button" className="btn-secondary" onClick={() => navigate(`${roleConfig?.homePath}/schemes`)}>View Schemes</button>
          </div>
        </section>
        <section className="citizen-message"><div className="message-mark">✓</div><div><strong>Transparent public service delivery.</strong><p>Use the navigation panel to access the functions available to your role.</p></div></section>
      </div>
    );
  }

  return (
    <div className="beneficiary-dashboard">
      <section className="citizen-hero">
        <div className="hero-copy">
          <p className="eyebrow">CITIZEN SERVICES PORTAL</p>
          <h1>Welcome back, <span>{email?.split('@')[0] || 'Beneficiary'}</span></h1>
          <p>Manage your subsidy applications, discover available schemes and stay informed about every stage of your application.</p>
          <div className="hero-actions">
            <button type="button" className="hero-primary" onClick={() => navigate('/beneficiary/schemes')}>Explore Schemes <span>→</span></button>
            <button type="button" className="hero-secondary" onClick={() => navigate('/beneficiary/applications')}>View My Applications</button>
          </div>
        </div>
        <div className="hero-emblem" aria-hidden="true">
          <div className="hero-emblem-ring">GS</div>
          <span>Citizen<br />First</span>
        </div>
      </section>

      {error && <div className="form-error dashboard-notice" role="alert">{error}</div>}

      <section className="dashboard-section-heading">
        <div><p className="eyebrow">AT A GLANCE</p><h2>Your service overview</h2></div>
        <span className="live-indicator"><i></i> Live account summary</span>
      </section>

      <section className="beneficiary-stat-grid" aria-label="Application summary">
        <div className="beneficiary-stat-card blue"><span className="stat-icon">▤</span><div><small>Active Schemes</small><strong>{loading ? '—' : activeSchemes.length}</strong><em>Available to explore</em></div></div>
        <div className="beneficiary-stat-card amber"><span className="stat-icon">▥</span><div><small>My Applications</small><strong>{loading ? '—' : applications.length}</strong><em>Total submitted</em></div></div>
        <div className="beneficiary-stat-card orange"><span className="stat-icon">◷</span><div><small>Under Verification</small><strong>{loading ? '—' : underVerification}</strong><em>Being reviewed</em></div></div>
        <div className="beneficiary-stat-card green"><span className="stat-icon">✓</span><div><small>Approved</small><strong>{loading ? '—' : approved}</strong><em>Positive decisions</em></div></div>
      </section>

      <section className="dashboard-two-column">
        <div className="dashboard-panel service-panel">
          <div className="panel-heading"><div><p className="eyebrow">YOUR JOURNEY</p><h2>Application progress</h2></div><span>{applications.length} total</span></div>
          <div className="journey-grid">
            <div className="journey-item"><span className="journey-number">01</span><div><strong>Submitted</strong><small>{submitted} application{submitted === 1 ? '' : 's'} submitted</small></div><b className="journey-blue">{submitted}</b></div>
            <div className="journey-item"><span className="journey-number">02</span><div><strong>Under verification</strong><small>Field-level review in progress</small></div><b className="journey-amber">{underVerification}</b></div>
            <div className="journey-item"><span className="journey-number">03</span><div><strong>Verified</strong><small>Ready for approval stage</small></div><b className="journey-green">{verified}</b></div>
            <div className="journey-item"><span className="journey-number">04</span><div><strong>Approved</strong><small>Approved applications</small></div><b className="journey-green">{approved}</b></div>
            <div className="journey-item"><span className="journey-number">05</span><div><strong>Rejected</strong><small>Applications not approved</small></div><b className="journey-red">{rejected}</b></div>
          </div>
        </div>

        <div className="dashboard-panel assistance-panel">
          <div className="panel-heading"><div><p className="eyebrow">CITIZEN ASSISTANCE</p><h2>Need help?</h2></div><span className="help-icon">?</span></div>
          <p>Keep your registered information updated and check your application status regularly. For official assistance, use the support details provided below.</p>
          <div className="assistance-points"><span>✓</span><div><strong>Keep information current</strong><small>Accurate profile details help avoid processing delays.</small></div></div>
          <div className="assistance-points"><span>✓</span><div><strong>Track every stage</strong><small>Your application status is controlled by the official workflow.</small></div></div>
          <button type="button" className="panel-link" onClick={() => navigate('/beneficiary/profile')}>Review my profile →</button>
        </div>
      </section>

      <section className="dashboard-panel schemes-preview">
        <div className="panel-heading"><div><p className="eyebrow">AVAILABLE SERVICES</p><h2>Explore active subsidy schemes</h2><small>Find schemes currently open for beneficiary applications.</small></div><button type="button" className="panel-link" onClick={() => navigate('/beneficiary/schemes')}>View all schemes →</button></div>
        <div className="scheme-preview-grid">
          {activeSchemes.slice(0, 3).map((scheme) => (
            <button type="button" className="scheme-preview-card" key={scheme.id} onClick={() => navigate(`/beneficiary/applications?schemeId=${scheme.id}`)}>
              <span className="scheme-preview-code">{scheme.code}</span><strong>{scheme.name}</strong><span>Maximum support {formatCurrency(scheme.maximumAmount)}</span><b>Apply now →</b>
            </button>
          ))}
          {!loading && activeSchemes.length === 0 && <div className="empty-state compact"><strong>No active schemes available</strong><span>Please check again later for newly published schemes.</span></div>}
          {loading && <div className="loading-state compact">Loading active schemes…</div>}
        </div>
      </section>

      <section className="dashboard-panel applications-preview">
        <div className="panel-heading"><div><p className="eyebrow">RECENT ACTIVITY</p><h2>My applications</h2><small>Your latest application records and current status.</small></div><button type="button" className="panel-link" onClick={() => navigate('/beneficiary/applications')}>Open applications →</button></div>
        {applications.length === 0 && !loading ? (
          <div className="empty-state compact"><strong>No applications yet</strong><span>Explore active schemes to submit your first application.</span></div>
        ) : (
          <div className="dashboard-table-wrapper">
            <table className="dashboard-table">
              <thead><tr><th>Application</th><th>Scheme</th><th>Requested amount</th><th>Status</th></tr></thead>
              <tbody>
                {[...applications].reverse().slice(0, 5).map((application) => (
                  <tr key={application.id}>
                    <td><strong>APP-{String(application.id).padStart(4, '0')}</strong></td>
                    <td>Scheme #{application.schemeId}</td>
                    <td>{formatCurrency(application.requestedAmount)}</td>
                    <td><StatusBadge status={application.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="citizen-message">
        <div className="message-mark">✓</div>
        <div><strong>Transparent services. Empowered citizens.</strong><p>Our digital workflow is designed to make subsidy applications easier to submit, track and understand.</p></div>
      </section>
    </div>
  );
}
