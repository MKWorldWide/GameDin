import React, { useState } from 'react';

/**
 * PreferencesStep - Onboarding step for selecting user preferences
 * Includes favorite genres, platforms, and notification settings
 * Fully accessible, mobile-first, and quantum-documented
 */
const GENRES = ['Action', 'Adventure', 'RPG', 'Shooter', 'Strategy', 'Sports', 'Puzzle', 'Simulation'];
const PLATFORMS = ['PC', 'PlayStation', 'Xbox', 'Switch', 'Mobile'];

const PreferencesStep: React.FC<{
  onNext: () => void;
  onBack: () => void;
  initialPreferences?: {
    genres?: string[];
    platforms?: string[];
    notifications?: boolean;
  };
}> = ({ onNext, onBack, initialPreferences }) => {
  const [genres, setGenres] = useState<string[]>(initialPreferences?.genres || []);
  const [platforms, setPlatforms] = useState<string[]>(initialPreferences?.platforms || []);
  const [notifications, setNotifications] = useState<boolean>(initialPreferences?.notifications ?? true);

  const handleGenreToggle = (genre: string) => {
    setGenres((prev) => prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]);
  };
  const handlePlatformToggle = (platform: string) => {
    setPlatforms((prev) => prev.includes(platform) ? prev.filter(p => p !== platform) : [...prev, platform]);
  };

  return (
    <form
      className="max-w-md mx-auto flex flex-col gap-6 p-6"
      aria-label="Preferences setup form"
      onSubmit={e => {
        e.preventDefault();
        onNext();
      }}
    >
      <h2 className="text-2xl font-bold text-blue-700 mb-2">Your Preferences</h2>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Favorite Genres</label>
        <div className="flex flex-wrap gap-2">
          {GENRES.map(genre => (
            <button
              key={genre}
              type="button"
              onClick={() => handleGenreToggle(genre)}
              className={`px-3 py-1 rounded-full border ${genres.includes(genre) ? 'bg-blue-600 text-white border-blue-700' : 'bg-gray-100 text-gray-700 border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-400`}
              aria-pressed={genres.includes(genre)}
              aria-label={genre}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Platforms</label>
        <div className="flex flex-wrap gap-2">
          {PLATFORMS.map(platform => (
            <button
              key={platform}
              type="button"
              onClick={() => handlePlatformToggle(platform)}
              className={`px-3 py-1 rounded-full border ${platforms.includes(platform) ? 'bg-purple-600 text-white border-purple-700' : 'bg-gray-100 text-gray-700 border-gray-300'} focus:outline-none focus:ring-2 focus:ring-purple-400`}
              aria-pressed={platforms.includes(platform)}
              aria-label={platform}
            >
              {platform}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input
          id="notifications"
          type="checkbox"
          checked={notifications}
          onChange={e => setNotifications(e.target.checked)}
          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-400"
          aria-checked={notifications}
        />
        <label htmlFor="notifications" className="text-sm text-gray-700">
          Enable notifications for new games, events, and rewards
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

export default PreferencesStep;
