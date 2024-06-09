import { clerkClient } from '@clerk/clerk-sdk-node';
import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2, Callback, Context, Handler } from 'aws-lambda';

export const authenticate = async (event: APIGatewayProxyEventV2): Promise<any> => {
    const token = event.headers['token'];

    if (!token) {
        throw {
            statusCode: 403,
            body: JSON.stringify({ error: "Invalid Token" })
        };
    }

    let decodedToken: any;
    try {
        decodedToken = await clerkClient.verifyToken(token);
    } catch (error) {
        throw {
            statusCode: 403,
            body: JSON.stringify({ error: "Invalid Token" })
        };
    }

    return decodedToken;
};

export const authMiddleware = (handler: Handler): Handler => {
    return async (event: APIGatewayProxyEventV2, context: Context, callback: Callback<any>) => {
        try {
            const user = await authenticate(event);
            // Pass the user data to the handler
            (event as any).user = user;
            return await handler(event, context, callback);
        } catch (error) {
            return error;
        }
    };
};
