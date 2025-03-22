import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { Article } from './schemas/new.schemas';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class NewsService {
  constructor(
    private configService: ConfigService,
    @InjectModel('Article') private readonly articleModel: Model<Article>,
  ) {}

  @Cron('* * * * *') // Runs every minute for testing (change to daily for production)
  async fetchAndStoreMedicalNews() {
    console.log('Cron job started');
    try {
      const apiKey = this.configService.get<string>('NEWS_API_KEY');

      if (!apiKey) {
        throw new Error('API key is missing!');
      }

      const response = await axios.get('https://newsapi.org/v2/top-headlines', {
        params: {
          category: 'health', // ✅ Ensures only health news is fetched
          language: 'en',
          sortBy: 'publishedAt',
          apiKey: apiKey,
        },
        headers: { 'Content-Type': 'application/json' },
      });

      const articles = response.data.articles;
      console.log(`Fetched ${articles.length} articles`);

      for (const article of articles) {
        await this.createArticle(article);
      }

      console.log('Articles stored successfully!');
    } catch (error) {
      console.error('Error fetching or storing articles:', error);
    }
  }

  // ✅ Function to fetch stored articles from MongoDB
  async getArticles(): Promise<Article[]> {
    return this.articleModel.find().exec(); // Fetch all stored articles
  }

  private async createArticle(articleData: any) {
    try {
      const cleanedContent = articleData.content
        ? articleData.content.replace(/\[\+\d+ chars\]/, '')
        : 'Full content not available. Visit source for details.';

      const newArticle = new this.articleModel({
        title: articleData.title,
        description: articleData.description,
        url: articleData.url,
        author: articleData.author || 'Unknown',
        urlToImage: articleData.urlToImage || 'https://via.placeholder.com/150',
        content: cleanedContent,
        publishedAt: new Date(articleData.publishedAt),
      });

      console.log('Attempting to save article:', newArticle.title);
      await newArticle.save();
      console.log(`Article saved: ${articleData.title}`);
    } catch (error) {
      console.error('Error saving article:', error);
    }
  }
}
