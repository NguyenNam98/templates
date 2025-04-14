import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common'
import { ActiveAndUpdatePassword, AuthRegisterUserDto } from '@/dtos'
import { BaseAuthenticateService } from '../../services/authenticate/baseAuthenticate.service'

import * as process from 'process'
import {
  ACCESS_TOKEN_SIG_COOKIE,
  REFRESH_TOKEN_SIG_COOKIE,
} from '@/app.constant'
import {
  TRefreshTokenResponseDTO,
  TRegisterResponseDTO,
} from '@/app.typing'
import { Cookies } from '@/decorators/cookies'
import { AuthenticatedControllerInterface } from './authenticateController.interface'
import { CryptoService } from '@/services/crypto.service'
import { Response } from 'express'

@Controller('auth')
export abstract class BaseAuthenticateController
  implements AuthenticatedControllerInterface
{
  protected constructor(
    private authenticateService: BaseAuthenticateService,
    protected readonly cryptoService: CryptoService,
  ) {}

  @Post('/register')
  @UsePipes(ValidationPipe)
  async register(
    @Body() authRegisterUserDto: AuthRegisterUserDto,
  ): Promise<TRegisterResponseDTO> {
    const uid = await this.authenticateService.register(authRegisterUserDto)
    return {
      status: 'success',
      data: {
        uid,
      },
    }
  }

  @Post('/login')
  @UsePipes(ValidationPipe)
  async login(@Body('data') data: string, @Res() res: Response) {
    const decryptedData = this.cryptoService.simpleDecrypt(data)

    const result = await this.authenticateService.login(
      JSON.parse(decryptedData),
    )
    this.authenticateService.setCookies(res, result.tokenPair)
    this.authenticateService.setCookieUser(res, result.defaultPayload)
    return res.send({
      status: 'success',
      data: {
        route: this.authenticateService.getAuthDefaultRoute(
          result.defaultPayload.role,
        ),
      },
    })
  }

  @Get('/refresh')
  async refreshToken(
    @Cookies(REFRESH_TOKEN_SIG_COOKIE) refreshToken: string,
  ): Promise<TRefreshTokenResponseDTO> {
    const refreshTokenValidate = await this.authenticateService.refreshToken(
      refreshToken,
    )

    if (!refreshTokenValidate) {
      return {
        status: 'fail',
        error: 'Invalid refresh token',
        data: {},
      }
    }
    return {
      status: 'success',
      data: {
        ats: refreshTokenValidate.ats,
        attributes: refreshTokenValidate.data,
      },
    }
  }

  @Post('/log-out')
  async logout(
    @Cookies(ACCESS_TOKEN_SIG_COOKIE) accessToken: string,
    @Res() res,
  ): Promise<any> {
    const option = { domain: process.env.CHAT_ASSIST_DOMAIN || 'localhost' }

    res.clearCookie(ACCESS_TOKEN_SIG_COOKIE, option)
    res.clearCookie(REFRESH_TOKEN_SIG_COOKIE, option)

    await this.authenticateService.logout(accessToken)
    return res.send({
      data: {
        isSuccess: true,
      },
    })
  }
  @Put('/active')
  @UsePipes(ValidationPipe)
  async activeAccount(
    @Cookies(REFRESH_TOKEN_SIG_COOKIE) refreshToken: string,
    @Body() data: ActiveAndUpdatePassword,
    @Res() res,
  ): Promise<TRefreshTokenResponseDTO> {
    await this.authenticateService.activeAccount(refreshToken, data.password)
    const option = { domain: process.env.CHAT_ASSIST_DOMAIN || 'localhost' }

    res.clearCookie(ACCESS_TOKEN_SIG_COOKIE, option)
    return res.send({
      data: {
        isSuccess: true,
      },
    })
  }
}
