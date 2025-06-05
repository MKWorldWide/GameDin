const AWS = require('aws-sdk');
const cloudwatch = new AWS.CloudWatch();

// Error handling wrapper
const errorHandler = (fn) => async (event, context) => {
    try {
        const startTime = Date.now();
        const result = await fn(event, context);
        
        // Log execution time
        await logMetric('ExecutionTime', Date.now() - startTime, fn.name);
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true
            },
            body: JSON.stringify(result)
        };
    } catch (error) {
        console.error('Error:', {
            functionName: context.functionName,
            error: error.message,
            stack: error.stack,
            event
        });

        // Log error metric
        await logMetric('ErrorCount', 1, fn.name);

        // Handle different types of errors
        if (error.name === 'ValidationError') {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    error: 'Validation Error',
                    message: error.message
                })
            };
        }

        if (error.name === 'ConditionalCheckFailedException') {
            return {
                statusCode: 409,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    error: 'Conflict',
                    message: 'Resource already exists or has been modified'
                })
            };
        }

        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                error: 'Internal Server Error',
                message: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred'
            })
        };
    }
};

// CloudWatch metrics helper
const logMetric = async (metricName, value, functionName) => {
    const params = {
        MetricData: [{
            MetricName: metricName,
            Value: value,
            Unit: metricName === 'ExecutionTime' ? 'Milliseconds' : 'Count',
            Dimensions: [{
                Name: 'FunctionName',
                Value: functionName
            }]
        }],
        Namespace: 'GameDin/Lambda'
    };

    try {
        await cloudwatch.putMetricData(params).promise();
    } catch (error) {
        console.error('Error logging metric:', error);
    }
};

// DynamoDB optimization helpers
const dynamoDBOptions = {
    maxRetries: 3,
    retryDelayOptions: {
        base: 100
    }
};

const createDynamoDBClient = () => {
    const client = new AWS.DynamoDB.DocumentClient(dynamoDBOptions);
    return {
        get: async (params) => {
            const result = await client.get(params).promise();
            await logMetric('DynamoDBGetOperation', 1, 'DynamoDB');
            return result;
        },
        query: async (params) => {
            const result = await client.query(params).promise();
            await logMetric('DynamoDBQueryOperation', 1, 'DynamoDB');
            return result;
        },
        put: async (params) => {
            const result = await client.put(params).promise();
            await logMetric('DynamoDBPutOperation', 1, 'DynamoDB');
            return result;
        },
        update: async (params) => {
            const result = await client.update(params).promise();
            await logMetric('DynamoDBUpdateOperation', 1, 'DynamoDB');
            return result;
        },
        delete: async (params) => {
            const result = await client.delete(params).promise();
            await logMetric('DynamoDBDeleteOperation', 1, 'DynamoDB');
            return result;
        },
        batchWrite: async (params) => {
            const result = await client.batchWrite(params).promise();
            await logMetric('DynamoDBBatchWriteOperation', 1, 'DynamoDB');
            return result;
        }
    };
};

// Cache helper
const cache = new Map();
const cacheWithTTL = (key, value, ttlInSeconds = 300) => {
    cache.set(key, {
        value,
        expiry: Date.now() + (ttlInSeconds * 1000)
    });
};

const getCachedValue = (key) => {
    const item = cache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiry) {
        cache.delete(key);
        return null;
    }
    return item.value;
};

// Input validation helper
class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
    }
}

const validateInput = (schema, input) => {
    const { error } = schema.validate(input);
    if (error) {
        throw new ValidationError(error.details[0].message);
    }
    return input;
};

module.exports = {
    errorHandler,
    logMetric,
    createDynamoDBClient,
    cacheWithTTL,
    getCachedValue,
    validateInput,
    ValidationError
}; 