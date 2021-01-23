import { Injectable, BadRequestException, InternalServerErrorException, Inject, forwardRef, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { UserService } from "../user/user.service"
import { JwtService } from "@nestjs/jwt"
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/user.model';
import { Repository } from 'typeorm';
import { CommonOutPut } from 'src/shared/util/common.dto';
import { LoginInputDTO } from './dto/input.dto';
import { JwtOutputDto } from './dto/output.dto';
import { ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv'

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly users: Repository<User>,
        private jwtService: JwtService,
        private userService: UserService,
        private configService: ConfigService,
    ) { dotenv.config() }

    async createUser(input): Promise<CommonOutPut> {
        try {
            const { email, password } = input
            const exists = await this.users.findOne({ email })
            if (exists) throw new BadRequestException('User already exists')
            const user = await this.users.create(
                { email, password }
            ).save().catch((err) => {
                throw new InternalServerErrorException()
            })
            return {
                ok: true,
                message: "succeed"
            }
        } catch (error) {
            return {
                ok: false,
                message: error.response.message,
                error: error
            }
        }
    }

    async validateUser(email: string, password: string): Promise<any> {
        const user = await this.userService.findByEmail(email)
        if (!user.checkPassword(password)) {
            throw new BadRequestException("Password Not Matched")
        }
        return user
    }

    async login(input: LoginInputDTO) {
        try {
            const { email, password } = input
            const user = await this.userService.findByEmail(email)
            if (!user) throw new NotFoundException('User Not Found')
            console.log('password check: ', await user.checkPassword(password));
            if (await user.checkPassword(password) != true) throw new UnauthorizedException("Invalid Password")
            const payload = { email: user.email, id: user.id };
            const refreshToken = this.jwtService.sign(payload, {
                secret: process.env.JWT_REFRESH_SECRET,
                expiresIn: '7d'
            })
            const accessToken = this.jwtService.sign(payload, {
                secret: process.env.JWT_SECRET,
                expiresIn: '7h'
            })
            user.refreshToken = refreshToken
            user.save()
            return {
                ok: true,
                access_token: accessToken,
                refresh_token: refreshToken
            }
        } catch (error) {
            return {
                ok: false,
                message: error.response.message,
                error: error.error,
                access_token: null,
                refresh_token: null
            }
        }
    }

    async refresh(refresh, user): Promise<any> {
        try {
            if (refresh.authorization.split(" ")[1] !== user.refreshToken) throw new UnauthorizedException('Invalid Refresh Token')
            const newAccessToekn = await this.jwtService.sign({ email: user.email, id: user.id }, {
                secret: process.env.JWT_SECRET,
                expiresIn: '7d'
            })
            return {
                ok: true,
                statusCode: 200,
                access_token: newAccessToekn
            }
        } catch (error) {
            return {
                ok: false,
                statusCode: error.response.statusCode,
                access_token: null
            }
        }
    }
}
