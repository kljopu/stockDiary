import { ObjectType, Field } from "@nestjs/graphql";
import { CommonOutPut } from "src/shared/util/common.dto";

@ObjectType()
export class JwtOutputDto extends CommonOutPut {
    @Field(type => String, { nullable: true })
    access_token?: string

    @Field(type => String, { nullable: true })
    refresh_token: string
}