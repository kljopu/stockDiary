import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { UserModule } from 'src/user/user.module';
import { PassportModule } from '@nestjs/passport'
import { JwtModule } from '@nestjs/jwt'
import { ConfigModule } from '@nestjs/config';
import { JwtStrategy, JwtStrategy2 } from './jwt.strategy'
import { JwtAuthGuard } from './jwt-auth.guard'
import { LocalStrategy } from './local.strategy'
import { User } from 'src/user/user.model';

@Module({
  imports: [
    forwardRef(() => UserModule),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'dev' ? '.dev.env' : '.test.env',
    }),
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.register({}),
  ],
  providers: [
    UserModule,
    AuthResolver,
    AuthService,
    AuthResolver,
    JwtStrategy,
    JwtStrategy2,
    JwtAuthGuard,
    LocalStrategy,
  ],
})
export class AuthModule { }