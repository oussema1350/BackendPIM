import { Logger, OnModuleDestroy } from '@nestjs/common';
import { WebSocketServer, WebSocketGateway } from '@nestjs/websockets';
import { Server, WebSocket } from 'ws';
import { ChatService } from './chat.service';
import { Profanity } from '@2toad/profanity';
import { User } from '../auth/schemas/user.schema';
import { MailService } from '@src/services/mail.service';

@WebSocketGateway()
export class ChatGateway implements OnModuleDestroy {
  private readonly logger = new Logger(ChatGateway.name);
  private profanityFilter = new Profanity();
  @WebSocketServer() server: Server = new Server({ port: 8080 });
  private clients: Set<WebSocket> = new Set();

  constructor(private readonly chatService: ChatService,
    private readonly mailService: MailService) {  
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
          } else if (cmd.type === 'report') {

            const messageId = cmd.content.reported_msg;
            const reporterId = cmd.content.reported_user;
            try {
              const message = await this.chatService.getMessageById(messageId);
              if (!message) {
                console.error(`Failed to find message with ID ${messageId}`);
                return;
              }
  
              const reportedUser = message.sender_id as unknown as User;
  
              await this.chatService.reportUser(reportedUser._id.toString(), reporterId);
  
              await this.mailService.sendReportMessage(
                'ahmedyassine.mzoughi@esprit.tn',
                message.message,
                reportedUser.name,
                reportedUser.email,
              );
            } catch (error) {
              console.error(`Error processing report for message ID ${messageId}:`, error.message);
            }
  
            return;
          } else if (cmd.type === 'update') {
  
            console.log(cmd.content);
  
            const messageId = cmd.content.id;
            const message = await this.chatService.editMessage(messageId, cmd.content.message);
            if (message) {
              this.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                  client.send(JSON.stringify({ type: 'update', content: message }));
                }
              });
            } else {
              console.log(`Failed to update message with ID ${messageId}`);
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