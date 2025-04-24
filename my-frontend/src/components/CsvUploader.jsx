import React, { useState } from "react";
import UploadForm from "./UploadForm";
import TaskStatusChecker from "./TaskStatusChecker";
import { ErrorBoundary } from "react-error-boundary";

function CsvUploader() {
  const [taskId, setTaskId] = useState(null);

  const handleUploadSuccess = (id) => {
    setTaskId(id);
  };

  const handleReset = () => {
    setTaskId(null);
  };

  const ErrorFallback = ({ error, resetErrorBoundary }) => (
    <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
      <h3 className="text-lg font-semibold">Something went wrong</h3>
      <p>{error.message}</p>
      <button
        onClick={resetErrorBoundary}
        className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
      >
        Try Again
      </button>
    </div>
  );

  return (
    <section className="space-y-6" aria-labelledby="csv-upload-title">
      <h2
        id="csv-upload-title"
        className="text-3xl font-extrabold text-center text-gray-800"
      >
        CSV Upload
      </h2>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <UploadForm onUploadSuccess={handleUploadSuccess} />
        {taskId && (
          <div className="mt-6 p-6 bg-gray-50 border border-gray-200 rounded-md shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Task Details</h3>
              <button
                onClick={handleReset}
                className="text-sm text-blue-600 hover:text-blue-800 focus:outline-none focus:underline"
                aria-label="Clear task details"
              >
                Clear
              </button>
            </div>
            <p className="text-gray-700 mb-4" aria-live="polite">
              Task ID: <code className="bg-gray-200 px-3 py-1 rounded-md">{taskId}</code>
            </p>
            <TaskStatusChecker taskId={taskId} />
          </div>
        )}
      </ErrorBoundary>
    </section>
  );
}

export default CsvUploader;