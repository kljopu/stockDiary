import { User } from "../user/user.model"
import { UserService } from "../user/user.service"
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly userService: UserService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET,
        })
    }

    async validate(payload: any): Promise<User> {
        try {
            console.log("payload", payload);
            const email = payload.email;
            const user: User = await this.userService.findByEmail(email);
            if (!user) {
                throw new UnauthorizedException()
            }
            return user;
        } catch (error) {
            console.log("here");
            throw new UnauthorizedException('Unauthorized');
        }
    }
}

@Injectable()
export class JwtStrategy2 extends PassportStrategy(Strategy, 'refreshToken') {
    constructor(
        private readonly userService: UserService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_REFRESH_SECRET,
        })
    }
    async validate(payload: any): Promise<User> {
        try {
            const email = payload.email;
            const user: User = await this.userService.findByEmail(email);
            if (!user) {
                throw new UnauthorizedException()
            }
            return user;
        } catch (error) {
            throw new UnauthorizedException('Unauthorized');
        }
    }
}