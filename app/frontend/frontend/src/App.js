import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';

const BASE_URL = 'http://0.0.0.0:8001';

function App() {
  const [file, setFile] = useState(null);
  const [taskId, setTaskId] = useState(null);
  const [status, setStatus] = useState(null);
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [selectedColumn, setSelectedColumn] = useState('');
  const [error, setError] = useState(null);
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
          setData(result.data.rows);
          setColumns(result.data.columns);
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
    <div style={{ padding: '2rem' }}>
      <h1>CSV Upload & Graph Viewer</h1>

      <form onSubmit={handleUpload}>
        <input
          type="file"
          accept=".csv"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <button type="submit" disabled={isUploading}>
          {isUploading ? 'Uploading...' : 'Upload'}
        </button>
      </form>

      {error && (
        <div style={{ color: 'red', margin: '1rem 0' }}>
          Error: {error}
        </div>
      )}

      {status && (
        <div style={{ margin: '1rem 0' }}>
          Status: {status}
          {status === 'PENDING' && ' (Processing...)'}
        </div>
      )}

      {data.length > 0 && (
        <>
          <h2>Table Preview</h2>
          <table border="1" cellPadding="5">
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

          <h2>Select Column for Graph</h2>
          <select onChange={(e) => setSelectedColumn(e.target.value)} value={selectedColumn}>
            <option value="">-- Choose column --</option>
            {columns.map((col) => (
              <option key={col} value={col}>{col}</option>
            ))}
          </select>

          {selectedColumn && (
            <>
              <h3>Bar Chart for: {selectedColumn}</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey={columns[0]} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey={selectedColumn} fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default App;
