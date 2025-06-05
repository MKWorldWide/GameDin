const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    try {
        const { searchTerm } = event.arguments;
        
        const params = {
            TableName: process.env.GAMES_TABLE_NAME,
            FilterExpression: 'contains(#title, :searchTerm) OR contains(#description, :searchTerm) OR contains(#genre, :searchTerm)',
            ExpressionAttributeNames: {
                '#title': 'title',
                '#description': 'description',
                '#genre': 'genre'
            },
            ExpressionAttributeValues: {
                ':searchTerm': searchTerm.toLowerCase()
            }
        };

        const result = await dynamodb.scan(params).promise();
        
        return result.Items.map(item => ({
            id: item.id,
            title: item.title,
            description: item.description,
            coverImage: item.coverImage,
            genre: item.genre,
            platform: item.platform,
            releaseDate: item.releaseDate,
            developer: item.developer,
            publisher: item.publisher,
            rating: item.rating
        }));
    } catch (error) {
        console.error('Error searching games:', error);
        throw new Error('Error searching games');
    }
}; 