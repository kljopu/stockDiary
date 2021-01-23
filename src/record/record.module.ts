import { Module, forwardRef } from '@nestjs/common';
import { RecordResolver } from './record.resolver';
import { RecordService } from './record.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Record, Asset } from './record.model';
import { UserModule } from 'src/user/user.module';
import { Stock } from './stock.model';

@Module({
  imports: [
    TypeOrmModule.forFeature([Record, Asset, Stock]),
    forwardRef(() => UserModule)
  ],
  providers: [RecordResolver, RecordService],
  exports: [RecordService, TypeOrmModule]
})
export class RecordModule { }
