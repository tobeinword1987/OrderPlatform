import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
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

    async validate(request: { body: { refreshToken: string }, user?: string }, payload: any) {
        const userId = payload.sub;
        console.log('!!!!~~~###$%%%%%%####~~~!!!!!', request.body);
        const token = (await this.refreshToken.findOne({ where: { userId, isActive: true } }))?.token;
        console.log(payload.exp, Date.now() / 1000);
        if (payload.exp > Date.now() / 1000) {
            console.log('!!!!~~~#######~~~!!!!!');
            if (!token) {
                throw new HttpException('You need to authorized again', HttpStatus.UNAUTHORIZED);
            } else {
                return { login: payload.userName, id: payload.sub };
            }
        } else {
            const newToken = await this.authService.refreshToken({ login: payload.userName, id: payload.sub }, request?.body.refreshToken ?? token);
            console.log('))))))))', newToken);
            return newToken;
        }
    }
}
