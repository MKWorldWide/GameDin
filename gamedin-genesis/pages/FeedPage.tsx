import React, { useState, useMemo, useEffect } from 'react';
import SearchBar from '../components/SearchBar';
import PostCard from '../components/PostCard';
import OracleWidget from '../components/GeminiKitten';
import CreatePost from '../components/CreatePost';
import { Post } from '../types';
import * as db from '../services/database';

const FeedPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    // Initial load and listen for updates
    const loadPosts = () => setPosts(db.getPosts());
    loadPosts();

    // The 'storage' event listener is a robust way to sync between tabs,
    // but for a single-page app, we can simply re-fetch on certain actions.
    // For simplicity, we'll re-fetch when this component mounts.
    // A more advanced solution might use a global state management library.
  }, []);


  const handleNewPost = (newPost: Post) => {
    // Add to DB and then update state to reflect the change
    db.addPost(newPost);
    setPosts(db.getPosts());
  };

  const filteredPosts = useMemo(() => {
    const lowercasedQuery = searchQuery.toLowerCase().trim();
    if (!lowercasedQuery) {
      return posts;
    }
    return posts.filter(post =>
      post.content.toLowerCase().includes(lowercasedQuery) ||
      post.authorName.toLowerCase().includes(lowercasedQuery) ||
      post.authorHandle.toLowerCase().includes(lowercasedQuery)
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