'use client';
import { useState, useEffect } from 'react';
import './billing.css';

export default function BillingPage() {
  const [patientId, setPatientId] = useState('1'); // Defaulting to 1 for demo purposes
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [payingId, setPayingId] = useState(null);

  const fetchInvoices = async () => {
    setLoading(true);
    setError('');
    try {
      // In a real app, patientId comes from Auth context.
      const res = await fetch(`/proxy/BILLINGSERVICE/api/billing/patient/${patientId}`);
      if (!res.ok) throw new Error('Failed to fetch invoices. Is BillingService running?');
      const data = await res.json();
      setInvoices(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [patientId]);

  const handlePay = async (invoiceId) => {
    setPayingId(invoiceId);
    try {
      const res = await fetch(`/proxy/BILLINGSERVICE/api/billing/pay/${invoiceId}`, {
        method: 'POST'
      });
      if (!res.ok) throw new Error('Payment failed');
      
      // Update UI immediately
      setInvoices(invoices.map(inv => 
        inv.id === invoiceId ? { ...inv, status: 'PAID' } : inv
      ));
    } catch (err) {
      alert(err.message);
    } finally {
      setPayingId(null);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>💳 Billing & Invoices</h1>
        <p>Manage your medical bills securely</p>
      </div>

      <div className="billing-content">
        <div className="patient-selector">
          <label>Viewing Invoices for Patient ID:</label>
          <input 
            type="number" 
            value={patientId} 
            onChange={(e) => setPatientId(e.target.value)}
            className="input-field"
          />
          <button className="btn-secondary" onClick={fetchInvoices}>Refresh</button>
        </div>

        {error && <div className="error-alert">{error}</div>}
        
        {loading ? (
          <div className="loading-state"><div className="spinner"></div></div>
        ) : (
          <div className="invoice-list">
            {invoices.length === 0 ? (
              <div className="empty-state">No invoices found for this patient. Book an appointment to generate one!</div>
            ) : (
              invoices.map(invoice => (
                <div key={invoice.id} className={`invoice-card ${invoice.status.toLowerCase()}`}>
                  <div className="invoice-header">
                    <h3>Invoice #{invoice.id}</h3>
                    <span className={`status-badge ${invoice.status.toLowerCase()}`}>
                      {invoice.status}
                    </span>
                  </div>
                  
                  <div className="invoice-details">
                    <div className="detail-row">
                      <span>Appointment Ref:</span>
                      <span>#{invoice.appointmentId}</span>
                    </div>
                    <div className="detail-row">
                      <span>Doctor ID:</span>
                      <span>#{invoice.doctorId}</span>
                    </div>
                    <div className="detail-row">
                      <span>Issued At:</span>
                      <span>{new Date(invoice.issuedAt).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="invoice-footer">
                    <div className="amount">${invoice.amount.toFixed(2)}</div>
                    {invoice.status === 'PENDING' && (
                      <button 
                        className="btn-primary pay-btn"
                        onClick={() => handlePay(invoice.id)}
                        disabled={payingId === invoice.id}
                      >
                        {payingId === invoice.id ? 'Processing...' : 'Pay with Stripe'}
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
