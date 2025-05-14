import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message } from './message.schema';
import { MailService } from '@src/services/mail.service';
import { User } from '@src/auth/schemas/user.schema';

@Injectable()
export class ChatService {
    constructor(
        @InjectModel(Message.name) private readonly messageModel: Model<Message>,
        @InjectModel('User') private readonly userModel: Model<User>,
        private readonly mailService: MailService,
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

     async getMessageById(messageId: string): Promise<Message> {
        return this.messageModel.findById(messageId).populate('sender_id', 'name email profilePicture bannedUntil').exec();
    }

    async editMessage(messageId: string, message: string): Promise<Message> {
        const msg = await this.messageModel.findById(messageId);
        const r = msg.populate('sender_id', 'name email profilePicture');
        msg.message = message;
        await msg.save();
        return r;
    }

    async reportUser(reportedUserId: string, reporterId: string): Promise<void> {

        const user = await this.userModel.findById(reportedUserId);
        let repos = [];
        if (user.reportedBy != "") {
            repos = user.reportedBy.split('|')
            const isReportedByMe = repos.filter((r) => r === reporterId).length > 0;
            if (isReportedByMe) {
                console.log(`Duplicate report ignored.`);
                return;
            }
            if (repos.length == 2) {
                await this.banUser(reportedUserId);
                await this.mailService.BannedUser(
                    'ahmedyassine.mzoughi@esprit.tn',
                    user.name,
                    user.email,
                );
                user.reportedBy = '';
                await user.save();
                console.log(`User ${reportedUserId} has been banned and notified.`);
                return;
            }
        }
        repos.push(reporterId);

        console.log(repos, reporterId)
        user.reportedBy = repos.join('|');
        console.log(`User ${reportedUserId} has been reported, count is now ${repos.length}.`);
        await user.save();
    }

    async banUser(userId: string): Promise<void> {
        const banDuration = 30 * 60 * 1000;
        const bannedUntil = new Date(Date.now() + banDuration);
        console.log(bannedUntil);
        await this.userModel.findByIdAndUpdate(userId, { bannedUntil });
        console.log(`User ${userId} has been banned until ${bannedUntil}`);
    }
}