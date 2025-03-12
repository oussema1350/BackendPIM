import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Message, MessageSchema } from './message.schema';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { User, UserSchema } from 'src/auth/schemas/user.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Message.name, schema: MessageSchema },
            { name: User.name, schema: UserSchema },
        ]),
    ],
    providers: [ChatService, ChatGateway], 
    exports: [ChatService],
})
export class ChatModule { }