const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const apigwManagementApi = new AWS.ApiGatewayManagementApi({
    apiVersion: '2018-11-29',
    endpoint: process.env.WEBSOCKET_API_ENDPOINT
});

// Store connection in DynamoDB
const storeConnection = async (connectionId, userId) => {
    const params = {
        TableName: process.env.CONNECTIONS_TABLE,
        Item: {
            connectionId,
            userId,
            timestamp: Date.now()
        }
    };
    await dynamodb.put(params).promise();
};

// Remove connection from DynamoDB
const removeConnection = async (connectionId) => {
    const params = {
        TableName: process.env.CONNECTIONS_TABLE,
        Key: { connectionId }
    };
    await dynamodb.delete(params).promise();
};

// Send message to connected client
const sendMessage = async (connectionId, message) => {
    try {
        await apigwManagementApi.postToConnection({
            ConnectionId: connectionId,
            Data: JSON.stringify(message)
        }).promise();
    } catch (error) {
        if (error.statusCode === 410) {
            await removeConnection(connectionId);
        } else {
            throw error;
        }
    }
};

// Broadcast message to all connected clients
const broadcastMessage = async (message, excludeConnectionId = null) => {
    const params = {
        TableName: process.env.CONNECTIONS_TABLE
    };
    
    const connections = await dynamodb.scan(params).promise();
    const sendPromises = connections.Items
        .filter(connection => connection.connectionId !== excludeConnectionId)
        .map(connection => sendMessage(connection.connectionId, message));
    
    await Promise.all(sendPromises);
};

exports.handler = async (event) => {
    const { routeKey } = event.requestContext;
    const connectionId = event.requestContext.connectionId;
    
    try {
        switch (routeKey) {
            case '$connect':
                const userId = event.queryStringParameters?.userId;
                if (!userId) {
                    return { statusCode: 400, body: 'userId is required' };
                }
                await storeConnection(connectionId, userId);
                break;
                
            case '$disconnect':
                await removeConnection(connectionId);
                break;
                
            case 'sendmessage':
                const body = JSON.parse(event.body);
                const message = {
                    action: 'message',
                    timestamp: Date.now(),
                    ...body
                };
                
                if (body.recipientId) {
                    // Direct message to specific user
                    const recipientParams = {
                        TableName: process.env.CONNECTIONS_TABLE,
                        IndexName: 'UserIdIndex',
                        KeyConditionExpression: 'userId = :userId',
                        ExpressionAttributeValues: {
                            ':userId': body.recipientId
                        }
                    };
                    const recipients = await dynamodb.query(recipientParams).promise();
                    await Promise.all(
                        recipients.Items.map(recipient => 
                            sendMessage(recipient.connectionId, message)
                        )
                    );
                } else {
                    // Broadcast message
                    await broadcastMessage(message, connectionId);
                }
                break;
                
            default:
                return { statusCode: 400, body: 'Unknown route' };
        }
        
        return { statusCode: 200, body: 'Success' };
    } catch (error) {
        console.error('Error:', error);
        return { statusCode: 500, body: 'Internal server error' };
    }
}; 