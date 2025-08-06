import React from 'react';
import { MOCK_STREAMS } from '../constants';
import StreamCard from '../components/streams/StreamCard';

const LivePage: React.FC = () => {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-primary tracking-tight">Live Channels</h1>
        <p className="text-secondary mt-1">Watch your favorite gamers play now.</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_STREAMS.map(stream => (
          <StreamCard key={stream.id} stream={stream} />
        ))}
      </div>
      
       {MOCK_STREAMS.length === 0 && (
          <div className="text-center py-12 text-secondary bg-secondary/50 rounded-lg col-span-full">
              <h3 className="text-xl font-semibold">No one is live right now</h3>
              <p className="mt-2">Check back later to see who's streaming!</p>
          </div>
       )}
    </div>
  );
};

export default LivePage;