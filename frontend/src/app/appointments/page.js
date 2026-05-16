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

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ patientId: '', doctorId: '', appointmentDate: '' });
  const [filterStatus, setFilterStatus] = useState('All');

  const addToast = (msg, type = 'success') => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  };

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, dRes] = await Promise.all([
        fetch(`${API}/PATIENTSERVICE/api/patients`).then(r => r.json()),
        fetch(`${API}/DOCTORSERVICE/api/doctors`).then(r => r.json()),
      ]);
      const pts = Array.isArray(pRes) ? pRes : [];
      const drs = Array.isArray(dRes) ? dRes : [];
      setPatients(pts);
      setDoctors(drs);

      if (pts.length > 0) {
        // default date = tomorrow at 10:00 AM
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(10, 0, 0, 0);
        const iso = tomorrow.toISOString().slice(0, 16);
        setForm(f => ({ ...f, patientId: String(pts[0].id), doctorId: drs[0] ? String(drs[0].id) : '', appointmentDate: iso }));
      }

      // Load appointments for all patients
      const apptArrays = await Promise.all(
        pts.map(pt =>
          fetch(`${API}/APPOINTMENTSERVICE/api/appointments/patient/${pt.id}`)
            .then(r => r.json()).catch(() => [])
        )
      );
      const all = apptArrays.flat().filter(Boolean);
      const uniq = [...new Map(all.map(a => [a.id, a])).values()];
      uniq.sort((a, b) => b.id - a.id);
      setAppointments(uniq);
    } catch (e) {
      addToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const handleBook = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const r = await fetch(`${API}/APPOINTMENTSERVICE/api/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId: Number(form.doctorId),
          patientId: Number(form.patientId),
          appointmentDate: form.appointmentDate ? form.appointmentDate + ':00' : null,
        }),
      });
      if (!r.ok) throw new Error();
      const pt = patients.find(p => p.id === Number(form.patientId));
      const dr = doctors.find(d => d.id === Number(form.doctorId));
      addToast(`Appointment booked! ${pt?.name} ↔ Dr. ${dr?.name}. Email sent! 📧`);
      setShowModal(false);
      loadAll();
    } catch {
      addToast('Failed to book appointment', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (id) => {
    if (!confirm('Cancel this appointment?')) return;
    try {
      await fetch(`${API}/APPOINTMENTSERVICE/api/appointments/cancel/${id}`, { method: 'DELETE' });
      addToast('Appointment cancelled successfully.');
      loadAll();
    } catch {
      addToast('Failed to cancel appointment', 'error');
    }
  };

  const getPatientName = id => patients.find(p => p.id === id)?.name || `Patient #${id}`;
  const getDoctorName  = id => doctors.find(d => d.id === id)?.name  || `Doctor #${id}`;
  const getDoctorSpec  = id => doctors.find(d => d.id === id)?.specialty || '';

  const filtered = filterStatus === 'All'
    ? appointments
    : appointments.filter(a => a.status === filterStatus);

  const scheduledCount = appointments.filter(a => a.status === 'SCHEDULED').length;
  const canceledCount  = appointments.filter(a => a.status === 'CANCELED').length;

  return (
    <>
      <Toast toasts={toasts} />

      <div className="page-header">
        <h2>📅 Appointments</h2>
        <p>Book appointments and track their status. Confirmation emails are sent automatically via RabbitMQ.</p>
      </div>

      {/* mini stats */}
      {!loading && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          {[
            { label: 'Total', val: appointments.length, color: 'var(--primary)' },
            { label: 'Scheduled', val: scheduledCount, color: 'var(--success)' },
            { label: 'Cancelled', val: canceledCount, color: 'var(--danger)' },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.val}</span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.label}</span>
            </div>
          ))}
        </div>
      )}

      <div className="card">
        <div className="card-header" style={{ flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', gap: 10 }}>
            {['All', 'SCHEDULED', 'CANCELED'].map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`btn btn-sm ${filterStatus === s ? 'btn-primary' : 'btn-ghost'}`}
              >
                {s === 'SCHEDULED' ? '✅' : s === 'CANCELED' ? '❌' : '📋'} {s}
              </button>
            ))}
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)} disabled={patients.length === 0 || doctors.length === 0}>
            ＋ Book Appointment
          </button>
        </div>

        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📅</div>
            <h4>No appointments {filterStatus !== 'All' ? `with status "${filterStatus}"` : 'yet'}</h4>
            <p>Click "Book Appointment" to schedule one. An email will be sent automatically!</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th><th>Patient</th><th>Doctor</th><th>Specialty</th><th>Date & Time</th><th>Status</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(a => (
                  <tr key={a.id}>
                    <td className="td-id">#{a.id}</td>
                    <td>{getPatientName(a.patientId)}</td>
                    <td>Dr. {getDoctorName(a.doctorId)}</td>
                    <td><span className="badge badge-specialty">{getDoctorSpec(a.doctorId)}</span></td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: 12.5 }}>
                      {a.appointmentDate
                        ? new Date(a.appointmentDate).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
                        : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                    </td>
                    <td>
                      <span className={`badge badge-${String(a.status || '').toLowerCase()}`}>
                        {a.status === 'SCHEDULED' ? '✅' : '❌'} {a.status}
                      </span>
                    </td>
                    <td>
                      {a.status === 'SCHEDULED' && (
                        <button className="btn btn-danger btn-sm" onClick={() => handleCancel(a.id)}>
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ marginTop: 16, background: 'rgba(0,200,168,0.05)', border: '1px solid rgba(0,200,168,0.15)', borderRadius: 12, padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--text-secondary)' }}>
        <span style={{ fontSize: 18 }}>📧</span>
        <span>When an appointment is booked, a confirmation email is sent automatically to both the patient and doctor via <strong style={{ color: 'var(--primary)' }}>RabbitMQ → Notification Service → Gmail SMTP</strong>.</span>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3>📅 Book New Appointment</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleBook}>
              <div className="modal-body">
                <div style={{ background: 'rgba(0,200,168,0.06)', border: '1px solid rgba(0,200,168,0.15)', borderRadius: 10, padding: '12px 14px', fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  📧 <strong>Email notification</strong> will be automatically sent to both the patient and doctor once the appointment is booked.
                </div>
                <div className="form-group">
                  <label>Select Patient *</label>
                  <select required value={form.patientId} onChange={e => setForm({...form, patientId: e.target.value})}>
                    {patients.map(p => <option key={p.id} value={p.id}>#{p.id} — {p.name} ({p.email})</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Select Doctor *</label>
                  <select required value={form.doctorId} onChange={e => setForm({...form, doctorId: e.target.value})}>
                    {doctors.map(d => <option key={d.id} value={d.id}>#{d.id} — Dr. {d.name} ({d.specialty})</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Appointment Date & Time *</label>
                  <input
                    required
                    type="datetime-local"
                    value={form.appointmentDate}
                    onChange={e => setForm({...form, appointmentDate: e.target.value})}
                    min={new Date().toISOString().slice(0, 16)}
                    style={{ colorScheme: 'dark' }}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? '⏳ Booking...' : '📅 Confirm Appointment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
