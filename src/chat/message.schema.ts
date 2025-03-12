import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document,  Types } from 'mongoose';

@Schema()
export class Message extends Document {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    sender_id: string;

    @Prop({ required: true })
    message: string;

    @Prop({ required: true })
    date: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);