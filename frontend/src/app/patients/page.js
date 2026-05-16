'use client';
import { useEffect, useState, useCallback } from 'react';

const API = '/proxy';

function Toast({ toasts }) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`}>
          <span className="toast-icon">{t.type === 'success' ? '✅' : '❌'}</span>
          {t.msg}
        </div>
      ))}
    </div>
  );
}

export default function PatientsPage() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '' });

  const addToast = (msg, type = 'success') => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  };

  const loadPatients = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/PATIENTSERVICE/api/patients`);
      const data = await r.json();
      setPatients(Array.isArray(data) ? data : []);
    } catch {
      addToast('Failed to load patients', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPatients(); }, [loadPatients]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const r = await fetch(`${API}/PATIENTSERVICE/api/patients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!r.ok) throw new Error();
      addToast(`Patient "${form.name}" created successfully!`);
      setShowModal(false);
      setForm({ name: '', email: '', phone: '', address: '' });
      loadPatients();
    } catch {
      addToast('Failed to create patient', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete patient "${name}"?`)) return;
    try {
      await fetch(`${API}/PATIENTSERVICE/api/patients/${id}`, { method: 'DELETE' });
      addToast(`Patient "${name}" deleted.`);
      loadPatients();
    } catch {
      addToast('Failed to delete patient', 'error');
    }
  };

  const filtered = patients.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.email?.toLowerCase().includes(search.toLowerCase()) ||
    p.address?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Toast toasts={toasts} />

      <div className="page-header">
        <h2>👥 Patients</h2>
        <p>Manage all registered patients in the system</p>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="search-bar">
            <span>🔍</span>
            <input placeholder="Search patients..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            ＋ Add Patient
          </button>
        </div>

        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <h4>{search ? 'No matching patients' : 'No patients registered yet'}</h4>
            <p>Click "Add Patient" to register a new patient</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th><th>Name</th><th>Email</th><th>Phone</th><th>Address</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id}>
                    <td className="td-id">#{p.id}</td>
                    <td>{p.name}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{p.email}</td>
                    <td>{p.phone}</td>
                    <td>{p.address}</td>
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id, p.name)}>
                        🗑 Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary strip */}
      {!loading && (
        <div style={{ marginTop: 16, display: 'flex', gap: 16, fontSize: 13, color: 'var(--text-muted)' }}>
          <span>Total patients: <strong style={{ color: 'var(--primary)' }}>{patients.length}</strong></span>
          {search && <span>Showing: <strong style={{ color: 'var(--primary)' }}>{filtered.length}</strong></span>}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3>➕ Register New Patient</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input required placeholder="e.g. Rahul Patil" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Email Address *</label>
                  <input required type="email" placeholder="e.g. rahul@gmail.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input placeholder="e.g. 9876543210" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Address</label>
                  <input placeholder="e.g. Mumbai, Maharashtra" value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? '⏳ Saving...' : '✅ Register Patient'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
