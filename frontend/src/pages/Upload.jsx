import React from "react";

const Upload = () => {
  // Placeholder for upload form
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">Upload</h2>
      <div className="bg-gray-800 p-4 rounded shadow">
        <form>
          <input type="file" className="mb-2" />
          <button
            type="submit"
            className="ml-2 px-4 py-2 bg-indigo-600 text-white rounded"
          >
            Upload
          </button>
        </form>
      </div>
    </div>
  );
};

export default Upload;
