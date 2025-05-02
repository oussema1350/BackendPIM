import { Schema, Document } from 'mongoose';

export interface Article extends Document {
  title: string;
  description?: string;
  url: string;
  publishedAt: Date;
  author?: string;
  urlToImage?: string;
  content?: string;
  likeCount: number;        // New
  dislikeCount: number;     // New
}

export const ArticleSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: false },
  url: { type: String, required: true },
  publishedAt: { type: Date, required: true },
  author: { type: String, required: false },
  urlToImage: { type: String, required: false },
  content: { type: String, required: false },

  likeCount: { type: Number, default: 0 },     // New
  dislikeCount: { type: Number, default: 0 }   // New
});