import { Controller, Get, Post, Delete, Param, Body, UseGuards, Req, Logger } from '@nestjs/common';
import { BookmarkService } from './bookmarks.service';
import { AuthenticationGuard } from '../guards/authentication.guard';

@Controller('bookmarks')
@UseGuards(AuthenticationGuard)
export class BookmarkController {
  private readonly logger = new Logger(BookmarkController.name);
  
  constructor(private readonly bookmarkService: BookmarkService) {}

  @Get()
  async getUserBookmarks(@Req() req) {
    this.logger.log(`GET /bookmarks - userId: ${req.userId}`);
    const userId = req.userId;
    return this.bookmarkService.getUserBookmarks(userId);
  }

  @Post()
  async addBookmark(@Req() req, @Body() body: { articleId: string }) {
    this.logger.log(`POST /bookmarks - userId: ${req.userId}, articleId: ${body.articleId}`);
    
    if (!body.articleId) {
      this.logger.error('POST /bookmarks - Missing articleId in request body');
      throw new Error('ArticleId is required');
    }
    
    const userId = req.userId;
    const { articleId } = body;
    return this.bookmarkService.addBookmark(userId, articleId);
  }

  @Delete(':articleId')
  async removeBookmark(@Req() req, @Param('articleId') articleId: string) {
    this.logger.log(`DELETE /bookmarks/${articleId} - userId: ${req.userId}`);
    const userId = req.userId;
    return this.bookmarkService.removeBookmark(userId, articleId);
  }

  @Get('check/:articleId')
  async isBookmarked(@Req() req, @Param('articleId') articleId: string) {
    this.logger.log(`GET /bookmarks/check/${articleId} - userId: ${req.userId}`);
    const userId = req.userId;
    return this.bookmarkService.isBookmarked(userId, articleId);
  }
}