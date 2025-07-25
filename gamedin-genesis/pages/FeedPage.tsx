import React, { useState, useMemo } from 'react';
import SearchBar from '../components/SearchBar';
import PostCard from '../components/PostCard';
import OracleWidget from '../components/GeminiKitten';
import CreatePost from '../components/CreatePost';
import { MOCK_POSTS } from '../constants';
import { Post } from '../types';

const FeedPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);

  const handleNewPost = (newPost: Post) => {
    setPosts(prevPosts => [newPost, ...prevPosts]);
  };

  const filteredPosts = useMemo(() => {
    const lowercasedQuery = searchQuery.toLowerCase().trim();
    if (!lowercasedQuery) {
      return posts;
    }
    return posts.filter(post =>
      post.content.toLowerCase().includes(lowercasedQuery) ||
      post.author.toLowerCase().includes(lowercasedQuery) ||
      post.handle.toLowerCase().includes(lowercasedQuery)
    );
  }, [searchQuery, posts]);

  return (
    <div className="space-y-8">
      <SearchBar 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
          placeholder="Search the archives..." 
      />

      <CreatePost onNewPost={handleNewPost} />
      
      <section className="space-y-4">
        {filteredPosts.length > 0 ? (
          filteredPosts.map(post => <PostCard key={post.id} post={post} />)
        ) : (
          <div className="text-center py-12 text-secondary bg-secondary/50 rounded-lg">
              <h3 className="text-xl font-semibold">The ether is quiet</h3>
              <p className="mt-2">No decrees match your search. Be the first to speak.</p>
          </div>
        )}
      </section>

      <OracleWidget posts={posts} />

      <footer className="text-center p-4 text-tertiary text-sm">
        <p>Powered by The Oracle & Google AI. 👁️</p>
      </footer>
    </div>
  );
};

export default FeedPage;
