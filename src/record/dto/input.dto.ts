import { InputType, Field, PickType } from "@nestjs/graphql";
import { Asset } from "../record.model";
import { Stock } from "../stock.model"

@InputType()
export class RecordInput {
    @Field(() => String)
    title: string

    @Field(() => String)
    contents: string
}

@InputType()
export class AssetInput extends PickType(Asset, ['bidPrice', 'quantity']) {
    @Field(() => Number)
    stock_id: number

    @Field((_) => Number)
    quantity!: number

    @Field(() => Number)
    bidPrice: number
}

@InputType()
export class RecordCreateInputDTO {
    @Field(() => String)
    title: string

    @Field(() => String)
    contents: string

    @Field(type => [AssetInput])
    assetDetail: AssetInput[]
}

@InputType()
export class StockInputDTO extends PickType(Stock, ['ticker', 'name']) {
    @Field((_) => String)
    ticker!: string

    @Field(() => String)
    name: string
}

@InputType()
export class StockFindInputDTO {
    @Field(() => Number, { nullable: true })
    id: number

    @Field(() => String, { nullable: true })
    ticker: string
}

@InputType()
export class RecordGetInputDTO {
    @Field(() => Number, { nullable: true })
    id?: number
}

@InputType()
export class RecordEditInputDTO {
    @Field(() => Number)
    record_id: number

    @Field(() => AssetInput)
    assetDetail: AssetInput
}