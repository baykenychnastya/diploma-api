import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DeleteCommand, DynamoDBDocument, DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { v4 } from 'uuid';

const TABLE_NAME = 'TodoTable';

export class TodoRepository {
    private ddbDocClient: DynamoDBDocumentClient;
    private dynamoDBDocument: DynamoDBDocument;
 
    constructor() {
        const client = new DynamoDBClient({});
        this.ddbDocClient = DynamoDBDocumentClient.from(client);
        this.dynamoDBDocument = DynamoDBDocument.from(client);
    }

    async createTodo(task: string, userId: string) {
        const createdAt = new Date();
        const id = v4();

        const newTodo = {
            id,
            userId: userId,
            todo: task,
            createdAt: createdAt.toISOString(),
            completed: false
        };

        const command = new PutCommand({
            TableName: TABLE_NAME,
            Item: newTodo
        });
        await this.ddbDocClient.send(command);
        return newTodo;
    }

    async update(id: string, completed: boolean, task: string, tagIds: string[]) {
        const command = new UpdateCommand({
            TableName: 'TodoTable',
            Key: { id },
            UpdateExpression: 'set completed = :completed, todo = :todo, tagIds = :tagIds',
            ExpressionAttributeValues: {
                ':completed': completed,
                ':todo': task,
                ':tagIds': tagIds || []
            },
            ReturnValues: 'ALL_NEW'
        });
        const updateCommandOutput = await this.ddbDocClient.send(command);
        return updateCommandOutput.Attributes;
    }

    async delete(id: string) {
        const command = new DeleteCommand({
            TableName: TABLE_NAME,
            Key: { id }
        });

        await this.ddbDocClient.send(command);
    }

    async getAll(userId: string) {
        const result = await this.dynamoDBDocument.scan({
            TableName: 'TodoTable',
            FilterExpression: '#userId = :userId',
            ExpressionAttributeNames: { "#userId": "userId" },
            ExpressionAttributeValues: {
                ':userId': userId
            }
        });
        return result.Items;
    }

    async get(id: string) {
        const command = new GetCommand({
        TableName: TABLE_NAME,
        Key: { id }
        });
        const result = await this.ddbDocClient.send(command);
        return result.Item;
    }
}