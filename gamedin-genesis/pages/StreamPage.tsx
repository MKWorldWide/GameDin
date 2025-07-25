
import React from 'react';
import { MOCK_STREAMS } from '../constants';
import LoadingSpinner from '../components/LoadingSpinner';
import { HeartIcon, UserPlusIcon } from '../components/Icons';

interface StreamPageProps {
  streamId: string;
}

const StreamPage: React.FC<StreamPageProps> = ({ streamId }) => {
  const stream = MOCK_STREAMS.find(s => s.id === streamId);

  if (!stream) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">Stream not found</h2>
        <p className="text-secondary mt-2">The stream you're looking for doesn't exist or has ended.</p>
        <a href="#/live" className="mt-4 inline-block text-accent hover:underline">Back to Live Channels</a>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-6rem)] -my-4">
      {/* Main Stream Content */}
      <div className="flex-grow flex flex-col">
        <div className="aspect-video bg-black rounded-lg border border-primary flex items-center justify-center text-secondary">
          <p>Video Player Placeholder</p>
        </div>
        <div className="p-4 bg-secondary mt-4 rounded-lg border border-primary">
            <h1 className="text-2xl font-bold text-primary">{stream.title}</h1>
            <div className="flex items-center gap-4 mt-2">
                <img src={stream.streamerAvatar} alt={stream.streamerName} className="w-12 h-12 rounded-full border-2 border-tertiary" />
                <div>
                    <p className="font-semibold text-primary">{stream.streamerName}</p>
                    <p className="text-sm text-accent">{stream.game}</p>
                </div>
                <div className="flex-grow flex justify-end gap-2">
                     <button className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold bg-accent text-on-accent hover:bg-accent-hover transition-colors">
                        <UserPlusIcon className="w-4 h-4"/>
                        <span>Follow</span>
                    </button>
                    <button className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold bg-tertiary text-primary hover:bg-border-primary transition-colors">
                        <HeartIcon className="w-4 h-4"/>
                        <span>Subscribe</span>
                    </button>
                </div>
            </div>
        </div>
      </div>

      {/* Chat Column */}
      <div className="w-full lg:w-80 flex-shrink-0 bg-secondary rounded-lg border border-primary flex flex-col">
        <div className="p-3 border-b border-primary">
            <h2 className="font-bold text-center">Stream Chat</h2>
        </div>
        <div className="flex-grow p-4 space-y-3 overflow-y-auto">
             {/* Chat messages would go here */}
            <p className="text-xs text-secondary"><span className="font-bold text-pink-400">@daisy_plays:</span> Welcome everyone! So glad you could make it to the stream today! Let's get some wins. 🏆</p>
            <p className="text-xs text-secondary"><span className="font-bold text-sky-400">@gamer123:</span> Let's go Daisy!</p>
            <p className="text-xs text-secondary"><span className="font-bold text-green-400">@pro_racer:</span> That last turn was sick!!</p>
        </div>
        <div className="p-3 border-t border-primary">
             <input type="text" placeholder="Send a message" className="w-full rounded-md border-0 bg-tertiary py-2 px-3 text-primary ring-1 ring-inset ring-border-primary placeholder:text-tertiary focus:ring-2 focus:ring-inset focus:ring-accent sm:text-sm"/>
        </div>
      </div>
    </div>
  );
};

export default StreamPage;
