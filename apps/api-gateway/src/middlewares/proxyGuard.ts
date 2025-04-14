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
    console.log('process.env.API_DOMAIN', process.env.API_DOMAIN)
    const API_DOMAIN = process.env.API_DOMAIN || 'http://localhost:9002'

    const GUI_DOMAIN = process.env.GUI_DOMAIN || 'http://localhost:9001'

    // Create a proxy middleware for API requests
    const apiProxyGuard: RequestHandler = createProxyMiddleware({
      target: API_DOMAIN,
      changeOrigin: true,
      onProxyReq: (proxyReq, req) => {
        try {
          proxyReq.setHeader(
            'decoded-token',
            JSON.stringify(req[TOKEN_COOKIES.decodedToken]) || '',
          )

          if (req.method !== 'GET' && req.body) {
            const bodyData = JSON.stringify(req.body)

            const contentType = req.headers['content-type'] || ''

            if (contentType.includes('multipart/form-data')) {
              // Do not modify the body or headers if it's a multipart/form-data request
              // The body is already correctly formatted and handled by the request stream
              return
            }
            // Update the headers for content type and length
            proxyReq.setHeader('Content-Type', 'application/json')
            proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData))

            // Write the body data to the proxy request
            proxyReq.write(bodyData)
          }
        } catch {
          console.log('error in decoded token')
        }
      },
    })

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

    const apiProxyGuardAuth: RequestHandler = createProxyMiddleware({
      target: API_DOMAIN,
      changeOrigin: true,
      onProxyReq: (proxyReq, req) => {
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

    if (req.originalUrl.startsWith(API_AUTH_PREFIX)) {
      console.log('api auth proxy url', req.originalUrl)
      return apiProxyGuardAuth(req, res, next)
    }
    // Route requests based on URL path
    if (req.originalUrl.startsWith(API_MAIN_PREFIX)) {
      console.log('main proxy url', req.originalUrl)
      return apiProxyGuard(req, res, next)
    }

    console.log('gui proxy url', req.originalUrl)
    return frontendProxy(req, res, next)
  }
}
