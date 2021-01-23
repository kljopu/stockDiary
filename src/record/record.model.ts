import { BaseModel } from "src/shared/base.model";
import { Entity, Column, OneToMany, ManyToOne, RelationId, OneToOne, JoinColumn, PrimaryGeneratedColumn } from "typeorm";
import { ObjectType, Field, InputType, Float } from "@nestjs/graphql";
import { User } from "src/user/user.model";
import { Stock } from "./stock.model";

@ObjectType()
@Entity()
@InputType('RecordInputType', { isAbstract: true })
export class Record extends BaseModel {
    @PrimaryGeneratedColumn('increment')
    @Field(() => Number)
    id!: number

    @Column()
    @Field((_) => String)
    title!: string

    @Column()
    @Field((_) => String)
    contents!: string

    @OneToMany(
        () => Asset,
        (assets) => assets.record,
        { cascade: ['insert'] }
    )
    @Field((_) => [Asset])
    assets: Asset[]

    @ManyToOne(
        () => User,
        user => user.records
    )
    @Field((_) => User)
    user: User

    @RelationId((record: Record) => record.user)
    userId: number
}

@Entity()
@ObjectType()
@InputType('AssetInputType', { isAbstract: true })
export class Asset extends BaseModel {
    @PrimaryGeneratedColumn('increment')
    @Field(() => Number)
    id!: number

    @ManyToOne(() => Stock, stock => stock.investedIn)
    @Field(() => Stock)
    stock: Stock

    @RelationId((asset: Asset) => asset.stock)
    stockId: number

    @Column({ type: "double precision" })
    @Field((_) => Number)
    bidPrice?: number

    @Column()
    @Field((_) => Number)
    quantity!: number

    @Column({ type: "decimal", nullable: true })
    @Field((_) => Number)
    currentPrice: number

    @Column("decimal", { precision: 3, nullable: true })
    @Field((_) => Float)
    yield: number

    @ManyToOne(
        () => Record,
        (record) => record.assets
    )
    @Field((_) => Record)
    record: Record

    @RelationId((assets: Asset) => assets.record)
    recordId: number
}
