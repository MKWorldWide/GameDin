import React from 'react';
import { useParams } from 'react-router-dom';

const GameDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
<<<<<<< HEAD
    <div className="max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Game Details</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-lg text-gray-700">Loading details for game {id}...</p>
=======
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900">Game Details</h1>
          <div className="mt-4">
            <p className="text-gray-600">Loading game details for ID: {id}</p>
          </div>
        </div>
>>>>>>> 2471f6c48a55d40216017bf626f34df3290ed4b9
      </div>
    </div>
  );
};

export default GameDetails; 