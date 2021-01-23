import { UseGuards } from '@nestjs/common';
import { Resolver, Mutation, Args, Query, Int } from '@nestjs/graphql';
import { CommonOutPut } from 'src/shared/util/common.dto';
import {
    SharesOutPutDTO,
    RecordListOutputDTO,
    StockCreateOutPutDTO,
    RecordCreateOutputDTO,
    RecordRetrieveOutputDTO,
} from './dto/output.dto';
import {
    StockInputDTO,
    RecordGetInputDTO,
    RecordEditInputDTO,
    RecordCreateInputDTO
} from './dto/input.dto';
import { RecordService } from './record.service';
import { ReqGql, GqlUser } from 'src/shared/util/decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Resolver()
export class RecordResolver {
    constructor(
        private readonly recordService: RecordService
    ) { }

    @UseGuards(JwtAuthGuard)
    @Mutation(returns => RecordCreateOutputDTO)
    async createRecord(
        @Args('input') input: RecordCreateInputDTO,
        @ReqGql() req: any
    ): Promise<RecordCreateOutputDTO> {
        try {
            const user = req.user
            return await this.recordService.createRecord(input, user)
        } catch (error) {
            return error
        }
    }

    @UseGuards(JwtAuthGuard)
    @Query(returns => RecordListOutputDTO)
    async getMyRecords(
        @ReqGql() req: any
    ): Promise<RecordRetrieveOutputDTO> {
        try {
            const user = req.user
            return await this.recordService.getRecords(user)
        } catch (error) {
            return error
        }
    }

    @UseGuards(JwtAuthGuard)
    @Query(returns => RecordRetrieveOutputDTO)
    async getMyRecord(
        @Args('id', { type: () => Int }) id: number,
        @ReqGql() req: any
    ): Promise<RecordRetrieveOutputDTO> {
        try {
            return await this.recordService.getRecord(id, req.user)
        } catch (error) {
            return error
        }
    }

    @UseGuards(JwtAuthGuard)
    @Mutation(returns => SharesOutPutDTO)
    async getStocks(): Promise<SharesOutPutDTO> {
        try {
            return await this.recordService.getStocks()
        } catch (error) {
            return error
        }
    }

    @UseGuards(JwtAuthGuard)
    @Mutation(returns => StockCreateOutPutDTO)
    async createShare(
        @Args('input') input: StockInputDTO
    ): Promise<any> {
        try {
            return await this.recordService.createStock(input)
        } catch (error) {
            return {
                error
            }
        }
    }

    @UseGuards(JwtAuthGuard)
    @Mutation(returns => RecordRetrieveOutputDTO)
    async editMyRecord(
        @Args('input') input: RecordEditInputDTO,
        @ReqGql() req: any
    ): Promise<RecordRetrieveOutputDTO> {
        try {
            const user = req.user
            return await this.recordService.editMyRecord(input, user)
        } catch (error) {
            return error
        }
    }

    @UseGuards(JwtAuthGuard)
    @Mutation(returns => CommonOutPut)
    async deleteMyRecord(
        @Args('id', { type: () => Int }) id: number,
        @ReqGql() req: any
    ): Promise<CommonOutPut> {
        try {
            return await this.recordService.deleteRecord(id, req.user)
        } catch (error) {
            return error
        }
    }

    @UseGuards(JwtAuthGuard)
    @Mutation(returns => CommonOutPut)
    async deleteInvestDetail(
        @Args('id', { type: () => Int }) id: number,
        @ReqGql() req: any
    ): Promise<CommonOutPut> {
        try {
            return await this.recordService.deleteInvestedIn(id, req.user)
        } catch (error) {
            return error
        }
    }
}
