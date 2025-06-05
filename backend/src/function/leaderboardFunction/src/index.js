const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const elasticache = new AWS.ElastiCache();

// Achievement definitions
const ACHIEVEMENTS = {
    GAME_MASTER: {
        id: 'GAME_MASTER',
        title: 'Game Master',
        description: 'Review 100 games',
        threshold: 100,
        points: 1000
    },
    SOCIAL_BUTTERFLY: {
        id: 'SOCIAL_BUTTERFLY',
        title: 'Social Butterfly',
        description: 'Connect with 50 other gamers',
        threshold: 50,
        points: 500
    },
    GENRE_EXPLORER: {
        id: 'GENRE_EXPLORER',
        title: 'Genre Explorer',
        description: 'Play games from 10 different genres',
        threshold: 10,
        points: 300
    }
};

// Check and award achievements
const checkAchievements = async (userId) => {
    const userStats = await getUserStats(userId);
    const newAchievements = [];
    
    // Check each achievement condition
    if (userStats.reviewCount >= ACHIEVEMENTS.GAME_MASTER.threshold) {
        newAchievements.push(ACHIEVEMENTS.GAME_MASTER);
    }
    if (userStats.connections >= ACHIEVEMENTS.SOCIAL_BUTTERFLY.threshold) {
        newAchievements.push(ACHIEVEMENTS.SOCIAL_BUTTERFLY);
    }
    if (userStats.uniqueGenres >= ACHIEVEMENTS.GENRE_EXPLORER.threshold) {
        newAchievements.push(ACHIEVEMENTS.GENRE_EXPLORER);
    }
    
    // Award new achievements
    if (newAchievements.length > 0) {
        await awardAchievements(userId, newAchievements);
    }
    
    return newAchievements;
};

// Get user statistics
const getUserStats = async (userId) => {
    const params = {
        TableName: process.env.USERS_TABLE_NAME,
        Key: { id: userId }
    };
    
    const result = await dynamodb.get(params).promise();
    const user = result.Item;
    
    // Calculate statistics
    const reviewCount = user.reviews?.length || 0;
    const connections = user.connections?.length || 0;
    const uniqueGenres = new Set(
        (user.playedGames || []).map(game => game.genre)
    ).size;
    
    return {
        reviewCount,
        connections,
        uniqueGenres
    };
};

// Award achievements to user
const awardAchievements = async (userId, achievements) => {
    const params = {
        TableName: process.env.USERS_TABLE_NAME,
        Key: { id: userId },
        UpdateExpression: 'SET achievements = list_append(if_not_exists(achievements, :empty), :newAchievements)',
        ExpressionAttributeValues: {
            ':empty': [],
            ':newAchievements': achievements
        }
    };
    
    await dynamodb.update(params).promise();
    
    // Update leaderboard
    const points = achievements.reduce((total, achievement) => total + achievement.points, 0);
    await updateLeaderboard(userId, points);
};

// Update leaderboard
const updateLeaderboard = async (userId, points) => {
    const params = {
        TableName: process.env.LEADERBOARD_TABLE_NAME,
        Key: { id: userId },
        UpdateExpression: 'ADD points :points',
        ExpressionAttributeValues: {
            ':points': points
        }
    };
    
    await dynamodb.update(params).promise();
    
    // Update cached leaderboard in ElastiCache
    await refreshLeaderboardCache();
};

// Get leaderboard
const getLeaderboard = async (limit = 100) => {
    const params = {
        TableName: process.env.LEADERBOARD_TABLE_NAME,
        IndexName: 'PointsIndex',
        ScanIndexForward: false,
        Limit: limit
    };
    
    const result = await dynamodb.scan(params).promise();
    return result.Items;
};

// Refresh leaderboard cache
const refreshLeaderboardCache = async () => {
    const leaderboard = await getLeaderboard();
    // Cache implementation would go here
};

exports.handler = async (event) => {
    try {
        const { action, userId, limit } = event.arguments;
        
        switch (action) {
            case 'GET_LEADERBOARD':
                return await getLeaderboard(limit);
                
            case 'CHECK_ACHIEVEMENTS':
                return await checkAchievements(userId);
                
            case 'GET_USER_STATS':
                return await getUserStats(userId);
                
            default:
                throw new Error('Invalid action');
        }
    } catch (error) {
        console.error('Error:', error);
        throw new Error('Error processing request');
    }
}; 