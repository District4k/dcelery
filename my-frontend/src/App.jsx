// src/App.jsx
import React from "react";
import CsvUploader from "./components/CsvUploader";
import { ErrorBoundary } from "react-error-boundary";

function App() {
  const ErrorFallback = ({ error, resetErrorBoundary }) => (
    <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
      <h2 className="text-lg font-semibold">Something went wrong</h2>
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
    <main className="min-h-screen bg-gradient-to-r from-blue-100 to-purple-200 flex items-center justify-center p-4">
      <section className="w-full max-w-lg p-8 bg-white shadow-lg rounded-xl" aria-labelledby="app-title">
        <h1 id="app-title" className="text-2xl font-bold text-gray-800 mb-6 text-center">
          CSV File Uploader
        </h1>
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <CsvUploader />
        </ErrorBoundary>
      </section>
    </main>
  );
}

export default App;