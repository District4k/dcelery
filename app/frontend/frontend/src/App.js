import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';

function App() {
  const [file, setFile] = useState(null);
  const [taskId, setTaskId] = useState(null);
  const [status, setStatus] = useState(null);
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [selectedColumn, setSelectedColumn] = useState('');

  // Upload CSV
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('http://localhost:8000/api/upload-csv/', {
      method: 'POST',
      body: formData,
    });

    const result = await res.json();
    setTaskId(result.task_id);
    setStatus('PENDING');
  };

  // Poll task status
  useEffect(() => {
    if (!taskId) return;

    const interval = setInterval(async () => {
      const res = await fetch(`http://localhost:8000/api/task-status/${taskId}/`);
      const result = await res.json();

      setStatus(result.status);

      if (result.status === 'SUCCESS') {
        clearInterval(interval);
        setData(result.data);
        setColumns(Object.keys(result.data[0]));
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
        <button type="submit">Upload</button>
      </form>

      {status && <p>Status: {status}</p>}

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
