import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';

describe('ProductsService', () => {
  let provider: ProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductsService],
    }).compile();

    provider = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
