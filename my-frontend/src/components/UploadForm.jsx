// src/components/UploadForm.jsx
import React, { useState } from "react";
import api from "../api";

function UploadForm({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [csvName, setCsvName] = useState(""); // New state for CSV name
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && !selectedFile.name.endsWith(".csv")) {
      setError("Please select a valid CSV file.");
      setFile(null);
      return;
    }
    setError(null);
    setFile(selectedFile);
  };

  const handleNameChange = (e) => {
    setCsvName(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("No file selected.");
      return;
    }
    if (!csvName.trim()) {
      setError("Please provide a name for the CSV.");
      return;
    }

    setUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("csv_name", csvName); // Add CSV name to form data

    try {
      const res = await api.post("/api/upload/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onUploadSuccess(res.data.task_id);
      setFile(null);
      setCsvName(""); // Reset name input
      e.target.reset();
    } catch (err) {
      setError(
        err.response?.data?.error || "Failed to upload file. Please try again."
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" aria-label="CSV Upload Form">
      <div>
        <label htmlFor="csv-name" className="block text-sm font-medium text-gray-700">
          CSV Name
        </label>
        <input
          id="csv-name"
          type="text"
          value={csvName}
          onChange={handleNameChange}
          placeholder="Enter a name for this CSV"
          className="block w-full p-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={uploading}
        />
      </div>
      <div>
        <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700">
          Upload CSV File
        </label>
        <input
          id="file-upload"
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="block w-full p-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-describedby={error ? "file-error" : undefined}
          disabled={uploading}
        />
        {error && (
          <p id="file-error" className="mt-2 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
      <button
        type="submit"
        disabled={uploading || !file || !csvName.trim()}
        className="w-full py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50 flex items-center justify-center"
        aria-busy={uploading}
      >
        {uploading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
            Uploading...
          </>
        ) : (
          "Upload CSV"
        )}
      </button>
    </form>
  );
}

export default UploadForm;