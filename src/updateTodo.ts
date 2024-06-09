import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2, Context, Handler } from 'aws-lambda';
import { authMiddleware } from './middlewares/auth-middleware';
import { TodoRepository } from './repositories/todo-repository';

const todoRepository = new TodoRepository();

export const handler: Handler = authMiddleware(async (
    _event: APIGatewayProxyEventV2,
    _context: Context
  ): Promise<APIGatewayProxyStructuredResultV2> => {
    
    if (!_event.pathParameters) {
        return { statusCode: 404 };
    }
    
    const user = (_event as any).user;
    const id  = _event.pathParameters['id'];

    const existingTodo = await todoRepository.get(id!);

    if (existingTodo?.userId != user.sub) {
        return { statusCode: 404 };
    }

    const { completed, todo, tagIds } = JSON.parse(_event.body!);
    const updateCommandOutput = await todoRepository.update(id!, completed, todo, tagIds || []);

    return {
        statusCode: 200,
        body: JSON.stringify(updateCommandOutput)
    };
});
