import { Injectable, NestMiddleware } from '@nestjs/common'
import { Request, Response, NextFunction } from 'express'
import { AuthenticationService } from 'src/services/authentication.service'

import {
  isAdminUrl,
  isApiUrl,
  isAuthUrl,
  isPublicUrl,
  isStaticUrl,
  isSuperAdminUrl,
  isUserUrl,
} from 'src/utils/helpers'
import { AxiosRequestHeaders } from 'axios'
import { ACCESS_TOKEN_LIFE_TIME, TOKEN_COOKIES } from '@/app.constant'
import {
  accessTokenPayload,
  JWTTokenService,
  Role,
  StatusType,
} from '@/services/JWTToken.service'
@Injectable()
export class ProtectedGuardMiddlewareAPI implements NestMiddleware {
  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly jwtTokenService: JWTTokenService,
  ) {}
  async use(req: Request, res: Response, next: NextFunction) {
    // auth url => next()
    // public url => next()
    // api url => check token and attach to req[TOKEN_COOKIES.decodedToken] even error
    // GUI URL => check token and attach to req[TOKEN_COOKIES.decodedToken] error => redirect to login
    if (isAuthUrl(req.originalUrl) || isStaticUrl(req.originalUrl)) {
      return next()
    }

    if (
      !req.cookies[TOKEN_COOKIES.accessToken] &&
      !req.cookies[TOKEN_COOKIES.refreshToken]
    ) {
      // case api still continue
      if (isApiUrl(req.originalUrl)) {
        req[TOKEN_COOKIES.decodedToken] = {}
        return next()
      }
      // case public url still continue
      if (isPublicUrl(req.originalUrl)) {
        return next()
      }
      // case GUI url redirect to log-in
      return res.redirect('/login')
    }
    // Call API to validate the token
    const resultValidateToken = this.jwtTokenService.verifyAccessToken(
      req.cookies[TOKEN_COOKIES.accessToken],
    )

    if (!resultValidateToken) {
      if (!req.cookies[TOKEN_COOKIES.refreshToken]) {
        return this.handleUnAuthorised(req, res, next)
      }
      const resultValidateRefreshToken =
        await this.authenticationService.refreshToken(
          req.headers as AxiosRequestHeaders,
        )
      // case refresh token invalid
      if (resultValidateRefreshToken.error) {
        return this.handleUnAuthorised(req, res, next)
      }

      // set new access token
      res.cookie(
        TOKEN_COOKIES.accessToken,
        resultValidateRefreshToken.data.ats,
        {
          httpOnly: true,
          secure: process.env.ENV !== 'develop',
          domain:
            process.env.ENV === 'develop'
              ? 'localhost'
              : process.env.CHAT_ASSIST_DOMAIN,
          maxAge: ACCESS_TOKEN_LIFE_TIME,
        },
      )

      return this.handleAuthorised(
        req,
        res,
        next,
        resultValidateRefreshToken.data.attributes,
      )
    }

    if (isPublicUrl(req.originalUrl)) {
      return res.redirect('/')
    }

    return this.handleAuthorised(req, res, next, resultValidateToken)
  }
  handleUnAuthorised(req: Request, res: Response, next: NextFunction) {
    // clear cookies if both token is invalid
    res.clearCookie(TOKEN_COOKIES.accessToken, {
      domain: process.env.CM_DOMAIN,
    })
    res.clearCookie(TOKEN_COOKIES.refreshToken, {
      domain: process.env.CM_DOMAIN,
    })
    res.clearCookie(TOKEN_COOKIES.session2FA, {
      domain: process.env.CM_DOMAIN,
    })
    // api will handle unauthorised
    if (isApiUrl(req.originalUrl)) {
      req[TOKEN_COOKIES.decodedToken] = {}
      return next()
    }
    // if GUI url redirect to log in page
    return res.redirect('/login')
  }

  getDefaultRedirectRoute = (role: Role) => {
    if (role === Role.SuperAdmin) {
      return '/super'
    }
    if (role === Role.Admin) {
      return '/management'
    }
    return '/chat'
  }

  handleAuthorised(
    req: Request,
    res: Response,
    next: NextFunction,
    resultValidateToken: accessTokenPayload,
  ) {
    req[TOKEN_COOKIES.decodedToken] = resultValidateToken
    if (
      req.originalUrl.startsWith('/temporary-password') &&
      resultValidateToken.userStatus !== StatusType.inactive
    ) {
      return res.redirect('/')
    }
    if (
      !req.originalUrl.startsWith('/temporary-password') &&
      resultValidateToken.userStatus === StatusType.inactive &&
      !isApiUrl(req.originalUrl)
    ) {
      return res.redirect('/temporary-password')
    }

    let isRedirect = false
    if (
      isSuperAdminUrl(req.originalUrl) &&
      resultValidateToken.role !== Role.SuperAdmin
    ) {
      isRedirect = true
    }

    if (
      isAdminUrl(req.originalUrl) &&
      resultValidateToken.role !== Role.Admin
    ) {
      isRedirect = true
    }
    if (
      isUserUrl(req.originalUrl) &&
      resultValidateToken.role !== Role.User &&
      resultValidateToken.role !== Role.SuperUser
    ) {
      isRedirect = true
    }

    if (isRedirect || req.originalUrl === '/' || req.originalUrl === '') {
      return res.redirect(
        this.getDefaultRedirectRoute(resultValidateToken.role),
      )
    }
    return next()
  }
}
