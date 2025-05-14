import { Controller, Get, Param, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { NewsService } from './news.service';
import { Article } from './schemas/new.schemas';

@Controller('news') // ✅ Ensures endpoints are under /news
export class NewsController {
  constructor(private newsService: NewsService) {}

  @Get('fetch')
  async fetchAndStoreNews() {
    await this.newsService.fetchAndStoreMedicalNews();
    return { message: 'Articles fetched and stored successfully!' };
  } 

  // ✅ New anonymous reaction endpoints

  @Post('articles/:id/like')
  async likeArticle(@Param('id') articleId: string, @Res() res: Response) {
    try {
      const article = await this.newsService.likeArticle(articleId);
      return res.status(200).json(article);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  @Post('articles/:id/dislike')
  async dislikeArticle(@Param('id') articleId: string, @Res() res: Response) {
    try {
      const article = await this.newsService.dislikeArticle(articleId);
      return res.status(200).json(article);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  @Get('test-fetch')
  async testFetchArticles() {
    console.log('Manual fetch triggered');
    await this.newsService.fetchAndStoreMedicalNews();
    return { message: 'Manual fetch triggered' };
  }

  // ✅ New endpoint to return stored articles
  @Get('articles')
  async getAllArticles(): Promise<Article[]> {
    return this.newsService.getArticles();
  }

  
}
