import { Injectable, NestMiddleware, HttpStatus } from '@nestjs/common'
import { Request, Response, NextFunction } from 'express'
import { AppError } from './app.exception'
@Injectable()
export class AppMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    try {
      next()
    } catch (e) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        data: {},
        error: AppError.EUA001,
        message: 'Unauthorized',
      })
    }
  }
}
