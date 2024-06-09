import { DynamoDBClient, QueryCommand } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument, DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2, Context, Handler } from 'aws-lambda';
import { v4 } from 'uuid';
import { clerkClient, createClerkClient } from '@clerk/clerk-sdk-node';
import jwt from 'jsonwebtoken';

const client = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocument.from(client); // client is DynamoDB client

export const handler: Handler = async (
    _event: APIGatewayProxyEventV2,
    _context: Context
  ): Promise<APIGatewayProxyStructuredResultV2> => {
    
    const token = _event.headers['token'];

    if (!token) {
        return {
            statusCode: 403,
            body:JSON.stringify({
                error: "Invalid Token"
            } )
        };        
    }

    let decodedToken: any;
    try {
        decodedToken = await clerkClient.verifyToken(token!);
      } catch (error) {
        return {
            statusCode: 400,
            body:JSON.stringify({
                error: "Invalid Token"
            } )
        };      
    }

    const tags = await ddbDocClient.scan({
        TableName: 'Tags',
        FilterExpression: '#userId = :userId',
        ExpressionAttributeNames: { "#userId": "userId" },
        ExpressionAttributeValues: {
            ':userId': decodedToken.sub
        }
    });

    return {
        statusCode: 200,
        body: JSON.stringify(tags.Items)
    };
};
