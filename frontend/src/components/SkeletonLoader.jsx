import React from "react";

const SkeletonLoader = ({ width = "w-full", height = "h-6" }) => (
  <div className={`bg-gray-700 animate-pulse rounded ${width} ${height}`}></div>
);

export default SkeletonLoader;
