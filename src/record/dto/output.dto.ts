import { CommonOutPut } from "src/shared/util/common.dto";
import { ObjectType, Field } from "@nestjs/graphql";
import { Record, Asset } from "../record.model";
import { Stock } from "../stock.model"

// for injection
@ObjectType()
export class StockOutputDTO {
    @Field(() => Number)
    id: number

    @Field((_) => String)
    ticker!: string

    @Field(() => String)
    name: string

    @Field(() => Number)
    price: number

    @Field(() => Date)
    createdAt: Date

    @Field(() => Date)
    updatedAt: Date
}

@ObjectType()
export class AssetOutput {
    @Field(() => Number)
    id: number

    @Field(() => StockOutputDTO)
    stock: StockOutputDTO

    @Field(() => Number)
    bidPrice: number

    @Field(() => Number)
    quantity: number

    @Field(() => Number)
    currentPrice: number

    @Field(() => Number)
    yield: number
}

@ObjectType()
export class RecordOutPut {
    @Field(() => Number)
    id: number

    @Field(() => String)
    title: string;

    @Field(() => String)
    contents: string

    @Field(() => Number)
    userId: number

    @Field(() => Date)
    createAt: Date

    @Field(() => Date)
    updateAt: Date

    @Field(() => [AssetOutput], { nullable: true })
    assets: AssetOutput[]
}

@ObjectType()
export class SharesOutPutDTO extends CommonOutPut {
    @Field(type => [StockOutputDTO])
    stocks: StockOutputDTO[]
}

@ObjectType()
export class StockCreateOutPutDTO extends CommonOutPut {
    @Field(() => Stock)
    stock: Stock
}

@ObjectType()
export class RecordCreateOutputDTO extends CommonOutPut {
    @Field(() => RecordOutPut, { nullable: true })
    record: RecordOutPut
}

@ObjectType()
export class RecordRetrieveOutputDTO extends CommonOutPut {
    @Field(() => [RecordOutPut], { nullable: true })
    record: RecordOutPut[]
}

@ObjectType()
export class RecordListOutputDTO extends CommonOutPut {
    @Field(() => [RecordOutPut], { nullable: true })
    record: RecordOutPut[]
}