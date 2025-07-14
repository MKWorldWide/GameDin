import React, { useState } from 'react';

/**
 * SocialConnectStep - Onboarding step for inviting friends, joining groups, and connecting socials
 * Fully accessible, mobile-first, and quantum-documented
 */
const SOCIALS = [
  { name: 'Discord', icon: '💬' },
  { name: 'Twitter', icon: '🐦' },
  { name: 'Twitch', icon: '🎥' },
  { name: 'Steam', icon: '🎮' },
];

const SocialConnectStep: React.FC<{ onNext: () => void; onBack: () => void }> = ({ onNext, onBack }) => {
  const [invites, setInvites] = useState<string>('');
  const [selectedSocials, setSelectedSocials] = useState<string[]>([]);
  const [joinGroup, setJoinGroup] = useState(false);

  const handleSocialToggle = (name: string) => {
    setSelectedSocials(prev => prev.includes(name) ? prev.filter(s => s !== name) : [...prev, name]);
  };

  return (
    <form
      className="max-w-md mx-auto flex flex-col gap-6 p-6"
      aria-label="Social connect form"
      onSubmit={e => {
        e.preventDefault();
        onNext();
      }}
    >
      <h2 className="text-2xl font-bold text-blue-700 mb-2">Connect & Invite</h2>
      <div>
        <label htmlFor="invite-emails" className="block text-sm font-medium text-gray-700 mb-1">
          Invite friends (email, comma separated)
        </label>
        <input
          id="invite-emails"
          type="text"
          value={invites}
          onChange={e => setInvites(e.target.value)}
          placeholder="friend1@email.com, friend2@email.com"
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          aria-label="Invite friends by email"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Connect your socials</label>
        <div className="flex flex-wrap gap-2">
          {SOCIALS.map(social => (
            <button
              key={social.name}
              type="button"
              onClick={() => handleSocialToggle(social.name)}
              className={`px-3 py-1 rounded-full border ${selectedSocials.includes(social.name) ? 'bg-blue-600 text-white border-blue-700' : 'bg-gray-100 text-gray-700 border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-400`}
              aria-pressed={selectedSocials.includes(social.name)}
              aria-label={social.name}
            >
              <span className="mr-1">{social.icon}</span>{social.name}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input
          id="join-group"
          type="checkbox"
          checked={joinGroup}
          onChange={e => setJoinGroup(e.target.checked)}
          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-400"
          aria-checked={joinGroup}
        />
        <label htmlFor="join-group" className="text-sm text-gray-700">
          Join a recommended group or clan
        </label>
      </div>
      <div className="flex justify-between mt-4">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          Back
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          Next
        </button>
      </div>
    </form>
  );
};

export default SocialConnectStep;
