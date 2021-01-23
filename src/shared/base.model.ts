import {
    Column,
    CreateDateColumn,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    BaseEntity,
} from 'typeorm';
import { Field } from '@nestjs/graphql';

export abstract class BaseModel extends BaseEntity {
    @CreateDateColumn()
    // @Column({ type: "timestamp" })
    createAt!: Date

    @UpdateDateColumn()
    // @Column({ type: "timestamp" })
    updateAt!: Date

    @DeleteDateColumn()
    // @Column({ type: "timestamp" })
    deletedAt!: Date
}