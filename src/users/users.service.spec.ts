import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';

describe('Users', () => {
  let provider: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService],
    }).compile();

    provider = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  it('should return list of users', () => {
    const users = provider.listUsers();
    expect(users).toBeInstanceOf(Array);
    expect(users).toHaveLength(2);
  });
});
