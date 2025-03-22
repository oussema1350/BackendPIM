import { Controller, Get } from '@nestjs/common';
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
