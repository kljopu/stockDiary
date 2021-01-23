import * as path from 'path';
import * as Joi from 'joi'
import { Module } from '@nestjs/common';
import { AppService } from './app/app.service'
import { AppResolver } from './app/app.resolver'
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserModule } from './user/user.module';
import { RecordService } from './record/record.service';
import { RecordModule } from './record/record.module';
import { ConfigModule } from '@nestjs/config'
import { GraphQLModule, GqlModuleOptions } from '@nestjs/graphql';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('dev', 'production', 'test')
          .required(),
        JWT_SECRET: Joi.string().required(),
      }),
      envFilePath: process.env.NODE_ENV === 'dev' ? '.dev.env' : '.test.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      port: 5432,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      synchronize: true,
      entities: [`${path.join(__dirname, '/', '**')}/*.model.[tj]s`],
      host: process.env.DB_HOST,
      keepConnectionAlive: true
    }),
    GraphQLModule.forRootAsync({
      useFactory: () => {
        const schemaModuleOptions: Partial<GqlModuleOptions> = {};

        // If we are in development, we want to generate the schema.graphql
        if (process.env.NODE_ENV !== 'production' || process.env.IS_OFFLINE) {
          schemaModuleOptions.autoSchemaFile = 'schema.graphql';
          schemaModuleOptions.debug = true;
        } else {
          // For production, the file should be generated
          schemaModuleOptions.typePaths = ['dist/schema.graphql'];
        }

        schemaModuleOptions.uploads = {
          maxFileSize: 10000000, // 10 MB
          maxFiles: 5,
        };

        schemaModuleOptions.formatError = (error) => {
          console.log(error.message);
          return error;
        };

        return {
          context: ({ req }) => ({ req }),
          installSubscriptionHandlers: true,
          sortSchema: true,
          playground: true, // Allow playground in production
          introspection: true, // Allow introspection in production
          ...schemaModuleOptions,
        };
      },
    }),
    UserModule,
    AuthModule,
    RecordModule,
    MailModule,
  ],
  providers: [
    AppService,
    AppResolver,
    RecordService,
  ],
})
export class AppModule { }
