import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message } from './message.schema';

@Injectable()
export class ChatService {
    constructor(
        @InjectModel(Message.name) private readonly messageModel: Model<Message>,
    ) { }

    async saveMessage(sender_id: string, message: string, date: Date): Promise<Message> {
        const newMessage = await (new this.messageModel({ sender_id, message, date })).save();
        return await newMessage.populate('sender_id', 'name email profilePicture');
    }

    async getMessages(): Promise<Message[]> {
        return this.messageModel.find().populate('sender_id', 'name email profilePicture').exec();
    }

    async deleteMessage(messageId: string): Promise<Message> {
        const msg = await this.messageModel.findById(messageId).populate('sender_id', 'name email profilePicture').exec();
        await this.messageModel.deleteOne({ _id: messageId }).exec();
        return msg;
    }
}