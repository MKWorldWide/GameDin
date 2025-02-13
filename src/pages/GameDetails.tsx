import React from 'react';
import { useParams } from 'react-router-dom';

const GameDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Game Details</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-lg text-gray-700">Loading details for game {id}...</p>
      </div>
    </div>
  );
};

export default GameDetails; 