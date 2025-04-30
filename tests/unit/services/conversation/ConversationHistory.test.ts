import * as vscode from 'vscode';
import { ConversationHistory } from '../../../../src/services/ConversationHistory';
import * as fs from 'fs';
import * as path from 'path';

jest.mock('fs');
jest.mock('path');

describe('ConversationHistory', () => {
    let mockContext: vscode.ExtensionContext;
    let conversationHistory: ConversationHistory;
    let mockStorageUri = { fsPath: '/mock/storage/path' };

    beforeEach(() => {
        mockContext = {
            globalState: {
                get: jest.fn(),
                update: jest.fn(),
            },
            globalStorageUri: mockStorageUri,
        } as any;

        jest.spyOn(fs, 'mkdirSync').mockImplementation();
        jest.spyOn(fs, 'existsSync').mockReturnValue(false);
        jest.spyOn(fs, 'writeFileSync').mockImplementation();
        jest.spyOn(fs, 'readFileSync').mockImplementation();
        jest.spyOn(fs, 'unlinkSync').mockImplementation();
        jest.spyOn(fs, 'readdirSync').mockReturnValue([]);

        conversationHistory = new ConversationHistory(mockContext);
    });

    describe('Conversation Management', () => {
        it('should create a new conversation', async () => {
            const title = 'Test Conversation';
            const conversation = await conversationHistory.createConversation(title);

            expect(conversation.title).toBe(title);
            expect(fs.writeFileSync).toHaveBeenCalled();
        });

        it('should add a message to a conversation', async () => {
            const conversation = await conversationHistory.createConversation('Test');
            const message = {
                id: '1',
                role: 'user',
                content: 'Test message',
                timestamp: Date.now()
            };

            await conversationHistory.addMessage(conversation.id, message);
            const updated = conversationHistory.getConversation(conversation.id);
            expect(updated?.messages).toContainEqual(message);
        });

        it('should forget a message', async () => {
            const conversation = await conversationHistory.createConversation('Test');
            const message = {
                id: '1',
                role: 'user',
                content: 'Test message',
                timestamp: Date.now()
            };

            await conversationHistory.addMessage(conversation.id, message);
            await conversationHistory.forgetMessage(conversation.id, message.id);
            const updated = conversationHistory.getConversation(conversation.id);
            expect(updated?.messages).not.toContainEqual(message);
        });
    });

    describe('Chapter Management', () => {
        it('should create a new chapter', async () => {
            const title = 'Test Chapter';
            const description = 'Test Description';
            const chapter = await conversationHistory.createChapter(title, description);

            expect(chapter.title).toBe(title);
            expect(chapter.description).toBe(description);
            expect(mockContext.globalState.update).toHaveBeenCalled();
        });

        it('should add a conversation to a chapter', async () => {
            const chapter = await conversationHistory.createChapter('Test Chapter');
            const conversation = await conversationHistory.createConversation('Test Conversation');

            await conversationHistory.addConversationToChapter(conversation.id, chapter.id);
            const updated = conversationHistory.getChapter(chapter.id);
            expect(updated?.conversationIds).toContain(conversation.id);
        });
    });

    describe('Project Objectives', () => {
        it('should update project objectives', async () => {
            const objectives = ['Objective 1', 'Objective 2'];
            await conversationHistory.updateProjectObjectives(objectives);
            expect(mockContext.globalState.update).toHaveBeenCalledWith('project-objectives.json', objectives);
        });

        it('should get project objectives', async () => {
            const objectives = ['Objective 1', 'Objective 2'];
            (mockContext.globalState.get as jest.Mock).mockReturnValue(objectives);
            
            const result = await conversationHistory.getProjectObjectives();
            expect(result).toEqual(objectives);
        });
    });

    describe('Message References', () => {
        it('should add a reference to a message', async () => {
            const conversation = await conversationHistory.createConversation('Test');
            const message1 = {
                id: '1',
                role: 'user',
                content: 'Message 1',
                timestamp: Date.now()
            };
            const message2 = {
                id: '2',
                role: 'user',
                content: 'Message 2',
                timestamp: Date.now()
            };

            await conversationHistory.addMessage(conversation.id, message1);
            await conversationHistory.addMessage(conversation.id, message2);
            await conversationHistory.addMessageReference(message2.id, message1.id);

            const updated = conversationHistory.getConversation(conversation.id);
            const updatedMessage = updated?.messages.find(m => m.id === message2.id);
            expect(updatedMessage?.references).toContain(message1.id);
        });
    });
});