import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NewsService } from './news.service';
import { Article, ArticleSchema } from './schemas/new.schemas';
import { NewsController } from './news.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Article', schema: ArticleSchema },  // Correct usage with Article.name
    ]),
  ],
  providers: [NewsService],
  controllers: [NewsController],  // Make sure your service is in the providers array
})
export class NewsModule {}
