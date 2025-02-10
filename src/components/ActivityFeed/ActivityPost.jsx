import { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const ActivityPost = ({ activity, onLike, onComment, currentUser }) => {
  const [comment, setComment] = useState('');
  const [isCommenting, setIsCommenting] = useState(false);

  const handleLike = async () => {
    if (!currentUser) return;
    try {
      await onLike(activity.id);
    } catch (error) {
      console.error('Failed to like activity:', error);
    }
  };

  const handleComment = async e => {
    e.preventDefault();
    if (!comment.trim() || !currentUser) return;

    try {
      await onComment(activity.id, comment);
      setComment('');
      setIsCommenting(false);
    } catch (error) {
      console.error('Failed to post comment:', error);
    }
  };

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Link to={`/profile/${activity.user.id}`} className="flex items-center space-x-3">
            <div className="avatar">
              <div className="w-10 h-10 rounded-full">
                <img src={activity.user.avatar} alt={activity.user.username} />
              </div>
            </div>
            <div>
              <h3 className="font-bold">{activity.user.username}</h3>
              <time className="text-sm opacity-60">
                {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
              </time>
            </div>
          </Link>
        </div>

        {/* Content */}
        <p className="py-4">{activity.content}</p>

        {/* Media */}
        {activity.media && (
          <div className="rounded-lg overflow-hidden">
            {activity.media.type === 'image' ? (
              <img src={activity.media.url} alt="Post media" className="w-full" />
            ) : activity.media.type === 'video' ? (
              <video src={activity.media.url} controls className="w-full" />
            ) : null}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center space-x-4 mt-4">
          <button
            className={`btn btn-ghost gap-2 ${activity.isLiked ? 'text-primary' : ''}`}
            onClick={handleLike}
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
          <button className="btn btn-ghost gap-2" onClick={() => setIsCommenting(!isCommenting)}>
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

        {/* Comments Section */}
        {isCommenting && (
          <div className="mt-4 space-y-4">
            <form onSubmit={handleComment} className="flex gap-2">
              <input
                type="text"
                placeholder="Write a comment..."
                className="input input-bordered flex-1"
                value={comment}
                onChange={e => setComment(e.target.value)}
              />
              <button type="submit" className="btn btn-primary">
                Post
              </button>
            </form>

            <div className="space-y-2">
              {activity.comments.map(comment => (
                <div key={comment.id} className="bg-base-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <Link to={`/profile/${comment.user.id}`} className="font-bold">
                      {comment.user.username}
                    </Link>
                    <span className="text-sm opacity-60">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="mt-1">{comment.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityPost;
