import { Field, ObjectType } from "@nestjs/graphql"

@ObjectType()
export class CommonOutPut {
    @Field(type => Boolean)
    ok: boolean

    @Field(type => String, { nullable: true })
    message?: string

    @Field(type => String, { nullable: true })
    error?: string

    @Field(type => Number, { nullable: true })
    statusCode?: number
}