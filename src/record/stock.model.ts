import { ObjectType, Field } from "@nestjs/graphql"
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm"
import { BaseModel } from "src/shared/base.model"
import { Asset } from "./record.model"

@ObjectType()
@Entity()
export class Stock extends BaseModel {
    @PrimaryGeneratedColumn('increment')
    @Field(() => Number)
    id!: number

    @Column({ unique: true })
    @Field((_) => String)
    ticker!: string

    @Column()
    @Field((_) => String)
    name: string

    @OneToMany(
        () => Asset,
        (asset) => asset.stock,
    )
    @Field(() => Asset)
    investedIn: Asset
}