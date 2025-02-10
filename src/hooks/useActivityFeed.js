import { useState, useCallback } from 'react';
import api from '../lib/api/axios';

export const useActivityFeed = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const fetchActivities = useCallback(
    async (reset = false) => {
      if (loading || (!hasMore && !reset)) return;

      try {
        setLoading(true);
        setError(null);
        const currentPage = reset ? 1 : page;
        const { data } = await api.get(`/activities?page=${currentPage}&limit=10`);

        setActivities(prev => (reset ? data.activities : [...prev, ...data.activities]));
        setHasMore(data.hasMore);
        setPage(prev => (reset ? 2 : prev + 1));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [loading, hasMore, page]
  );

  const createActivity = useCallback(async content => {
    try {
      const { data } = await api.post('/activities', { content });
      setActivities(prev => [data, ...prev]);
      return data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to create activity');
    }
  }, []);

  const likeActivity = useCallback(async activityId => {
    try {
      await api.post(`/activities/${activityId}/like`);
      setActivities(prev =>
        prev.map(activity =>
          activity.id === activityId
            ? { ...activity, likes: activity.likes + 1, isLiked: true }
            : activity
        )
      );
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to like activity');
    }
  }, []);

  const commentOnActivity = useCallback(async (activityId, content) => {
    try {
      const { data } = await api.post(`/activities/${activityId}/comments`, { content });
      setActivities(prev =>
        prev.map(activity =>
          activity.id === activityId
            ? { ...activity, comments: [...activity.comments, data] }
            : activity
        )
      );
      return data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to comment on activity');
    }
  }, []);

  return {
    activities,
    loading,
    error,
    hasMore,
    fetchActivities,
    createActivity,
    likeActivity,
    commentOnActivity,
  };
};
