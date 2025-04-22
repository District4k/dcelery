import React, { useState } from "react";
import UploadForm from "./UploadForm";
import TaskStatusChecker from "./TaskStatusChecker";

function CsvUploader() {
  const [taskId, setTaskId] = useState("");
  const handleUploadSuccess = (id) => {
    setTaskId(id);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-extrabold text-center text-gray-800">CSV Upload</h2>
      <UploadForm onUploadSuccess={handleUploadSuccess} />

      {taskId && (
        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-md shadow-sm">
          <p className="text-gray-700">
            Task ID: <code className="bg-gray-200 px-3 py-1 rounded-md">{taskId}</code>
          </p>
          <TaskStatusChecker taskId={taskId} />
        </div>
      )}
    </div>
  );
}

export default CsvUploader;
