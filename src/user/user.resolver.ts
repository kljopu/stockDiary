import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { UserService } from './user.service';
import { CommonOutPut } from 'src/shared/util/common.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ReqGql } from 'src/shared/util/decorator';

@Resolver()
export class UserResolver {
    constructor(
        private readonly userService: UserService
    ) { }

    @Mutation(returns => CommonOutPut)
    async EmailForchangePassword(
        @Args('email', { type: () => String }) email: string
    ): Promise<any> {
        try {
            return await this.userService.emailForChangePassword(email)
        } catch (error) {
            return error
        }
    }

    @Mutation(returns => CommonOutPut)
    async changePassword(
        @Args('email', { type: () => String }) email: string,
        @Args('code', { type: () => Number }) code: number,
        @Args('newPassword', { type: () => String }) newPassword: string,
    ): Promise<CommonOutPut> {
        try {
            return await this.userService.changePassword(email, code, newPassword)
        } catch (error) {
            return error
        }
    }
}
