import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2, Context, Handler } from 'aws-lambda';
import { authMiddleware } from './middlewares/auth-middleware';
import { TodoRepository } from './repositories/todo-repository';

const todoRepository = new TodoRepository();

export const handler: Handler = authMiddleware(async (
    _event: APIGatewayProxyEventV2,
    _context: Context
  ): Promise<APIGatewayProxyStructuredResultV2> => {
    
    const user = (_event as any).user;
    const todos = await todoRepository.getAll(user.sub);

    return {
        statusCode: 200,
        body: JSON.stringify(todos)
    };
});
