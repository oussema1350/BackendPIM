import { Injectable, NotFoundException, ConflictException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Bookmark } from './schemas/bookmark.schema';
import { Types } from 'mongoose';

@Injectable()
export class BookmarkService {
  constructor(
    @InjectModel(Bookmark.name) private bookmarkModel: Model<Bookmark>,
    @InjectModel('Article') private articleModel: Model<any>,
  ) {}

  // Get all bookmarks for a user
  async getUserBookmarks(userId: string) {
    try {
      console.log(`Getting bookmarks for userId: ${userId}`);
      
      // Validate userId
      if (!Types.ObjectId.isValid(userId)) {
        console.error('Invalid userId format');
        throw new BadRequestException('Invalid user ID format');
      }

      // Find all bookmarks for this user
      const bookmarks = await this.bookmarkModel
        .find({ userId: new Types.ObjectId(userId) })
        .populate('articleId')
        .sort({ createdAt: -1 })
        .exec();

      console.log(`Found ${bookmarks.length} bookmarks for user`);
      
      // Extract articles from bookmarks and filter out any null articleId
      const articles = bookmarks
        .filter(bookmark => bookmark.articleId)
        .map(bookmark => bookmark.articleId);
        
      return articles;
    } catch (error) {
      console.error('Error in getUserBookmarks:', error);
      
      // Re-throw the error if it's already a NestJS exception
      if (error.response) {
        throw error;
      }
      
      throw new InternalServerErrorException('Failed to fetch bookmarked articles');
    }
  }

  // Add a bookmark
  async addBookmark(userId: string, articleId: string) {
    try {
      console.log(`Adding bookmark: userId=${userId}, articleId=${articleId}`);
      
      // Validate ObjectId format first
      if (!Types.ObjectId.isValid(userId)) {
        console.error('Invalid userId format');
        throw new BadRequestException('Invalid user ID format');
      }
      
      if (!Types.ObjectId.isValid(articleId)) {
        console.error('Invalid articleId format');
        throw new BadRequestException('Invalid article ID format');
      }
      
      // Check if article exists
      const articleExists = await this.articleModel.findById(articleId).exec();
      if (!articleExists) {
        console.error(`Article with ID ${articleId} not found`);
        throw new NotFoundException('Article not found');
      }

      // Check if bookmark already exists
      const existingBookmark = await this.bookmarkModel.findOne({
        userId: new Types.ObjectId(userId),
        articleId: new Types.ObjectId(articleId),
      }).exec();
      
      if (existingBookmark) {
        console.log('Article already bookmarked');
        return { success: true, message: 'Article already bookmarked' };
      }

      // Create new bookmark
      const bookmark = new this.bookmarkModel({
        userId: new Types.ObjectId(userId),
        articleId: new Types.ObjectId(articleId),
      });

      await bookmark.save();
      console.log('Bookmark saved successfully');
      return { success: true, message: 'Article bookmarked successfully' };
    } catch (error) {
      console.error('Error in addBookmark:', error);
      
      // Handle duplicate key errors
      if (error.code === 11000) {
        throw new ConflictException('Article already bookmarked');
      }
      
      // Re-throw the error if it's already a NestJS exception
      if (error.response) {
        throw error;
      }
      
      // Otherwise wrap it in an internal server error
      throw new InternalServerErrorException('Failed to bookmark article');
    }
  }

  // Remove a bookmark
  async removeBookmark(userId: string, articleId: string) {
    try {
      console.log(`Removing bookmark: userId=${userId}, articleId=${articleId}`);
      
      // Validate ObjectId format
      if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(articleId)) {
        console.error('Invalid ID format');
        throw new BadRequestException('Invalid ID format');
      }
      
      const result = await this.bookmarkModel.deleteOne({
        userId: new Types.ObjectId(userId),
        articleId: new Types.ObjectId(articleId),
      }).exec();

      if (result.deletedCount === 0) {
        console.log('Bookmark not found');
        throw new NotFoundException('Bookmark not found');
      }

      console.log('Bookmark removed successfully');
      return { success: true, message: 'Bookmark removed successfully' };
    } catch (error) {
      console.error('Error in removeBookmark:', error);
      
      // Re-throw the error if it's already a NestJS exception
      if (error.response) {
        throw error;
      }
      
      throw new InternalServerErrorException('Failed to remove bookmark');
    }
  }

  // Check if an article is bookmarked by a user
  async isBookmarked(userId: string, articleId: string) {
    try {
      console.log(`Checking bookmark: userId=${userId}, articleId=${articleId}`);
      
      // Validate ObjectId format
      if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(articleId)) {
        console.error('Invalid ID format');
        throw new BadRequestException('Invalid ID format');
      }
      
      const bookmark = await this.bookmarkModel.findOne({
        userId: new Types.ObjectId(userId),
        articleId: new Types.ObjectId(articleId),
      }).exec();

      console.log(`Is bookmarked: ${!!bookmark}`);
      return { isBookmarked: !!bookmark };
    } catch (error) {
      console.error('Error in isBookmarked:', error);
      
      // Re-throw the error if it's already a NestJS exception
      if (error.response) {
        throw error;
      }
      
      throw new InternalServerErrorException('Failed to check bookmark status');
    }
  }
}