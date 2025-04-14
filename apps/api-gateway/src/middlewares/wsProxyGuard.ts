import { Injectable, NestMiddleware } from '@nestjs/common'
import { createProxyMiddleware } from 'http-proxy-middleware'

@Injectable()
export class WebSocketProxyMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    const wsProxy = createProxyMiddleware('/ws', {
      target: `ws://${process.env.GUI_DOMAIN}`, // Target WebSocket server
      changeOrigin: true, // Needed for virtual hosted sites
      ws: true, // Enable proxying of WebSocket connections
      logLevel: 'debug', // Optional, to debug and see the proxy activity
    })

    wsProxy(req, res, next)
  }
}
