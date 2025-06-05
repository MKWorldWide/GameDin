import { aiModerator } from './aiModeration';

class FeedService {
  constructor() {
    this.posts = [];
    this.userPreferences = null;
  }

  async fetchPosts(userId) {
    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/posts');
      const posts = await response.json();
      return this.rankPosts(posts, userId);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
      return [];
    }
  }

  async createPost(post) {
    try {
      // Moderate content using AI
      const moderationResult = await aiModerator.moderateContent(post.content);
      if (!moderationResult.approved) {
        throw new Error(moderationResult.reason || 'Content violates community guidelines');
      }

      // TODO: Replace with actual API call
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(post),
      });

      return await response.json();
    } catch (error) {
      console.error('Failed to create post:', error);
      throw error;
    }
  }

  async likePost(postId, userId) {
    try {
      // TODO: Replace with actual API call
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      return await response.json();
    } catch (error) {
      console.error('Failed to like post:', error);
      throw error;
    }
  }

  async commentOnPost(postId, comment) {
    try {
      // Moderate comment using AI
      const moderationResult = await aiModerator.moderateContent(comment.content);
      if (!moderationResult.approved) {
        throw new Error(moderationResult.reason || 'Comment violates community guidelines');
      }

      // TODO: Replace with actual API call
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(comment),
      });

      return await response.json();
    } catch (error) {
      console.error('Failed to add comment:', error);
      throw error;
    }
  }

  async getUserPreferences(userId) {
    try {
      // TODO: Replace with actual API call
      const response = await fetch(`/api/users/${userId}/preferences`);
      this.userPreferences = await response.json();
      return this.userPreferences;
    } catch (error) {
      console.error('Failed to fetch user preferences:', error);
      return null;
    }
  }

  rankPosts(posts, userId) {
    if (!this.userPreferences) {
      return posts;
    }

    return posts.sort((a, b) => {
      let scoreA = this.calculatePostScore(a);
      let scoreB = this.calculatePostScore(b);
      return scoreB - scoreA;
    });
  }

  calculatePostScore(post) {
    let score = 0;

    // Base engagement score
    score += post.likes * 1;
    score += post.comments * 2;

    // Relevance based on user preferences
    if (this.userPreferences) {
      // Game relevance
      if (post.user.games) {
        const commonGames = post.user.games.filter(game => 
          this.userPreferences.games.includes(game)
        );
        score += commonGames.length * 5;
      }

      // Post type relevance
      if (this.userPreferences.interests.includes(post.type)) {
        score += 3;
      }

      // Time decay
      const hoursSincePost = (new Date() - new Date(post.timestamp)) / (1000 * 60 * 60);
      score = score * Math.exp(-hoursSincePost / 24); // Decay over 24 hours
    }

    return score;
  }

  async getRecommendedConnections(userId) {
    try {
      const userProfile = await this.getUserProfile(userId);
      return aiModerator.matchmakeSuggestion(userProfile, this.userPreferences);
    } catch (error) {
      console.error('Failed to get recommended connections:', error);
      return [];
    }
  }

  async getUserProfile(userId) {
    try {
      // TODO: Replace with actual API call
      const response = await fetch(`/api/users/${userId}/profile`);
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      return null;
    }
  }
}

export const feedService = new FeedService(); 