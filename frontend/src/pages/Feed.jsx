import React from "react";
import SkeletonLoader from "../components/SkeletonLoader";

const Feed = () => {
  // Placeholder for feed data
  const loading = false;
  const posts = [];

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">Feed</h2>
      {loading ? (
        <SkeletonLoader height="h-24" />
      ) : posts.length === 0 ? (
        <div className="text-gray-400">No posts yet.</div>
      ) : (
        posts.map((post, idx) => (
          <div key={idx} className="bg-gray-800 p-4 rounded shadow">
            {/* Render post content here */}
            <span className="text-gray-200">{post.content}</span>
          </div>
        ))
      )}
    </div>
  );
};

export default Feed;
