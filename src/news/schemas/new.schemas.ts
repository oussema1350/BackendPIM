import { Schema, Document } from 'mongoose';

export interface Article extends Document {
  title: string;
  description?: string; // Made optional
  url: string;
  publishedAt: Date;
  author?: string; // Optional in case the API response has null values
  urlToImage?: string; // Optional in case no image is provided
  content?: string; // Added content field, optional in case it's missing
}

export const ArticleSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: false }, // Some articles might not have a description
  url: { type: String, required: true },
  publishedAt: { type: Date, required: true },
  author: { type: String, required: false }, // Some articles might not have an author
  urlToImage: { type: String, required: false }, // Some articles might not have an image
  content: { type: String, required: false }, // Added content field, optional
});
