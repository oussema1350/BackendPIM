import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BookmarkController } from './bookmarks.controller';
import { BookmarkService } from './bookmarks.service';
import { Bookmark, BookmarkSchema } from './schemas/bookmark.schema';
import { ArticleSchema } from '@src/news/schemas/new.schemas';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Bookmark.name, schema: BookmarkSchema },
      { name: 'Article', schema: ArticleSchema },
    ]),
  ],
  controllers: [BookmarkController],
  providers: [BookmarkService],
  exports: [BookmarkService],
})
export class BookmarkModule {}