import React from "react";
import CsvUploader from "./components/CsvUploader";

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-100 to-purple-200 flex items-center justify-center">
      <div className="w-full max-w-lg p-8 bg-white shadow-lg rounded-xl">
        <CsvUploader />
      </div>
    </div>
  );
}

export default App;
