import React, { useState } from "react";
import api from '../baseURL';

function TaskStatusChecker({ taskId }) {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const checkStatus = async () => {
    setLoading(true);

    try {
      const res = await api.get(`/task-status/${taskId}`);
      setStatus(res.data.status);
    } catch (err) {
      console.error("Error fetching task status:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 space-y-4">
      <button
        onClick={checkStatus}
        disabled={loading}
        className="w-full py-3 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 disabled:opacity-50"
      >
        {loading ? "Checking Status..." : "Check Task Status"}
      </button>
      {status && (
        <p className="text-sm text-gray-800">
          Status: <strong>{status}</strong>
        </p>
      )}
    </div>
  );
}

export default TaskStatusChecker;
