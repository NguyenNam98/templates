import {
  Body,
  Controller,
  Post,
  Put,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common'
import { CryptoService } from '@/services/crypto.service'
import { BusinessException } from '@/app.exception'
import { TBaseDto, TMetaData } from '@/app.typing'
import {
  AuthLoginUserDto,
  ChangePasswordDto,
  ChangePasswordRequestDto,
  CreateCustomTokenDto,
  VerifyCustomTokenDto,
} from '@/dtos'
import {
  BasePasswordService,
  PasswordException,
} from '../../services/password/basePassword.service'
import { PasswordControllerInterface } from './basePassword.interface'
import { ObjectLiteral } from 'typeorm'
import {MetaData} from "@/decorators/metaData.decorator";

@Controller({
  path: 'password',
  version: '1',
})
export abstract class BasePasswordController
  implements PasswordControllerInterface
{
  protected constructor(
    private passwordService: BasePasswordService,
    protected readonly cryptoService: CryptoService,
  ) {}
  @Post('/verify')
  @UsePipes(ValidationPipe)
  async verifyPassword(@Body() passwordData: AuthLoginUserDto): Promise<
    TBaseDto<{
      token: string
    }>
  > {
    const token = await this.passwordService.verifyPassword(passwordData)
    return {
      status: 'success',
      data: {
        token,
      },
    }
  }

  @Post('/change')
  @UsePipes(ValidationPipe)
  async changePassword(
    @Body() changePasswordData: ChangePasswordDto,
  ): Promise<TBaseDto<ObjectLiteral>> {
    const validateTokenData = await this.passwordService.verifyToken(
      changePasswordData,
    )

    if (!validateTokenData.isValidToken || !validateTokenData.userInfo) {
      throw new BusinessException(PasswordException.ECP0002, 'Token is invalid')
    }

    await this.passwordService.serviceUpdatePassword(
      validateTokenData.userInfo.id,
      changePasswordData.newPassword,
    )

    return {
      status: 'success',
      data: {},
    }
  }
  @Post('/custom-token')
  @UsePipes(ValidationPipe)
  async createCustomToken(
    @Body() customTokenDto: CreateCustomTokenDto,
  ): Promise<
    TBaseDto<{
      token: string
    }>
  > {
    const token = await this.passwordService.createCustomToken(
      customTokenDto.authId,
    )
    return {
      status: 'success',
      data: {
        token,
      },
    }
  }

  @Post('/custom-token/verify')
  @UsePipes(ValidationPipe)
  async verifyCustomToken(@Body() verifyToken: VerifyCustomTokenDto): Promise<
    TBaseDto<{
      authId: string
      email: string
    }>
  > {
    const tokenDetail = await this.passwordService.verifyCustomToken(
      verifyToken.token,
    )
    return {
      status: 'success',
      data: tokenDetail,
    }
  }
  @Post('/forgot/change')
  @UsePipes(ValidationPipe)
  async forgotPassChangePass(
    @Body() verifyToken: ChangePasswordRequestDto,
  ): Promise<
    TBaseDto<{
      authId: string
      email: string
    }>
  > {
    const tokenDetail = await this.passwordService.verifyCustomToken(
      verifyToken.token,
    )

    if (!tokenDetail) {
      throw new BusinessException(PasswordException.ECP0002, 'Token is invalid')
    }

    await this.passwordService.serviceUpdatePassword(
      tokenDetail.authId,
      verifyToken.newPassword,
    )

    return {
      status: 'success',
      data: {
        authId: tokenDetail.authId,
        email: tokenDetail.email,
      },
    }
  }
  // update password directly
  @Put('/update')
  async updatePassword(
    @Body('data') data: string,
    @MetaData() meta: TMetaData,
  ): Promise<TBaseDto<ObjectLiteral>> {
    console.log(meta, data)

    const decryptedData = this.cryptoService.simpleDecrypt(data)

    await this.passwordService.serviceUpdatePassword(
      'meta.authId',
      JSON.parse(decryptedData),
    )

    return {
      status: 'success',
      data: {},
    }
  }
}
