import { InputType, Field, PickType, ObjectType } from "@nestjs/graphql";

@InputType()
export class SignUpInputDTO {
    @Field(() => String)
    email: string

    @Field(() => String)
    password: string
}

@InputType()
export class LoginInputDTO {
    @Field(() => String)
    email!: string

    @Field(() => String)
    password!: string
}