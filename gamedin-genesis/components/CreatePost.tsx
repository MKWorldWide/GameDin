

import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Post, NetworkProvider } from '../types';
import { TwitterIcon } from './Icons';
import { postToNetwork } from '../services/nexus';

interface CreatePostProps {
  onNewPost: (post: Post) => void;
}

const CreatePost: React.FC<CreatePostProps> = ({ onNewPost }) => {
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState<'standard' | 'lfg'>('standard');
  const [lfgGame, setLfgGame] = useState('');
  const [lfgSkill, setLfgSkill] = useState('');
  const { user, showToast } = useAuth();
  const [syndicateTo, setSyndicateTo] = useState<Set<NetworkProvider>>(new Set());

  const toggleSyndication = (provider: NetworkProvider) => {
    setSyndicateTo(prev => {
        const newSet = new Set(prev);
        if (newSet.has(provider)) {
            newSet.delete(provider);
        } else {
            newSet.add(provider);
        }
        return newSet;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !user) return;
    
    if (postType === 'lfg' && (!lfgGame.trim() || !lfgSkill.trim())) {
      // Basic validation for LFG fields
      return;
    }

    const newPost: Post = {
      id: `post_${Date.now()}`,
      authorHandle: user.handle,
      authorName: user.name,
      authorAvatarUrl: user.avatarUrl,
      content,
      timestamp: new Date().toISOString(),
      likes: 0,
      commentsCount: 0,
      sharesCount: 0,
      ...(postType === 'lfg' && { lfg: { game: lfgGame, skillLevel: lfgSkill } }),
    };

    onNewPost(newPost);

    // Syndicate to selected networks
    if (syndicateTo.size > 0) {
        syndicateTo.forEach(provider => {
            postToNetwork(provider, content);
        });
        showToast(`Decree syndicated to ${[...syndicateTo].join(', ')}!`);
    }

    setContent('');
    setLfgGame('');
    setLfgSkill('');
    setPostType('standard');
    setSyndicateTo(new Set());
  };

  if (!user) return null;
  
  const socialAccounts = user.linkedAccounts.filter(acc => acc.provider === 'twitter');

  return (
    <section className="p-4 bg-secondary rounded-lg border border-primary shadow-lg">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex items-start gap-4">
          <img src={user.avatarUrl} alt="Your avatar" className="w-12 h-12 rounded-full border-2 border-secondary" />
          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={postType === 'lfg' ? "Seek allies for your quest, declare the trial and your required skill..." : "Share your wisdom or decrees..."}
              className="block w-full rounded-md border-0 bg-tertiary py-2.5 px-3 text-primary ring-1 ring-inset ring-border-primary placeholder:text-tertiary focus:ring-2 focus:ring-inset focus:ring-accent sm:text-sm resize-none transition"
              rows={3}
              required
            />
          </div>
        </div>
        
        {postType === 'lfg' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-16 animate-fade-in">
                 <input type="text" value={lfgGame} onChange={e => setLfgGame(e.target.value)} placeholder="Trial Name (Game)" required className="block w-full rounded-md border-0 bg-tertiary py-2 px-3 text-primary ring-1 ring-inset ring-border-primary placeholder:text-tertiary focus:ring-2 focus:ring-inset focus:ring-accent sm:text-sm"/>
                 <input type="text" value={lfgSkill} onChange={e => setLfgSkill(e.target.value)} placeholder="Required Power (e.g., Mythic, Divine)" required className="block w-full rounded-md border-0 bg-tertiary py-2 px-3 text-primary ring-1 ring-inset ring-border-primary placeholder:text-tertiary focus:ring-2 focus:ring-inset focus:ring-accent sm:text-sm"/>
            </div>
        )}
        
        {socialAccounts.length > 0 && (
            <div className="pl-16 pt-2 border-t border-primary/50">
                <p className="text-xs font-semibold text-secondary mb-2">Syndicate Decree:</p>
                <div className="flex gap-2">
                    {socialAccounts.map(acc => (
                         <button
                            key={acc.provider}
                            type="button"
                            onClick={() => toggleSyndication(acc.provider)}
                            className={`p-2 rounded-full transition-colors ${syndicateTo.has(acc.provider) ? 'bg-accent text-on-accent' : 'bg-tertiary text-secondary hover:bg-border-primary'}`}
                            aria-pressed={syndicateTo.has(acc.provider)}
                            title={`Post to ${acc.provider}`}
                         >
                             <TwitterIcon className="w-5 h-5" />
                         </button>
                    ))}
                </div>
            </div>
        )}

        <div className="flex justify-between items-center pl-16 pt-4 border-t border-primary">
            <div className="flex gap-2">
                 <button type="button" onClick={() => setPostType('standard')} className={`px-3 py-1 text-xs font-semibold rounded-full ${postType === 'standard' ? 'bg-accent text-on-accent' : 'bg-tertiary text-secondary'}`}>Decree</button>
                 <button type="button" onClick={() => setPostType('lfg')} className={`px-3 py-1 text-xs font-semibold rounded-full ${postType === 'lfg' ? 'bg-accent text-on-accent' : 'bg-tertiary text-secondary'}`}>Call to Arms</button>
            </div>
            <button
              type="submit"
              disabled={!content.trim()}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-on-accent shadow-sm hover:bg-accent-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Proclaim
            </button>
        </div>
      </form>
    </section>
  );
};

export default CreatePost;