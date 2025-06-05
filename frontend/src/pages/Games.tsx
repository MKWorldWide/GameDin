import React from 'react';

const Games: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Games</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Game cards will be rendered here */}
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Loading games...</h2>
        </div>
      </div>
    </div>
  );
};

export default Games; 