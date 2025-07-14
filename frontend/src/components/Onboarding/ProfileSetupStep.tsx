import React, { useState } from 'react';

/**
 * ProfileSetupStep - Onboarding step for setting up avatar, username, and bio
 * Fully accessible, mobile-first, and quantum-documented
 */
const ProfileSetupStep: React.FC<{
  onNext: () => void;
  onBack: () => void;
  initialProfile?: { avatar?: string; username?: string; bio?: string };
}> = ({ onNext, onBack, initialProfile }) => {
  const [avatar, setAvatar] = useState(initialProfile?.avatar || '');
  const [username, setUsername] = useState(initialProfile?.username || '');
  const [bio, setBio] = useState(initialProfile?.bio || '');

  return (
    <form
      className="max-w-md mx-auto flex flex-col gap-6 p-6"
      aria-label="Profile setup form"
      onSubmit={e => {
        e.preventDefault();
        onNext();
      }}
    >
      <h2 className="text-2xl font-bold text-blue-700 mb-2">Set Up Your Profile</h2>
      <div className="flex flex-col items-center gap-2">
        <label htmlFor="avatar-upload" className="block text-sm font-medium text-gray-700 mb-1">
          Avatar
        </label>
        <input
          id="avatar-upload"
          type="url"
          value={avatar}
          onChange={e => setAvatar(e.target.value)}
          placeholder="Paste image URL or upload"
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          aria-label="Avatar URL"
        />
        {/* TODO: Add image upload and preview */}
      </div>
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
          Username
        </label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
          minLength={3}
          maxLength={20}
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          aria-label="Username"
        />
      </div>
      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
          Bio
        </label>
        <textarea
          id="bio"
          value={bio}
          onChange={e => setBio(e.target.value)}
          rows={3}
          maxLength={160}
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          aria-label="Bio"
        />
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

export default ProfileSetupStep;
