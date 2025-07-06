import { useState } from 'react';

import useStore from '../store/useStore';
import type { IUser, IUserProfile } from '../types/social';

/**
 * Profile Page Component
 *
 * Features:
 * - Galaxy-themed user profile
 * - Glassmorphism card for profile info
 * - Responsive layout
 * - Edit mode for name and bio
 */
export default function Profile() {
  const user = useStore((state) => state.user);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<IUserProfile>({
    name: user?.name || '',
    bio: user?.bio || '',
    picture: user?.picture || '/default-avatar.png',
  });

  const handleEdit = () => setIsEditing(true);
  const handleCancel = () => {
    setIsEditing(false);
    setProfile({
      name: user?.name || '',
      bio: user?.bio || '',
      picture: user?.picture || '/default-avatar.png',
    });
  };

  const handleSave = async() => {
    // TODO: Implement save functionality
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-text-secondary">Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-cosmic-glass backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-glass">
          <div className="flex items-center space-x-6 mb-8">
            <img
              src={user.picture || '/default-avatar.png'}
              alt={`${user.name || user.username}'s profile`}
              className="w-24 h-24 rounded-full object-cover border-4 border-primary-400 shadow-star"
            />
            <div className="flex-1">
              {isEditing ? (
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md bg-cosmic-glass/50 border-white/10 text-text-primary font-sf-pro text-2xl font-bold"
                  aria-label="Edit name"
                />
              ) : (
                <h1 className="text-3xl font-sf-pro font-bold text-text-primary bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
                  {user.name || user.username}
                </h1>
              )}
              <div className="mt-2 text-sm text-text-secondary">
                {user.email && <div>{user.email}</div>}
                {user.rank && (
                  <span className="mr-4">
                    Rank: {user.rank} • Level {user.level}
                  </span>
                )}
                <span>Member since {new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-lg font-semibold text-text-primary mb-2">Bio</h2>
            {isEditing ? (
              <textarea
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                className="w-full px-3 py-2 border rounded-md bg-cosmic-glass/50 border-white/10 text-text-primary"
                rows={4}
                aria-label="Edit bio"
              />
            ) : (
              <p className="text-text-secondary">{user.bio || 'No bio yet.'}</p>
            )}
          </div>

          <div className="flex justify-end space-x-3">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-sm font-medium text-text-secondary bg-cosmic-glass border border-white/10 rounded-xl hover:bg-cosmic-glass/70 transition-all"
                  aria-label="Cancel editing"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl hover:shadow-glow transition-all"
                  aria-label="Save profile changes"
                >
                  Save
                </button>
              </>
            ) : (
              <button
                onClick={handleEdit}
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl hover:shadow-glow transition-all"
                aria-label="Edit profile"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
