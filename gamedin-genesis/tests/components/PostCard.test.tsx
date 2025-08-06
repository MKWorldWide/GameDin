import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '../setup';
import PostCard from '../../components/PostCard';
import { Post } from '../../types';

const mockPost: Post = {
  id: 'post1',
  authorName: 'Mario',
  authorHandle: '@mario',
  authorAvatarUrl: 'https://i.pravatar.cc/150?u=mario',
  content: "It's-a me, Mario!",
  timestamp: new Date().toISOString(),
  likes: 125,
  commentsCount: 18,
  sharesCount: 5,
};

const mockLfgPost: Post = {
  ...mockPost,
  id: 'post2',
  lfg: {
    game: "Mario Kart 8 Deluxe",
    skillLevel: "Casual",
  },
};

describe('PostCard Component', () => {
  it('should render the basic post details correctly', () => {
    render(<PostCard post={mockPost} />);

    expect(screen.getByText('Mario')).toBeTruthy();
    expect(screen.getByText('@mario')).toBeTruthy();
    expect(screen.getByText("It's-a me, Mario!")).toBeTruthy();
    expect(screen.getByText('125')).toBeTruthy();
  });

  it('should render the LFG details when present', () => {
    render(<PostCard post={mockLfgPost} />);

    expect(screen.getByText('Looking for Group')).toBeTruthy();
    expect(screen.getByText('Mario Kart 8 Deluxe')).toBeTruthy();
    expect(screen.getByText('Casual')).toBeTruthy();
  });

  it('should not render LFG details when not present', () => {
    render(<PostCard post={mockPost} />);
    
    expect(screen.queryByText('Looking for Group')).toBeNull();
  });
  
  it('should increment like count and change style on click', () => {
    render(<PostCard post={mockPost} />);
    
    const likeButton = screen.getByRole('button', { name: /Like Mario's post/i });
    const likeCountSpan = screen.getByText('125');
    
    expect(likeCountSpan.textContent).toBe('125');
    expect(likeButton.classList.contains('text-secondary')).toBe(true);

    fireEvent.click(likeButton);

    expect(screen.getByText('126')).toBeTruthy();
    expect(likeButton.classList.contains('text-accent')).toBe(true);

    fireEvent.click(likeButton);

    expect(screen.getByText('125')).toBeTruthy();
    expect(likeButton.classList.contains('text-secondary')).toBe(true);
  });
});