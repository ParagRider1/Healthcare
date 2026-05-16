'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

const API = '/proxy';

export default function Dashboard() {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [p, d] = await Promise.all([
          fetch(`${API}/PATIENTSERVICE/api/patients`).then(r => r.json()),
          fetch(`${API}/DOCTORSERVICE/api/doctors`).then(r => r.json()),
        ]);
        setPatients(Array.isArray(p) ? p : []);
        setDoctors(Array.isArray(d) ? d : []);

        // Fetch appointments for all patients
        const apptArrays = await Promise.all(
          (Array.isArray(p) ? p : []).map(pt =>
            fetch(`${API}/APPOINTMENTSERVICE/api/appointments/patient/${pt.id}`)
              .then(r => r.json()).catch(() => [])
          )
        );
        const allAppts = apptArrays.flat().filter(Boolean);
        // deduplicate by id
        const uniq = [...new Map(allAppts.map(a => [a.id, a])).values()];
        setAppointments(uniq);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const scheduled = appointments.filter(a => a.status === 'SCHEDULED').length;
  const canceled  = appointments.filter(a => a.status === 'CANCELED').length;

  const getPatientName = id => patients.find(p => p.id === id)?.name || `Patient #${id}`;
  const getDoctorName  = id => doctors.find(d => d.id === id)?.name  || `Doctor #${id}`;

  return (
    <>
      {/* Hero */}
      <div className="hero-banner">
        <div className="hero-text">
          <h2>Welcome to MediConnect 👋</h2>
          <p>Your centralised healthcare management hub. Monitor patients, doctors and appointments all in one place with real-time data from your Kubernetes microservices.</p>
        </div>
        <div className="hero-emoji">🏥</div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon teal">👥</div>
          <div>
            <div className="stat-value">{loading ? '—' : patients.length}</div>
            <div className="stat-label">Total Patients</div>
          </div>
        </div>
        <div className="stat-card delay-1">
          <div className="stat-icon indigo">🩺</div>
          <div>
            <div className="stat-value">{loading ? '—' : doctors.length}</div>
            <div className="stat-label">Total Doctors</div>
          </div>
        </div>
        <div className="stat-card delay-2">
          <div className="stat-icon amber">📅</div>
          <div>
            <div className="stat-value">{loading ? '—' : scheduled}</div>
            <div className="stat-label">Scheduled</div>
          </div>
        </div>
        <div className="stat-card delay-3">
          <div className="stat-icon rose">❌</div>
          <div>
            <div className="stat-value">{loading ? '—' : canceled}</div>
            <div className="stat-label">Cancelled</div>
          </div>
        </div>
      </div>

      {/* Two column */}
      <div className="two-col-grid">
        {/* Recent Appointments */}
        <div className="card">
          <div className="card-header">
            <h3>📋 Recent Appointments</h3>
            <Link href="/appointments" className="btn btn-ghost btn-sm">View All →</Link>
          </div>
          {loading ? (
            <div className="loading-center"><div className="spinner" /></div>
          ) : appointments.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h4>No appointments yet</h4>
              <p>Book one to get started</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>#</th><th>Patient</th><th>Doctor</th><th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.slice(0, 6).map(a => (
                    <tr key={a.id}>
                      <td className="td-id">#{a.id}</td>
                      <td>{getPatientName(a.patientId)}</td>
                      <td>{getDoctorName(a.doctorId)}</td>
                      <td>
                        <span className={`badge badge-${String(a.status || '').toLowerCase()}`}>
                          {a.status === 'SCHEDULED' ? '✅' : '❌'} {a.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Doctors */}
        <div className="card">
          <div className="card-header">
            <h3>🩺 Available Doctors</h3>
            <Link href="/doctors" className="btn btn-ghost btn-sm">View All →</Link>
          </div>
          {loading ? (
            <div className="loading-center"><div className="spinner" /></div>
          ) : doctors.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🩺</div>
              <h4>No doctors registered</h4>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead><tr><th>#</th><th>Name</th><th>Specialty</th></tr></thead>
                <tbody>
                  {doctors.slice(0, 6).map(d => (
                    <tr key={d.id}>
                      <td className="td-id">#{d.id}</td>
                      <td>{d.name}</td>
                      <td><span className="badge badge-specialty">{d.specialty}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* DevOps Status strip */}
      <div style={{ marginTop: 20, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '16px 22px', display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, alignSelf: 'center' }}>⚙ DevOps Stack</span>
        {['Jenkins CI/CD','Kubernetes (Minikube)','Ansible Roles','Prometheus + Grafana','ELK Stack','HashiCorp Vault','RabbitMQ'].map(t => (
          <span key={t} style={{ fontSize: 12, background: 'rgba(0,200,168,0.08)', color: 'var(--primary)', padding: '4px 12px', borderRadius: 20, fontWeight: 600, border: '1px solid rgba(0,200,168,0.15)' }}>
            ✅ {t}
          </span>
        ))}
      </div>
    </>
  );
}
