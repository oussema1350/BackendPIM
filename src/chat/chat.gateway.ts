import { Logger, OnModuleDestroy } from '@nestjs/common';
import { WebSocketServer, WebSocketGateway } from '@nestjs/websockets';
import { Server, WebSocket } from 'ws';
import { ChatService } from './chat.service';
import { Profanity } from '@2toad/profanity';

@WebSocketGateway()
export class ChatGateway implements OnModuleDestroy {
  private readonly logger = new Logger(ChatGateway.name);
  private profanityFilter = new Profanity();
  @WebSocketServer() server: Server = new Server({ port: 8080 });
  private clients: Set<WebSocket> = new Set();

  constructor(private readonly chatService: ChatService) {
    console.log('✅ ChatService instance:', this.chatService);
    this.server.on('connection', (ws: WebSocket) => {
      this.logger.log('✅ Client connected');
      this.clients.add(ws);

      ws.on('message', async (message: string) => {
        try {
          const cmd = JSON.parse(message).message;
          
          if (cmd.type === 'init') {
            const r = await this.chatService.getMessages();
            ws.send(JSON.stringify({ type: 'init', content: r.filter(m => m.sender_id !== null) }));
            return;
          } else if (cmd.type === 'message') {
            const msg = cmd.content;
            const content = this.profanityFilter.censor(msg.message);
            const message = await this.chatService.saveMessage(
              msg.sender_id,
              content,
              msg.date,
            );
            console.log('Message:', message);
            this.clients.forEach(client => {
              if (client.readyState === WebSocket.OPEN) {
                console.log("Message sent!");
                client.send(JSON.stringify({ type: 'message', content: message }));
              }
            });
            return;
          } else if (cmd.type === 'delete') {
            const messageId = cmd.content;
            const deleted = await this.chatService.deleteMessage(messageId);
            if (deleted) {
              this.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                  client.send(JSON.stringify({ type: 'delete', content: deleted }));
                }
              });
            } else {
              console.log(`Failed to delete message with ID ${messageId}`);
            }
            return;
          }
          
          console.log('Unknown command', cmd);
        } catch (error) {
          this.logger.error(`Error processing message: ${error.message}`);
        }
      });

      ws.on('close', () => {
        this.logger.log('Client disconnected');
        this.clients.delete(ws);
      });
    });
  }

  onModuleDestroy() {
    this.logger.log('WebSocket server shutting down');
    this.server.close();
  }
}