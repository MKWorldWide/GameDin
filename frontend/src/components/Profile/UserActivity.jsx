import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../lib/api/axios';
import ActivityPost from '../ActivityFeed/ActivityPost';

const UserActivity = ({ userId }) => {
  const { ref, inView } = useInView();

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ['userActivity', userId],
      queryFn: async ({ pageParam = 1 }) => {
        const { data } = await api.get(`/users/${userId}/activities`, {
          params: { page: pageParam, limit: 10 },
        });
        return data;
      },
      getNextPageParam: lastPage => lastPage.nextPage || undefined,
      staleTime: 1000 * 60 * 2, // Cache for 2 minutes
    });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleLike = async activityId => {
    await api.post(`/activities/${activityId}/like`);
  };

  const handleComment = async (activityId, content) => {
    await api.post(`/activities/${activityId}/comments`, { content });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="alert alert-error">
        <span>Error loading activities. Please try again later.</span>
      </div>
    );
  }

  const activities = data?.pages.flatMap(page => page.activities) || [];

  if (activities.length === 0) {
    return (
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body text-center">
          <h3 className="text-lg font-semibold">No Activity Yet</h3>
          <p className="text-sm opacity-70">This user hasn't posted anything yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AnimatePresence mode="popLayout">
        {activities.map((activity, index) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: index * 0.1 }}
          >
            <ActivityPost activity={activity} onLike={handleLike} onComment={handleComment} />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Loading indicator for next page */}
      <div ref={ref} className="py-4">
        {isFetchingNextPage && (
          <div className="flex justify-center">
            <div className="loading loading-spinner loading-md"></div>
          </div>
        )}
      </div>

      {/* End of content indicator */}
      {!hasNextPage && activities.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-4 text-sm opacity-70"
        >
          No more activities to load
        </motion.div>
      )}
    </div>
  );
};

export default UserActivity;
