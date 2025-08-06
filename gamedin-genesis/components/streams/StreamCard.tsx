
import React from 'react';
import { Stream } from '../../types';

interface StreamCardProps {
  stream: Stream;
}

const StreamCard: React.FC<StreamCardProps> = ({ stream }) => {
  return (
    <a href={`#/stream/${stream.id}`} className="block group animate-fade-in">
        <div className="relative aspect-video rounded-lg overflow-hidden border-2 border-primary group-hover:border-accent transition-colors">
            <img src={stream.thumbnailUrl} alt={stream.title} className="w-full h-full object-cover"/>
            <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold uppercase px-2 py-1 rounded">LIVE</div>
            <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs font-semibold px-2 py-1 rounded">{stream.viewers.toLocaleString()} viewers</div>
        </div>
        <div className="mt-2 flex gap-3 items-start">
            <img src={stream.streamerAvatar} alt={stream.streamerName} className="w-10 h-10 rounded-full border-2 border-secondary" />
            <div>
                <h3 className="font-semibold text-primary group-hover:text-accent transition-colors truncate">{stream.title}</h3>
                <p className="text-sm text-secondary">{stream.streamerName}</p>
                <p className="text-sm text-tertiary">{stream.game}</p>
            </div>
        </div>
    </a>
  );
};

export default StreamCard;
