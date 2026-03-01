import React from "react";
import Player from "../components/Player";

const Music = () => {
  // Placeholder for music list
  const tracks = [];

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">Music</h2>
      <Player />
      {tracks.length === 0 ? (
        <div className="text-gray-400">No music tracks available.</div>
      ) : (
        tracks.map((track, idx) => (
          <div key={idx} className="bg-gray-800 p-4 rounded shadow">
            <span className="text-gray-200">{track.title}</span>
          </div>
        ))
      )}
    </div>
  );
};

export default Music;
