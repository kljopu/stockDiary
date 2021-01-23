import * as stock_info from "stock-info"
import { Repository } from 'typeorm';
import {
    Injectable,
    NotFoundException,
    InternalServerErrorException,
    UnauthorizedException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Stock } from './stock.model';
import { Record, Asset } from './record.model';
import { UserService } from 'src/user/user.service';
import { StockOutputDTO, SharesOutPutDTO } from './dto/output.dto';


@Injectable()
export class RecordService {
    constructor(
        @InjectRepository(Asset)
        private readonly assets: Repository<Asset>,
        @InjectRepository(Record)
        private readonly records: Repository<Record>,
        @InjectRepository(Stock)
        private readonly stocks: Repository<Stock>,
        private readonly userService: UserService,

    ) { }

    async getStocks(): Promise<SharesOutPutDTO> {
        try {
            var stockList = []
            var stocks = await this.stocks.find()
            if (!stocks) {
                throw new NotFoundException()
            }
            for (var element of stocks) {
                const stockOutput = new StockOutputDTO()
                stockOutput.id = element.id
                stockOutput.ticker = element.ticker
                stockOutput.name = element.name
                const info = await stock_info.getStocksInfo([`${element.ticker}`])
                stockOutput.price = info[0].regularMarketPrice
                stockOutput.createdAt = element.createAt
                stockOutput.updatedAt = element.updateAt
                stockList.push(stockOutput)
            }
            return {
                ok: true,
                statusCode: 200,
                stocks: stockList
            }
        } catch (error) {
            return {
                ok: false,
                error: error.response.error,
                statusCode: error.response.statusCode,
                message: error.response.message,
                stocks: null
            }
        }
    }

    async createStock(input): Promise<any> {
        try {
            const { ticker, name } = input
            const stock = await this.stocks.create({
                ticker,
                name
            }).save()
            return {
                ok: true,
                statusCode: 200,
                stock: stock
            }
        } catch (error) {
            return {
                ok: false,
                error: error.response.error,
                statusCode: error.response.statusCode,
                message: error.response.message,
                stock: null
            }
        }
    }

    async createRecord(input, user): Promise<any> {
        try {
            const { title, contents, assetDetail } = input
            var assets: Asset[] = []
            for (var elemant of assetDetail) {
                var asset = new Asset()
                var investedStock = await this.stocks.findOne({ id: elemant.stock_id })
                var investedStockInfo = await stock_info.getStocksInfo([`${investedStock.ticker}`])
                const stockYield = await Number(((investedStockInfo[0].regularMarketPrice - elemant.bidPrice) / elemant.bidPrice).toPrecision(2))
                asset.stock = investedStock
                asset.quantity = elemant.quantity
                asset.bidPrice = elemant.bidPrice
                asset.currentPrice = investedStockInfo[0].regularMarketPrice
                asset.yield = stockYield
                assets.push(asset)
            }
            const record = await this.records.save(
                this.records.create({
                    title,
                    contents,
                    user,
                    assets: assets
                })
            )
            return {
                ok: true,
                statusCode: 200,
                record: record
            }
        } catch (error) {
            return {
                ok: false,
                error: error.response.error,
                statusCode: error.response.statusCode,
                message: error.response.message,
                record: null
            }
        }
    }

    async getRecords(user): Promise<any> {
        try {
            const record = await this.records.find({
                where: { user: user }
            }).catch(() => {
                throw new InternalServerErrorException()
            })
            if (record[0] === undefined) throw new NotFoundException('Record Not Found')
            return {
                ok: true,
                statusCode: 200,
                record
            }
        } catch (error) {
            return {
                ok: false,
                statusCode: error.response.statusCode,
                error: error.response.error,
                record: null,
                message: error.response.message
            }
        }
    }

    async getRecord(id, user): Promise<any> {
        try {
            const record = await this.records.find({
                where: { user: user, id: id },
                relations: ["assets", "assets.stock"]
            }).catch(() => {
                throw new InternalServerErrorException()
            })
            if (record[0] === undefined) throw new NotFoundException('Record Not Found')
            return {
                ok: true,
                statusCode: 200,
                record
            }
        } catch (error) {
            return {
                ok: false,
                statusCode: error.response.statusCode,
                error: error.response.error,
                record: null,
                message: error.response.message
            }
        }
    }

    async editMyRecord(input, user): Promise<any> {
        try {
            const { record_id } = input
            const { stock_id, quantity, bidPrice } = input.assetDetail
            const record = await this.records.findOne({
                where: { user, id: record_id },
                relations: ["assets", "assets.stock"]
            }).catch((r) => {
                throw new InternalServerErrorException()
            })

            if (user.id !== record.userId) throw new UnauthorizedException()
            var investedStock = await this.stocks.findOne({ id: stock_id })
            var investedStockInfo = await stock_info.getStocksInfo([`${investedStock.ticker}`])
            const stockYield = await Number(((investedStockInfo[0].regularMarketPrice - bidPrice) / bidPrice).toPrecision(2))
            const newInvestedIn = await this.assets.create({
                stock: investedStock,
                quantity: quantity,
                bidPrice: bidPrice,
                currentPrice: investedStockInfo[0].regularMarketPrice,
                yield: stockYield,
                record: record
            }).save().catch((r) => {
                throw new InternalServerErrorException()
            })
            record.assets.push(newInvestedIn)
            await this.records.save(record)
            return {
                ok: true,
                statusCode: 200,
                record: [record]
            }
        } catch (error) {
            return {
                ok: false,
                error: error.response.error,
                statusCode: error.response.statusCode,
                record: null,
                message: error.response.message
            }
        }
    }

    async deleteRecord(id, user): Promise<any> {
        try {
            const record = await this.records.findOne(id)
            if (!record) throw new NotFoundException()
            if (record.userId !== user.id) throw new UnauthorizedException()
            record.softRemove().catch(() => {
                throw new InternalServerErrorException()
            })

            return {
                ok: true,
                statusCode: 200
            }
        } catch (error) {
            return {
                ok: false,
                error: error.response.error,
                statusCode: error.response.statusCode,
                message: error.response.message
            }
        }
    }

    async deleteInvestedIn(id, user): Promise<any> {
        try {
            const asset = await this.assets.findOne(id, { relations: ["record"] }).catch(
                (err) => {
                    throw new InternalServerErrorException()
                })
            if (!asset) throw new NotFoundException()
            if (asset.record.userId !== user.id) throw new UnauthorizedException()
            asset.softRemove()
            return {
                ok: true,
                statusCode: 200
            }
        } catch (error) {
            return {
                ok: false,
                error: error.response.error,
                statusCode: error.response.statusCode,
                message: error.response.message
            }
        }
    }
}
