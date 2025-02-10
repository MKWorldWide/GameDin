const awsmobile = {
    "aws_project_region": "us-east-1",
    "aws_cognito_identity_pool_id": "IDENTITY_POOL_ID",
    "aws_cognito_region": "us-east-1",
    "aws_user_pools_id": "USER_POOL_ID",
    "aws_user_pools_web_client_id": "USER_POOL_CLIENT_ID",
    "oauth": {},
    "aws_appsync_graphqlEndpoint": "GRAPHQL_ENDPOINT",
    "aws_appsync_region": "us-east-1",
    "aws_appsync_authenticationType": "AMAZON_COGNITO_USER_POOLS",
    "aws_dynamodb_all_tables_region": "us-east-1",
    "aws_dynamodb_table_schemas": [
        {
            "tableName": "GameDinUsers",
            "region": "us-east-1"
        },
        {
            "tableName": "GameDinGames",
            "region": "us-east-1"
        },
        {
            "tableName": "GameDinReviews",
            "region": "us-east-1"
        }
    ]
};

export default awsmobile; 