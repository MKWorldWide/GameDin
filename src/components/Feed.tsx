<<<<<<< HEAD
import React, { useState, useEffect, useCallback, memo } from 'react';
import { useInView } from 'react-intersection-observer';
import { websocketService, WebSocketMessage } from '../services/websocket';
import useStore from '../store/useStore';
import { IActivity } from '../types/social';

const Feed: React.FC = () => {
  const [activities, setActivities] = useState<IActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const { ref, inView } = useInView();
  const user = useStore(state => state.user);

  const fetchActivities = useCallback(async (reset = false) => {
    if (loading || (!hasMore && !reset)) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/activities?page=${reset ? 1 : page}&limit=10`);
      const data = await response.json();

      setActivities(prev => (reset ? data.activities : [...prev, ...data.activities]));
      setHasMore(data.hasMore);
      setPage(prev => (reset ? 2 : prev + 1));
      setError(null);
    } catch (err) {
      setError('Failed to load activities');
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, page]);

  useEffect(() => {
    if (inView && hasMore && !loading) {
      fetchActivities();
    }
  }, [inView, hasMore, loading, fetchActivities]);

  useEffect(() => {
    if (!user) return;

    const handleActivityUpdate = (message: WebSocketMessage) => {
      if (message.type === 'ACTIVITY_CREATE') {
        setActivities(prev => [message.data.activity!, ...prev]);
      } else if (message.type === 'ACTIVITY_UPDATE') {
        setActivities(prev =>
          prev.map(activity =>
            activity.id === message.data.activity!.id
              ? { ...activity, ...message.data.activity }
              : activity
          )
        );
      } else if (message.type === 'ACTIVITY_DELETE') {
        setActivities(prev => prev.filter(activity => activity.id !== message.data.activityId));
      }
    };

    const unsubscribeHandlers = [
      websocketService.subscribe('ACTIVITY_CREATE', handleActivityUpdate),
      websocketService.subscribe('ACTIVITY_UPDATE', handleActivityUpdate),
      websocketService.subscribe('ACTIVITY_DELETE', handleActivityUpdate),
    ];

    return () => {
      unsubscribeHandlers.forEach(unsubscribe => unsubscribe());
    };
  }, [user]);

  const handleLike = async (activityId: string) => {
    if (!user) return;

    try {
      await fetch(`/api/activities/${activityId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      setActivities(prev =>
        prev.map(activity =>
          activity.id === activityId
            ? { ...activity, likes: activity.likes + 1, isLiked: true }
            : activity
        )
      );
    } catch (error) {
      console.error('Failed to like activity:', error);
    }
  };

  const handleComment = async (activityId: string, comment: string) => {
    if (!user || !comment.trim()) return;

    try {
      const response = await fetch(`/api/activities/${activityId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: comment }),
      });

      const newComment = await response.json();

      setActivities(prev =>
        prev.map(activity =>
          activity.id === activityId
            ? { ...activity, comments: [...activity.comments, newComment] }
            : activity
        )
      );
    } catch (error) {
      console.error('Failed to post comment:', error);
    }
  };

  if (error) {
    return (
      <div className="alert alert-error">
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity, index) => (
        <div
          key={activity.id}
          ref={index === activities.length - 1 ? ref : undefined}
          className="card bg-base-100 shadow-xl"
        >
          <div className="card-body">
            <div className="flex items-center space-x-4">
              <div className="avatar">
                <div className="w-12 h-12 rounded-full">
                  <img src={activity.user.avatar} alt={activity.user.username} />
                </div>
              </div>
              <div>
                <h3 className="font-bold">{activity.user.username}</h3>
                <time className="text-sm opacity-60">{activity.createdAt}</time>
              </div>
            </div>

            <p className="py-4">{activity.content}</p>

            {activity.media && (
              <div className="rounded-lg overflow-hidden">
                {activity.media.type === 'image' ? (
                  <img src={activity.media.url || activity.media.preview} alt="Activity media" className="w-full" />
                ) : (
                  <video src={activity.media.url || activity.media.preview} controls className="w-full" />
                )}
              </div>
            )}

            <div className="flex items-center space-x-4 mt-4">
              <button
                className={`btn btn-ghost gap-2 ${activity.isLiked ? 'text-primary' : ''}`}
                onClick={() => handleLike(activity.id)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                {activity.likes} Likes
              </button>
              <button className="btn btn-ghost gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                {activity.comments.length} Comments
              </button>
            </div>
          </div>
        </div>
      ))}

      {loading && (
        <div className="flex justify-center p-4">
          <div className="loading loading-spinner loading-lg"></div>
        </div>
      )}

      {!hasMore && activities.length > 0 && (
        <div className="text-center text-gray-500 py-4">No more activities to load</div>
      )}

      {!loading && activities.length === 0 && (
        <div className="text-center text-gray-500 py-4">No activities yet</div>
      )}
=======
import { Box, Typography, Paper, Grid } from '@mui/material';
import PostEditor from './post/PostEditor';
import { useUser } from '../hooks/useUser';
import { IUser } from '../types/social';

interface Activity {
  id: string;
  user: IUser;
  type: 'game_won' | 'achievement' | 'friend_added' | 'level_up';
  content: string;
  timestamp: string;
}

interface FeedProps {
  activities: Activity[];
}

export const Feed = ({ activities }: FeedProps) => {
  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'game_won':
        return '🏆';
      case 'achievement':
        return '🌟';
      case 'friend_added':
        return '👥';
      case 'level_up':
        return '⬆️';
      default:
        return '📢';
    }
  };

  return (
    <div className="feed">
      <h2>Activity Feed</h2>
      <div className="activity-list">
        {activities.map((activity) => (
          <div key={activity.id} className="activity-item">
            <div className="activity-icon">
              {getActivityIcon(activity.type)}
            </div>
            <div className="activity-content">
              <div className="activity-header">
                <div className="user-info">
                  <img
                    src={activity.user.picture || activity.user.avatar}
                    alt={activity.user.username}
                    className="user-avatar"
                  />
                  <span className="username">{activity.user.name || activity.user.username}</span>
                </div>
                <span className="timestamp">
                  {new Date(activity.timestamp).toLocaleString()}
                </span>
              </div>
              <p className="activity-text">{activity.content}</p>
            </div>
          </div>
        ))}
      </div>
>>>>>>> 2471f6c48a55d40216017bf626f34df3290ed4b9
    </div>
  );
};

<<<<<<< HEAD
export default memo(Feed);
=======
export default function Feed() {
  const { user } = useUser();

  if (!user) {
    return (
      <Box sx={{ p: 4 }}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6">
            Please sign in to view your feed
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <PostEditor onSubmit={async (content) => {
            // TODO: Implement post submission
            console.log('New post:', content);
          }} />
        </Grid>
        <Grid item xs={12}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              No posts yet
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Start following other gamers or create your first post!
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
} 
>>>>>>> 2471f6c48a55d40216017bf626f34df3290ed4b9
