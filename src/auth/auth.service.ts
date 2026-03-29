import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
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
    @InjectRepository(RefreshTokens)
    private refreshTokenRepository: Repository<RefreshTokens>,
  ) {}

  async validateUser(username: string, pass: string) {
    const user = await this.usersService.findUserByLogin(username);
    const hashedPassword = hashdata(pass);
    if (user && user.password === hashedPassword) {
      const { password, ...result } = user;
      // const _password = password;
      return result;
    }
    return null;
  }

  async login(user: User) {
    const payload = { userName: user.login, sub: user.id };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = hashdata(accessToken);
    await this.refreshTokenRepository.update(
      { userId: user.id },
      { isActive: false },
    );
    await this.refreshTokenRepository.insert({
      userId: user.id,
      token: refreshToken,
      isActive: true,
    });
    return {
      user,
      accessToken,
      refresh_token: hashdata(accessToken),
    };
  }

  async refreshToken(user: User, refreshTokenBody: { refresh_token: string }) {
    const currentToken = await this.refreshTokenRepository.findOneBy({
      userId: user.id,
      token: refreshTokenBody.refresh_token,
    });
    if (
      !currentToken ||
      currentToken.isActive === false ||
      !(
        Math.floor(Date.now() / 1000) <
        Math.floor(new Date(currentToken.createdAt).getTime() / 1000) +
          10 * 24 * 3600
      )
    ) {
      await this.refreshTokenRepository.update(
        { userId: user.id },
        { isActive: false },
      );
      throw new HttpException(
        'You have to authorized again',
        HttpStatus.UNAUTHORIZED,
      );
    } else {
      await this.refreshTokenRepository.update(
        { userId: user.id },
        { isActive: false },
      );
      return await this.login(user);
    }
  }
}
