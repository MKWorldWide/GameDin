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
        <a href={`#/profile/${post.authorHandle}`}>
            <img src={post.authorAvatarUrl} alt={`${post.authorName}'s avatar`} className="w-12 h-12 rounded-full border-2 border-tertiary hover:border-accent transition-colors" />
        </a>
        <div className="flex-1">
          <div className="flex items-baseline gap-2">
            <a href={`#/profile/${post.authorHandle}`} className="font-bold text-primary hover:underline">{post.authorName}</a>
            <a href={`#/profile/${post.authorHandle}`} className="text-sm text-secondary hover:underline">@{post.authorHandle}</a>
            <p className="text-sm text-tertiary">· {new Date(post.timestamp).toLocaleString()}</p>
          </div>
          <div className="mt-1 text-primary whitespace-pre-wrap">
            {post.content}
          </div>
        </div>
      </div>
      <div className="flex justify-around items-center pt-3 border-t border-secondary/50">
        <button className="flex items-center gap-2 text-secondary hover:text-accent transition-colors group" aria-label={`Comment on ${post.authorName}'s post`}>
          <ChatBubbleIcon className="w-5 h-5" />
          <span className="text-sm font-medium">{post.commentsCount}</span>
        </button>
        <button className="flex items-center gap-2 text-secondary hover:text-accent transition-colors group" aria-label={`Share ${post.authorName}'s post`}>
          <ArrowPathIcon className="w-5 h-5" />
          <span className="text-sm font-medium">{post.sharesCount}</span>
        </button>
        <button 
            onClick={handleLike}
            className={`flex items-center gap-2 transition-colors group ${isLiked ? 'text-accent' : 'text-secondary hover:text-accent'}`} 
            aria-label={`Like ${post.authorName}'s post`}
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