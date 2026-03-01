import React from "react";

const Profile = () => {
  // Placeholder for user profile
  const user = null;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">Profile</h2>
      {user ? (
        <div className="bg-gray-800 p-4 rounded shadow">
          <div className="text-gray-200 font-semibold">{user.name}</div>
          <div className="text-gray-400">{user.email}</div>
        </div>
      ) : (
        <div className="text-gray-400">No user data available.</div>
      )}
    </div>
  );
};

export default Profile;
