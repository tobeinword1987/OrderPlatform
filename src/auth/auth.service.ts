import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { hashdata } from '../utils/helper';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { RefreshTokens } from 'src/users/refreshTokens.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectRepository(RefreshTokens) private refreshTokenRepository: Repository<RefreshTokens>
  ) { }

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findUserByLogin(username);
    console.log('~~~~~~~~~~~~~~~~', user);
    const hashedPassword = hashdata(pass);
    console.log('~~~~~~~~~~~~~~~~', user?.password, hashedPassword);
    if (user && user.password === hashedPassword) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: { login: string, id: string }) {
    const payload = { userName: user.login, sub: user.id };
    console.log(user, '***', payload);
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = hashdata(accessToken);
    console.log(await this.refreshTokenRepository.insert({ userId: user.id, token: refreshToken, isActive: true }))
    return {
      accessToken,
      refresh_token: hashdata(accessToken)
    };
  }

  async refreshToken(user: { login: string, id: string }, refreshToken: string) {
    console.log('refreshToken', refreshToken)
    const currentToken = await this.refreshTokenRepository.findOneBy({userId: user.id, token: refreshToken});
    if (!currentToken || currentToken.isActive === false) {
      await this.refreshTokenRepository.update({ userId: user.id }, { isActive: false });
    } else {
      this.login(user);
    }
  }
}
