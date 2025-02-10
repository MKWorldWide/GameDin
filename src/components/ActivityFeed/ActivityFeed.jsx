import { useEffect, useRef, useCallback } from 'react';
import { useActivityFeed } from '../../hooks/useActivityFeed';
import ActivityPost from './ActivityPost';
import CreatePost from './CreatePost';
import useStore from '../../store/useStore';

const ActivityFeed = () => {
  const {
    activities,
    loading,
    error,
    hasMore,
    fetchActivities,
    createActivity,
    likeActivity,
    commentOnActivity,
  } = useActivityFeed();

  const observer = useRef();
  const user = useStore(state => state.user);

  const lastActivityElementRef = useCallback(
    node => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && hasMore) {
          fetchActivities();
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore, fetchActivities]
  );

  useEffect(() => {
    fetchActivities(true);
  }, [fetchActivities]);

  if (error) {
    return (
      <div className="alert alert-error shadow-lg">
        <div>
          <span>Error loading activities. Please try again later.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {user && <CreatePost onPost={createActivity} />}

      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div
            key={activity.id}
            ref={index === activities.length - 1 ? lastActivityElementRef : null}
          >
            <ActivityPost
              activity={activity}
              onLike={likeActivity}
              onComment={commentOnActivity}
              currentUser={user}
            />
          </div>
        ))}
      </div>

      {loading && (
        <div className="flex justify-center p-4">
          <div className="loading loading-spinner loading-lg"></div>
        </div>
      )}

      {!hasMore && activities.length > 0 && (
        <div className="text-center text-gray-500 py-4">No more activities to load</div>
      )}

      {!loading && activities.length === 0 && (
        <div className="text-center text-gray-500 py-4">
          No activities yet. Be the first to post!
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;
