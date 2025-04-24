// src/components/TaskStatusChecker.jsx
import React, { useState, useEffect, useCallback } from "react";
import api from "../api";

function TaskStatusChecker({ taskId }) {
  const [status, setStatus] = useState("");
  const [record, setRecord] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);

  const checkStatus = useCallback(async () => {
    if (!taskId) return;
    setLoading(true);
    setError(null);

    try {
      const res = await api.get(`/api/task/${taskId}/`);
      setStatus(res.data.status);
      setRecord(res.data.record || null);
      setError(res.data.error || null);
      if (["SUCCESS", "FAILURE"].includes(res.data.status)) {
        setPolling(false);
        // Trigger cleanup
        await api.post(`/api/task/${taskId}/`);
      }
      console.log(`Task ${taskId} status:`, res.data); // Debug log
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Failed to fetch task status.";
      setError(errorMsg);
      console.error(`Task ${taskId} error:`, err); // Debug log
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    if (taskId && polling) {
      checkStatus();
      const interval = setInterval(checkStatus, 5000);
      return () => clearInterval(interval);
    }
  }, [taskId, polling, checkStatus]);

  useEffect(() => {
    if (taskId) {
      setPolling(true);
      checkStatus();
    }
  }, [taskId, checkStatus]);

  return (
    <div className="mt-6 space-y-4" aria-live="polite">
      {status && (
        <div className="p-4 bg-gray-100 rounded-md">
          <p className="text-sm text-gray-800">
            Status: <strong>{status}</strong>
          </p>
          {loading && (
            <p className="text-sm text-gray-600 mt-2 flex items-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-5 w-5 text-gray-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Checking Status...
            </p>
          )}
          {record && (
            <div className="text-sm text-gray-800 mt-2">
              <p>Record ID: <strong>{record.id}</strong></p>
              <p>CSV Name: <strong>{record.name || "Unnamed"}</strong></p>
              <p>CSV Type: <strong>{record.csv_type}</strong></p>
              <p>Rows Saved: <strong>{record.rows}</strong></p>
              <p>Uploaded At: <strong>{record.uploaded_at}</strong></p>
            </div>
          )}
          {error && (
            <p className="text-sm text-red-600 mt-2" role="alert">
              Error: {error}
            </p>
          )}
        </div>
      )}
      {!taskId && (
        <p className="text-sm text-gray-600" role="status">
          No task ID provided.
        </p>
      )}
    </div>
  );
}

export default TaskStatusChecker;