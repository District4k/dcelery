import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import './App.css';

const BASE_URL = 'http://0.0.0.0:8001';

function App() {
  const [file, setFile] = useState(null);
  const [taskId, setTaskId] = useState(null);
  const [status, setStatus] = useState(null);
  const [data, setData] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [columns, setColumns] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [selectedColumn, setSelectedColumn] = useState('');
  const [error, setError] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [isUploading, setIsUploading] = useState(false);

  // Helper function to get CSRF token
  const getCookie = (name) => {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === (name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  };

  // Helper function for API requests
  const fetchWithCSRF = async (url, options = {}) => {
    const defaultOptions = {
      credentials: 'include',
      headers: {
        'X-CSRFToken': getCookie('csrftoken'),
        ...options.headers,
      },
    };

    return fetch(url, { ...defaultOptions, ...options });
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setIsUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetchWithCSRF(`${BASE_URL}/api/csv/`, {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();

      if (res.ok) {
        setTaskId(result.task_id);
        setStatus('PENDING');
        console.log('Upload successful, task ID:', result.task_id);
      } else {
        setError(result.error || 'Failed to upload file');
        console.error('Upload failed:', result);
      }
    } catch (error) {
      setError('Network error occurred');
      console.error('Network Error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  // Updated polling effect with better error handling
  useEffect(() => {
    if (!taskId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetchWithCSRF(`${BASE_URL}/api/task-status/${taskId}/`);
        const result = await res.json();

        setStatus(result.status);
        console.log('Task status:', result.status);

        if (result.status === 'SUCCESS' && result.data) {
          clearInterval(interval);
          setData({
            rows: result.data.rows,
            columns: result.data.columns
          });
          console.log('Data loaded:', result.data);
        } else if (result.status === 'FAILURE') {
          clearInterval(interval);
          setError(result.error || 'Task failed');
          console.error('Task failed:', result.error);
        }
      } catch (error) {
        console.error('Error checking task status:', error);
        setError('Error checking task status');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [taskId]);

  return (
    <div className="App">
      <header className="app-header">
        <h1>CSV Upload & Graph Viewer</h1>
      </header>

      <main className="app-main">
        <section className="upload-section">
          <form onSubmit={handleUpload} className="upload-form">
            <div className="file-input-container">
              <label htmlFor="file-upload" className="file-input-label">
                Choose CSV File
              </label>
              <input
                id="file-upload"
                type="file"
                accept=".csv"
                onChange={(e) => setFile(e.target.files[0])}
                className="file-input"
              />
            </div>
            {file && <p className="selected-file">Selected: {file.name}</p>}
            <button 
              type="submit" 
              className="upload-button"
              disabled={isUploading}
            >
              {isUploading ? 'Uploading...' : 'Upload File'}
            </button>
          </form>
        </section>

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        {status && (
          <div className={`status-message ${status.toLowerCase()}`}>
            <span className="status-icon">
              {status === 'PENDING' ? '⏳' : status === 'SUCCESS' ? '✅' : '❌'}
            </span>
            Status: {status}
            {status === 'PENDING' && ' (Processing...)'}
          </div>
        )}

        {data.length > 0 && (
          <section className="data-section">
            <div className="table-section">
              <h2>Table Preview</h2>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      {columns.map((col) => (
                        <th key={col}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.slice(0, 5).map((row, index) => (
                      <tr key={index}>
                        {columns.map((col) => (
                          <td key={col}>{row[col]}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="graph-section">
              <h2>Data Visualization</h2>
              <div className="column-selector">
                <label htmlFor="column-select">Select Column for Graph:</label>
                <select 
                  id="column-select"
                  onChange={(e) => setSelectedColumn(e.target.value)} 
                  value={selectedColumn}
                  className="column-select"
                >
                  <option value="">-- Choose column --</option>
                  {columns.map((col) => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
              </div>

              {selectedColumn && (
                <div className="chart-container">
                  <h3>Bar Chart: {selectedColumn}</h3>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={data.slice(0, 10)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey={columns[0]} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey={selectedColumn} fill="#4f46e5" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
