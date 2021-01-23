import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { UserService } from 'src/user/user.service';
import { AuthService } from './auth.service';
import { UseGuards, InternalServerErrorException } from '@nestjs/common';
import { SignUpInputDTO, LoginInputDTO } from './dto/input.dto';
import { CommonOutPut } from 'src/shared/util/common.dto';
import { User } from 'src/user/user.model';
import { JwtOutputDto } from './dto/output.dto';
import { GqlAuthGuard } from './gql.guard';
import { ReqGql } from 'src/shared/util/decorator';
import { JwtAuthGuard, RefreshJwtAuthGuard } from './jwt-auth.guard';
import { AuthGuard } from '@nestjs/passport';
import { JwtStrategy2 } from './jwt.strategy';

var filter = "win16|win32|win64|macintel|mac|"
@Resolver()
export class AuthResolver {
    constructor(
        private readonly userService: UserService,
        private readonly authService: AuthService
    ) { }

    @Mutation(returns => CommonOutPut)
    async createUser(
        @Args('input') input: SignUpInputDTO
    ): Promise<CommonOutPut> {
        try {
            return this.authService.createUser(input)
        } catch (error) {
            return error
        }
    }

    @Mutation(returns => JwtOutputDto)
    async login(
        @ReqGql() context,
        @Args('input') input: LoginInputDTO
    ): Promise<JwtOutputDto> {
        try {
            if (process.env.NODE_ENV !== 'test') {
                const user_agent = context.headers['user-agent']
                var device // false: PC, true: mobile
                console.log(context.headers['user-agent']);
                device = user_agent.match(/(iPhone|iPad|iPod|Android|Windows Phone|IEMobile|BlackBerry|Mobile Safari|Opera Mobi)/) ? true : false
                console.log(device);
                if (device === true || false) {
                    throw new InternalServerErrorException('Devices Not Supported')
                }
            }
            return this.authService.login(input)
        } catch (error) {
            console.log("in the rosolver", error);

            return error
        }
    }

    @UseGuards(RefreshJwtAuthGuard)
    @Query(returns => JwtOutputDto)
    async refresh(
        @ReqGql() req: any
    ): Promise<any> {
        try {
            return await this.authService.refresh(req.headers, req.user)
        } catch (error) {
            return error
        }
    }
}
