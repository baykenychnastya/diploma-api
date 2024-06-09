import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2, Context, Handler } from 'aws-lambda';
import { v4 } from 'uuid';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

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
   
    const { name, color } = JSON.parse(_event.body!);
    const createdAt = new Date();
    const id = v4();

    const newTag = {
        id,
        userId: decodedToken.sub,
        name,
        color,
        createdAt: createdAt.toISOString()
    };

    const command = new PutCommand({
        TableName: 'Tags',
        Item: newTag
    });

    await docClient.send(command);

    return {
        statusCode: 200,
        body: JSON.stringify(newTag)
    };
};
