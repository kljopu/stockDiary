import * as bcryptjs from "bcryptjs"
import { Field, ObjectType, InputType } from '@nestjs/graphql';
import { BaseModel } from '../shared/base.model';
import { Column, Entity, OneToMany, BeforeInsert, OneToOne, JoinColumn, ManyToOne, PrimaryGeneratedColumn, BeforeUpdate } from 'typeorm';
import { IsEmail } from "class-validator"
import { InternalServerErrorException, BadRequestException } from "@nestjs/common";
import { Record } from "src/record/record.model";


@ObjectType()
@Entity()
@InputType('UserInputType', { isAbstract: true })
export class User extends BaseModel {
    @PrimaryGeneratedColumn('increment')
    @Field(() => Number)
    id!: number

    @IsEmail()
    @Column({ unique: true })
    @Field((_) => String)
    email!: string

    @Column()
    @Field((_) => String)
    password!: string

    @Column({ nullable: true })
    @Field(() => String)
    refreshToken: string

    @OneToMany(
        () => Record,
        (records) => records.user,
        { cascade: true }
    )
    @Field((_) => [Record])
    records: Record[]

    @Column({ nullable: true })
    @Field(() => Number)
    verificationCode: number

    @Column({ default: false })
    @Field(() => Boolean)
    isVerified: boolean

    @BeforeInsert()
    async savePassword(): Promise<void> {
        if (this.password) {
            try {
                this.password = await bcryptjs.hash(this.password, 10)
            } catch (error) {
                console.log(error);
                throw new InternalServerErrorException("Password Hassing Faild")
            }
        }
    }
    async checkPassword(aPassword: string): Promise<boolean> {
        try {
            const ok = await bcryptjs.compare(aPassword, this.password)
            return ok
        } catch (error) {
            console.log("err:", error);
            throw new InternalServerErrorException()
        }
    }

    @BeforeInsert()
    async checkReg(): Promise<void> {
        var regex = /^.*(?=^.{8,15}$)(?=.*\d)(?=.*[a-zA-Z])(?=.*[!@#$%^&+=]).*$/;
        if (!regex.test(this.password)) {
            throw new BadRequestException('Invalid RegExp')
        }
    }
}