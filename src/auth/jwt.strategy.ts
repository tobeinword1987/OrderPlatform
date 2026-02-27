import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RefreshTokens } from 'src/users/refreshTokens.entity';
import { Repository } from 'typeorm';
import { AuthService } from './auth.service';
import { hashdata } from 'src/utils/helper';
import { User } from 'src/users/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        @InjectRepository(RefreshTokens) private refreshTokenRepository: Repository<RefreshTokens>,
        @InjectRepository(User) private userRepository: Repository<User>,
        private authService: AuthService
    ) {
        console.log(process.env['JWT_SECRET']);
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: true,
            passReqToCallback: true,
            secretOrKey: process.env['JWT_SECRET'] || '',
        });
    }

    async validate(request: any, payload: any) {
        const userId = payload.sub;
        const user = await this.userRepository.findOneByOrFail({ id: userId })
        const accessToken = request.headers.authorization.slice(7);
        const token = (await this.refreshTokenRepository.findOne({ where: { userId, isActive: true, token: hashdata(accessToken) } }))?.token;
        if (payload.exp > Date.now() / 1000) {
            if (!token) {
                throw new HttpException('You need to authorized again', HttpStatus.UNAUTHORIZED);
            } else {
                return user;
            }
        } else {
            console.log('Access token was expired, please refresh it with refreshToken', request.body);
            if(request.body['refresh_token']) {
                return user;
            } else
            throw new HttpException('Access token was expired, please refresh it with refreshToken', HttpStatus.UNAUTHORIZED);
            // console.log('^^^^^^', accessToken, '****', hashdata(accessToken));
            // await this.authService.refreshToken({ login: payload.userName, id: payload.sub } as User, request?.body?.refreshToken ?? token);
            // return user;
        }
    }
}
