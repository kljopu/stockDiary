import { Module, forwardRef } from '@nestjs/common';
import { UserResolver } from './user.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.model'
import { UserService } from './user.service';
import { AuthModule } from 'src/auth/auth.module';
import { RecordModule } from 'src/record/record.module';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    forwardRef(() => AuthModule),
    forwardRef(() => RecordModule),
    MailModule
  ],
  providers: [UserResolver, UserService],
  exports: [UserService, TypeOrmModule.forFeature([User])]
})
export class UserModule { }
