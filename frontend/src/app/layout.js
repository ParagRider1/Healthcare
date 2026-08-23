'use client';
import './globals.css';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

function Sidebar() {
  const path = usePathname();
  const links = [
    { href: '/', icon: '🏠', label: 'Dashboard' },
    { href: '/patients', icon: '👥', label: 'Patients' },
    { href: '/doctors', icon: '🩺', label: 'Doctors' },
    { href: '/appointments', icon: '📅', label: 'Appointments' },
    { href: '/diagnostics', icon: '🧠', label: 'AI Diagnostics' },
    { href: '/billing', icon: '💳', label: 'Billing & Invoices' },
  ];
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">🏥</div>
        <h1>MediConnect</h1>
        <p>Healthcare Management System</p>
      </div>
      <nav className="sidebar-nav">
        {links.map(l => (
          <Link key={l.href} href={l.href} className={path === l.href ? 'active' : ''}>
            <span className="nav-icon">{l.icon}</span>
            {l.label}
          </Link>
        ))}
      </nav>
      <div className="sidebar-footer">
        <p>Built by <span>MT2025083 & MT2025098</span></p>
        <p style={{ marginTop: 4 }}>SPE Project · IIIT Bangalore</p>
      </div>
    </aside>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>MediConnect — Healthcare Management System</title>
        <meta name="description" content="Doctor-Patient Appointment Management System" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        <div className="app-layout">
          <Sidebar />
          <main className="main-content">{children}</main>
        </div>
      </body>
    </html>
  );
}
