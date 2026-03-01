import React, { useState } from "react";

const CreatePost = () => {
  const [content, setContent] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle post creation logic
    setContent("");
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">Create Post</h2>
      <form onSubmit={handleSubmit} className="bg-gray-800 p-4 rounded shadow">
        <textarea
          className="w-full p-2 rounded bg-gray-700 text-gray-200"
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
        />
        <button
          type="submit"
          className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded"
        >
          Post
        </button>
      </form>
    </div>
  );
};

export default CreatePost;
