
import React, { useState } from 'react';
import { Post } from '../types';
import { HeartIcon, ChatBubbleIcon, ArrowPathIcon } from './Icons';

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);

  const handleLike = () => {
    setIsLiked(prev => !prev);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  return (
    <article className="bg-secondary p-4 rounded-lg shadow-lg border border-primary hover:border-accent transition-all duration-300 flex flex-col gap-4 animate-fade-in">
      {post.lfg && (
        <div className="bg-tertiary/50 border border-secondary rounded-md p-2 -mb-2">
            <p className="text-xs font-bold uppercase text-accent tracking-wider">Looking for Group</p>
            <div className="flex items-center gap-4 text-sm mt-1">
                <p><span className="font-semibold">Game:</span> {post.lfg.game}</p>
                <p><span className="font-semibold">Skill:</span> {post.lfg.skillLevel}</p>
            </div>
        </div>
      )}
      <div className="flex items-start gap-4">
        <img src={post.avatarUrl} alt={`${post.author}'s avatar`} className="w-12 h-12 rounded-full border-2 border-tertiary" />
        <div className="flex-1">
          <div className="flex items-baseline gap-2">
            <p className="font-bold text-primary">{post.author}</p>
            <p className="text-sm text-secondary">{post.handle}</p>
            <p className="text-sm text-tertiary">· {post.timestamp}</p>
          </div>
          <div className="mt-1 text-primary whitespace-pre-wrap">
            {post.content}
          </div>
        </div>
      </div>
      <div className="flex justify-around items-center pt-3 border-t border-secondary/50">
        <button className="flex items-center gap-2 text-secondary hover:text-accent transition-colors group" aria-label={`Comment on ${post.author}'s post`}>
          <ChatBubbleIcon className="w-5 h-5" />
          <span className="text-sm font-medium">{post.commentsCount}</span>
        </button>
        <button className="flex items-center gap-2 text-secondary hover:text-accent transition-colors group" aria-label={`Share ${post.author}'s post`}>
          <ArrowPathIcon className="w-5 h-5" />
          <span className="text-sm font-medium">{post.sharesCount}</span>
        </button>
        <button 
            onClick={handleLike}
            className={`flex items-center gap-2 transition-colors group ${isLiked ? 'text-accent' : 'text-secondary hover:text-accent'}`} 
            aria-label={`Like ${post.author}'s post`}
            aria-pressed={isLiked}
        >
          <HeartIcon className="w-5 h-5" />
          <span className="text-sm font-medium">{likeCount}</span>
        </button>
      </div>
    </article>
  );
};

export default PostCard;