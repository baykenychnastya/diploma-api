import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DeleteCommand, DynamoDBDocument, DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2, Context, Handler } from 'aws-lambda';
import { v4 } from 'uuid';

const client = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocument.from(client); // client is DynamoDB client

export const handler: Handler = async (
    _event: APIGatewayProxyEventV2,
    _context: Context
  ): Promise<APIGatewayProxyStructuredResultV2> =>  {
    
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
   
    if (!_event.pathParameters) {
        return {
            statusCode: 404
        };
    }

    const id  = _event.pathParameters['id'];

    const tag = await ddbDocClient.get({
        TableName: 'Tags',
        Key: { id }
    });

    if (tag.Item?.userId != decodedToken.sub) {
        return {
            statusCode: 404
        };
    }

    const deleteResult = await ddbDocClient.delete({
        TableName: 'Tags',
        Key: { id }
    });
    
    return {
        statusCode: 200,
        body: JSON.stringify(true)
    };
};
