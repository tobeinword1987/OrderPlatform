import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from 'src/config-service';
import { InjectRepository } from '@nestjs/typeorm';
import { RefreshTokens } from 'src/users/refreshTokens.entity';
import { Repository } from 'typeorm';
import { AuthService } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        @InjectRepository(RefreshTokens) private refreshToken: Repository<RefreshTokens>,
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

    async validate(request: { body: { refreshToken: string }}, payload: any) {
        const userId = payload.sub;
        console.log('!!!!~~~###$%%%%%%####~~~!!!!!', request.body);
        if (payload.exp > Date.now()) {
            const token = await this.refreshToken.findOne({ where: { userId, isActive: true } });
            console.log('!!!!~~~#######~~~!!!!!');
            if (!token) {
                throw new HttpException('You need to authorized again', HttpStatus.UNAUTHORIZED);
            } else {
                if (Math.floor(Date.now() / 1000) > (Math.floor((new Date(token.createdAt)).getTime() / 1000) + 10 * 24 * 3600)) {
                    console.log('!!!!~~~~~~~!!!!!');
                    await this.refreshToken.update({ userId, isActive: true }, { isActive: false });
                    throw new HttpException('You need to authorized again', HttpStatus.UNAUTHORIZED);
                } else {
                    console.log('!!!!!!!!!!!!!!!!', payload);//?????????
                    await this.refreshToken.update({ userId, isActive: true }, { isActive: false });
                    await this.authService.login({ login: payload.userName, id: payload.sub });

                    return { userId: payload.sub, username: payload.username };
                }
            }
        } else {
            this.authService.refreshToken({ login: payload.userName, id: payload.sub }, request?.body.refreshToken);
            // return { userId: payload.sub, username: payload.username };
        }
    }
}
