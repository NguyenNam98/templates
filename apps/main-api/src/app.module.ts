import {
  DynamicModule,
  Global,
  MiddlewareConsumer,
  Module,
} from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'
import { APP_GUARD } from '@nestjs/core'
import { XssProtectionMiddleware } from './middlewares/xssProtection'
import { JWTTokenService } from './services/JWTToken.service'
import { DatabaseModule } from './database.module'
import { CryptoService } from './services/crypto.service'
import { AppGuard } from '@/app.guard'
import { SendEmailService } from './services/sendEmail.service'

@Global()
@Module({})
export class AppModule {
  static forRoot(modules): DynamicModule {
    return {
      module: AppModule,
      imports: [
        DatabaseModule.forRoot(),
        HttpModule,
        ...modules,
      ],
      providers: [
        AppGuard,
        // {
        //   provide: APP_GUARD,
        //   useClass: ThrottlerGuard,
        // },
        {
          provide: APP_GUARD,
          useClass: AppGuard,
        },
        JWTTokenService,
        CryptoService,
        SendEmailService,
      ],
      exports: [JWTTokenService, CryptoService, SendEmailService],
    }
  }

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(XssProtectionMiddleware).forRoutes('/api/{*any}/')
  }
}
