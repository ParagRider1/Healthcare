'use client';
import { useEffect, useState, useCallback } from 'react';

const API = '/proxy';

const SPECIALTIES = ['Cardiology','Neurology','Orthopedics','Dermatology','Pediatrics','Gynecology','Oncology','Psychiatry','General Medicine','ENT'];

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

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', specialty: 'Cardiology' });

  const addToast = (msg, type = 'success') => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  };

  const loadDoctors = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/DOCTORSERVICE/api/doctors`);
      const data = await r.json();
      setDoctors(Array.isArray(data) ? data : []);
    } catch {
      addToast('Failed to load doctors', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadDoctors(); }, [loadDoctors]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const r = await fetch(`${API}/DOCTORSERVICE/api/doctors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!r.ok) throw new Error();
      addToast(`Dr. ${form.name} registered successfully!`);
      setShowModal(false);
      setForm({ name: '', email: '', phone: '', address: '', specialty: 'Cardiology' });
      loadDoctors();
    } catch {
      addToast('Failed to register doctor', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const specialties = ['All', ...new Set(doctors.map(d => d.specialty).filter(Boolean))];

  const filtered = doctors.filter(d => {
    const matchSearch = d.name?.toLowerCase().includes(search.toLowerCase()) ||
      d.email?.toLowerCase().includes(search.toLowerCase()) ||
      d.specialty?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'All' || d.specialty === filter;
    return matchSearch && matchFilter;
  });

  return (
    <>
      <Toast toasts={toasts} />

      <div className="page-header">
        <h2>🩺 Doctors</h2>
        <p>Manage all registered doctors and their specialties</p>
      </div>

      <div className="card">
        <div className="card-header" style={{ flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', flex: 1 }}>
            <div className="search-bar">
              <span>🔍</span>
              <input placeholder="Search doctors..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select
              value={filter}
              onChange={e => setFilter(e.target.value)}
              style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 10, padding: '9px 14px', color: 'var(--text-primary)', fontFamily: 'inherit', fontSize: 13, outline: 'none', cursor: 'pointer' }}
            >
              {specialties.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            ＋ Add Doctor
          </button>
        </div>

        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🩺</div>
            <h4>No doctors found</h4>
            <p>Click "Add Doctor" to register a new doctor</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th><th>Name</th><th>Specialty</th><th>Email</th><th>Phone</th><th>Location</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(d => (
                  <tr key={d.id}>
                    <td className="td-id">#{d.id}</td>
                    <td>Dr. {d.name}</td>
                    <td><span className="badge badge-specialty">{d.specialty}</span></td>
                    <td style={{ color: 'var(--text-muted)' }}>{d.email}</td>
                    <td>{d.phone}</td>
                    <td>{d.address}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!loading && (
        <div style={{ marginTop: 16, display: 'flex', gap: 16, fontSize: 13, color: 'var(--text-muted)' }}>
          <span>Total doctors: <strong style={{ color: 'var(--primary)' }}>{doctors.length}</strong></span>
          {filter !== 'All' && <span>Specialty filter: <strong style={{ color: 'var(--primary)' }}>{filter}</strong></span>}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3>🩺 Register New Doctor</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input required placeholder="e.g. Ananya Rao" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Specialty *</label>
                  <select value={form.specialty} onChange={e => setForm({...form, specialty: e.target.value})}>
                    {SPECIALTIES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Email Address *</label>
                  <input required type="email" placeholder="e.g. doctor@hospital.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input placeholder="e.g. 9876543210" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Hospital / Location</label>
                  <input placeholder="e.g. AIIMS, New Delhi" value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? '⏳ Saving...' : '✅ Register Doctor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
