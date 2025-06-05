const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const personalize = new AWS.Personalize();
const personalizeRuntime = new AWS.PersonalizeRuntime();

exports.handler = async (event) => {
    try {
        const { userId } = event.arguments;
        
        // Get personalized recommendations using Amazon Personalize
        const personalizeParams = {
            campaignArn: process.env.PERSONALIZE_CAMPAIGN_ARN,
            userId: userId,
            numResults: 25
        };
        
        const personalizeResult = await personalizeRuntime.getRecommendations(personalizeParams).promise();
        const recommendedItemIds = personalizeResult.itemList.map(item => item.itemId);
        
        // Fetch full game details from DynamoDB
        const gamePromises = recommendedItemIds.map(gameId => 
            dynamodb.get({
                TableName: process.env.GAMES_TABLE_NAME,
                Key: { id: gameId }
            }).promise()
        );
        
        const games = await Promise.all(gamePromises);
        const recommendedGames = games
            .filter(result => result.Item)
            .map(result => result.Item);
            
        // If we don't have enough recommendations, supplement with genre-based recommendations
        if (recommendedGames.length < 10) {
            const userParams = {
                TableName: process.env.USERS_TABLE_NAME,
                Key: { id: userId },
                ProjectionExpression: 'favorites, reviews'
            };
            
            const userData = await dynamodb.get(userParams).promise();
            const userFavorites = userData.Item?.favorites || [];
            
            // Get user's preferred genres
            const userGenres = new Set();
            const favoriteGames = await Promise.all(
                userFavorites.map(gameId => 
                    dynamodb.get({
                        TableName: process.env.GAMES_TABLE_NAME,
                        Key: { id: gameId }
                    }).promise()
                )
            );
            
            favoriteGames.forEach(game => {
                if (game.Item?.genre) {
                    game.Item.genre.forEach(g => userGenres.add(g));
                }
            });
            
            // Get additional recommendations based on genres
            const genreParams = {
                TableName: process.env.GAMES_TABLE_NAME,
                FilterExpression: 'contains(#genre, :genres)',
                ExpressionAttributeNames: {
                    '#genre': 'genre'
                },
                ExpressionAttributeValues: {
                    ':genres': Array.from(userGenres)[0]
                }
            };
            
            const genreResult = await dynamodb.scan(genreParams).promise();
            const genreRecommendations = genreResult.Items
                .filter(game => !recommendedGames.some(rec => rec.id === game.id))
                .filter(game => !userFavorites.includes(game.id))
                .sort((a, b) => b.rating - a.rating)
                .slice(0, 10 - recommendedGames.length);
                
            recommendedGames.push(...genreRecommendations);
        }
        
        // Record user interaction for future personalization
        const putEventParams = {
            trackingId: process.env.PERSONALIZE_TRACKING_ID,
            userId: userId,
            sessionId: event.info.fieldName,
            eventList: [{
                eventType: 'GetRecommendations',
                sentAt: new Date()
            }]
        };
        
        await personalize.putEvents(putEventParams).promise();
        
        return recommendedGames.map(game => ({
            id: game.id,
            title: game.title,
            description: game.description,
            coverImage: game.coverImage,
            genre: game.genre,
            platform: game.platform,
            rating: game.rating,
            developer: game.developer,
            publisher: game.publisher
        }));
    } catch (error) {
        console.error('Error generating recommendations:', error);
        throw new Error('Error generating recommendations');
    }
}; 