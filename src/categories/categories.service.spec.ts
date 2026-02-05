import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './categories.service';

describe('CategoriesService', () => {
  let provider: CategoriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CategoriesService],
    }).compile();

    provider = module.get<CategoriesService>(CategoriesService);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
