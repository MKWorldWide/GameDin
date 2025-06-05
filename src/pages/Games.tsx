import React from 'react';

const Games: React.FC = () => {
  return (
<<<<<<< HEAD
    <div className="max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Games</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Game cards will be rendered here */}
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Loading games...</h2>
=======
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900">Games</h1>
        <div className="mt-6 grid gap-6 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1">
          {/* Game cards will be rendered here */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold">Loading games...</h2>
          </div>
>>>>>>> 2471f6c48a55d40216017bf626f34df3290ed4b9
        </div>
      </div>
    </div>
  );
};

export default Games; 