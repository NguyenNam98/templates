import { Injectable, NestMiddleware } from '@nestjs/common'
import { createProxyMiddleware, RequestHandler } from 'http-proxy-middleware'
import { Request, Response, NextFunction } from 'express'
import {
  API_AUTH_PREFIX,
  API_MAIN_PREFIX,
  TOKEN_COOKIES,
} from '@/app.constant'

@Injectable()
export class ProxyMiddlewareAPI implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const API_DOMAIN = process.env.API_DOMAIN || 'http://localhost:9002'

    const GUI_DOMAIN = process.env.GUI_DOMAIN || 'http://localhost:9001'

    // Create a proxy middleware for API requests

    // Create a proxy middleware for frontend requests
    const frontendProxy: RequestHandler = createProxyMiddleware({
      target: GUI_DOMAIN,
      changeOrigin: true,
      onProxyReq: async (proxyReq, req) => {
        if (req.method !== 'GET' && req.body) {
          const bodyData = JSON.stringify(req.body)

          // Update the headers for content type and length
          proxyReq.setHeader('Content-Type', 'application/json')
          proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData))

          // Write the body data to the proxy request
          proxyReq.write(bodyData)
        }
      },
    })


    return frontendProxy(req, res, next)
  }
}
