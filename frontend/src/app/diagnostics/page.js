'use client';
import { useState, useRef } from 'react';
import './diagnostics.css';

export default function DiagnosticsPage() {
  const [file, setFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
      setError('');
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setAnalyzing(true);
    setResult(null);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/proxy/AIDIAGNOSTICSSERVICE/api/diagnostics/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Failed to analyze image. Ensure the Python service is running.');
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>🧠 AI Diagnostics Studio</h1>
        <p>Upload Medical Imaging (X-Ray, MRI, CT Scan) for Instant Analysis</p>
      </div>

      <div className="diagnostics-content">
        <div className="upload-box" onClick={() => fileInputRef.current.click()}>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            style={{ display: 'none' }} 
            accept="image/*"
          />
          <div className="upload-icon">📸</div>
          <h3>{file ? file.name : "Click or Drag to Upload Medical Scan"}</h3>
          <p>Supports PNG, JPG, DICOM (simulated)</p>
        </div>

        <button 
          className="btn-primary analyze-btn" 
          onClick={handleAnalyze} 
          disabled={!file || analyzing}
        >
          {analyzing ? 'Scanning with Neural Network...' : 'Analyze Image'}
        </button>

        {error && <div className="error-alert">{error}</div>}

        {analyzing && (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Processing via Polyglot ML Microservice...</p>
          </div>
        )}

        {result && (
          <div className="result-card">
            <h2>Analysis Report</h2>
            <div className="result-grid">
              <div className="result-item">
                <label>Status</label>
                <div className="value success">Completed</div>
              </div>
              <div className="result-item">
                <label>Detected Condition</label>
                <div className="value highlight">{result.analysis.condition}</div>
              </div>
              <div className="result-item">
                <label>Confidence Score</label>
                <div className="value">{result.analysis.confidence}%</div>
              </div>
              <div className="result-item">
                <label>Severity</label>
                <div className={`value severity-${result.analysis.severity.toLowerCase()}`}>
                  {result.analysis.severity}
                </div>
              </div>
            </div>
            <div className="recommendation">
              <strong>Recommendation:</strong> {result.recommendation}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
