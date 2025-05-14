import { Test, TestingModule } from '@nestjs/testing';
import { BookmarkController } from './bookmarks.controller';
import { BookmarkService } from './bookmarks.service';

describe('BookmarkController', () => {
  let controller: BookmarkController;
  let service: BookmarkService;

  const mockBookmarkService = {
    getUserBookmarks: jest.fn().mockResolvedValue(['article1', 'article2']),
    addBookmark: jest.fn().mockResolvedValue({ success: true, message: 'Article bookmarked successfully' }),
    removeBookmark: jest.fn().mockResolvedValue({ success: true, message: 'Bookmark removed successfully' }),
    isBookmarked: jest.fn().mockResolvedValue({ isBookmarked: true }),
  };

  const mockReq = { userId: 'user123' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookmarkController],
      providers: [
        { provide: BookmarkService, useValue: mockBookmarkService },
      ],
    }).compile();

    controller = module.get<BookmarkController>(BookmarkController);
    service = module.get<BookmarkService>(BookmarkService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get user bookmarks', async () => {
    const result = await controller.getUserBookmarks(mockReq);
    expect(result).toEqual(['article1', 'article2']);
    expect(service.getUserBookmarks).toHaveBeenCalledWith('user123');
  });

  it('should add a bookmark', async () => {
    const body = { articleId: 'article456' };
    const result = await controller.addBookmark(mockReq, body);
    expect(result).toEqual({ success: true, message: 'Article bookmarked successfully' });
    expect(service.addBookmark).toHaveBeenCalledWith('user123', 'article456');
  });

  it('should remove a bookmark', async () => {
    const result = await controller.removeBookmark(mockReq, 'article456');
    expect(result).toEqual({ success: true, message: 'Bookmark removed successfully' });
    expect(service.removeBookmark).toHaveBeenCalledWith('user123', 'article456');
  });

  it('should check if an article is bookmarked', async () => {
    const result = await controller.isBookmarked(mockReq, 'article456');
    expect(result).toEqual({ isBookmarked: true });
    expect(service.isBookmarked).toHaveBeenCalledWith('user123', 'article456');
  });
});