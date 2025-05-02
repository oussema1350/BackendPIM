import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Bookmark extends Document {
  @Prop({ 
    type: SchemaTypes.ObjectId, 
    ref: 'User',
    required: true 
  })
  userId: Types.ObjectId;

  @Prop({ 
    type: SchemaTypes.ObjectId, 
    ref: 'Article',
    required: true 
  })
  articleId: Types.ObjectId;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const BookmarkSchema = SchemaFactory.createForClass(Bookmark);

// Create a compound index to ensure a user can only bookmark an article once
BookmarkSchema.index({ userId: 1, articleId: 1 }, { unique: true });