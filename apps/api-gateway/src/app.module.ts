import {
  DynamicModule,
  Global,
  MiddlewareConsumer,
  Module,
} from '@nestjs/common'
import { AuthenticationService } from './services/authentication.service'
import { ProtectedGuardMiddlewareAPI } from './middlewares/protectedGuard'
import { ProxyMiddlewareAPI } from './middlewares/proxyGuard'
import { HttpModule } from '@nestjs/axios'
import { JWTTokenService } from './services/JWTToken.service'
import { WebSocketProxyMiddleware } from './middlewares/wsProxyGuard'
@Global()
@Module({
  imports: [HttpModule],
  providers: [AuthenticationService, JWTTokenService],
  exports: [AuthenticationService, JWTTokenService],
})
export class AppModule {
  static forRoot(modules): DynamicModule {
    return {
      module: AppModule,
      imports: [HttpModule, ...modules],
    }
  }
  configure(consumer: MiddlewareConsumer) {
    if (process.env.NODE_ENV === 'develop') {
      consumer.apply(WebSocketProxyMiddleware).forRoutes('/{*any}')
    }
    consumer
      .apply(ProtectedGuardMiddlewareAPI, ProxyMiddlewareAPI)
      .forRoutes('/{*any}')
  }
}
