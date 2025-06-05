import { motion } from 'framer-motion';

const AchievementCard = ({ achievement }) => {
  const getRarityColor = rarity => {
    switch (rarity.toLowerCase()) {
      case 'common':
        return 'bg-gray-500';
      case 'uncommon':
        return 'bg-green-500';
      case 'rare':
        return 'bg-blue-500';
      case 'epic':
        return 'bg-purple-500';
      case 'legendary':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="card bg-base-200 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="card-body p-4">
        <div className="flex items-center gap-4">
          <div className="avatar">
            <div className={`w-12 h-12 rounded-lg ${getRarityColor(achievement.rarity)} p-2`}>
              <img
                src={achievement.icon}
                alt={achievement.name}
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          <div className="flex-1">
            <h4 className="font-bold">{achievement.name}</h4>
            <p className="text-sm opacity-70">{achievement.description}</p>

            {achievement.progress && (
              <div className="mt-2">
                <div className="flex justify-between text-xs mb-1">
                  <span>
                    {achievement.progress.current} / {achievement.progress.required}
                  </span>
                  <span>
                    {Math.round(
                      (achievement.progress.current / achievement.progress.required) * 100
                    )}
                    %
                  </span>
                </div>
                <progress
                  className="progress progress-primary w-full"
                  value={achievement.progress.current}
                  max={achievement.progress.required}
                />
              </div>
            )}

            <div className="flex items-center gap-2 mt-2">
              <span className={`badge ${getRarityColor(achievement.rarity)} badge-sm`}>
                {achievement.rarity}
              </span>
              {achievement.game && (
                <span className="badge badge-outline badge-sm">{achievement.game}</span>
              )}
              {achievement.unlockedAt && (
                <span className="text-xs opacity-50">
                  Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AchievementCard;
