import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../lib/api/axios';

const MutualFriends = ({ userId }) => {
  const { data: mutualFriends, isLoading } = useQuery({
    queryKey: ['mutualFriends', userId],
    queryFn: async () => {
      const { data } = await api.get(`/users/${userId}/mutual-friends`);
      return data;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  if (isLoading) {
    return (
      <div className="card bg-base-100 shadow-xl mt-4">
        <div className="card-body">
          <h3 className="card-title">Mutual Friends</h3>
          <div className="flex justify-center">
            <div className="loading loading-spinner loading-md"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!mutualFriends?.length) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card bg-base-100 shadow-xl mt-4"
    >
      <div className="card-body">
        <h3 className="card-title">
          Mutual Friends
          <span className="badge badge-primary">{mutualFriends.length}</span>
        </h3>

        <div className="space-y-3">
          {mutualFriends.map((friend, index) => (
            <motion.div
              key={friend.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3 hover:bg-base-200 p-2 rounded-lg transition-colors"
            >
              <Link to={`/profile/${friend.id}`} className="flex items-center gap-3 flex-1">
                <div className="avatar">
                  <div className="w-10 h-10 rounded-full">
                    <img src={friend.avatar} alt={friend.username} />
                  </div>
                </div>
                <div>
                  <div className="font-semibold">{friend.username}</div>
                  <div className="text-xs opacity-70">
                    {friend.mutualGames?.length
                      ? `${friend.mutualGames.length} games in common`
                      : 'No mutual games'}
                  </div>
                </div>
              </Link>

              {friend.isOnline && <div className="badge badge-success badge-sm">Online</div>}
            </motion.div>
          ))}
        </div>

        {mutualFriends.length > 5 && (
          <button className="btn btn-ghost btn-sm mt-2">View All ({mutualFriends.length})</button>
        )}
      </div>
    </motion.div>
  );
};

export default MutualFriends;
