import { Injectable } from '@nestjs/common'

import { PasswordServiceInterface } from './passwordService.interface'
import { DataSource, Equal, Not } from 'typeorm'
import { BusinessException } from '@/app.exception'
import { InjectDataSource } from '@nestjs/typeorm'
import { DatabaseModule } from '@/database.module'
import {
  CUSTOM_FORGOT_PASSWORD_TOKEN_LIFE_TIME,
  CUSTOM_TOKEN_LIFE_TIME,
  DATABASE_NAMES,
} from '@/app.constant'
import { CryptoService } from '@/services/crypto.service'
import { EAudience, JWTTokenService } from '@/services/JWTToken.service'
import { ChangePasswordDto } from '@/dtos'
import {CustomToken, Auth, Role, StatusType} from "@devbridge/entities";

export enum PasswordException {
  // password is not correct
  ECP0001 = 'ECP0001',
  // custom token is invalid
  ECP0002 = 'ECP0002',
}
@Injectable()
export abstract class BasePasswordService implements PasswordServiceInterface {
  protected role: Role
  @InjectDataSource(DatabaseModule.getConnectionName(DATABASE_NAMES.MASTER))
  private masterConnection: DataSource

  protected constructor(
    protected readonly cryptoService: CryptoService,
    protected readonly jwtTokenService: JWTTokenService,
  ) {}

  get getRole(): Role {
    return this.role
  }
  async verifyPassword(userDetail) {
    const userInfo = await this.getUserByEmail(userDetail.email)

    if (
      !userInfo ||
      userDetail.password !== this.cryptoService.decrypt(userInfo.password)
    ) {
      throw new BusinessException(PasswordException.ECP0001, 'User not found')
    }

    const token = this.jwtTokenService.generateCustomToken(
      {
        uid: userInfo.id,
        iat: Date.now(),
        aud: EAudience.FORGOT_PASSWORD,
      },
      CUSTOM_FORGOT_PASSWORD_TOKEN_LIFE_TIME,
    )

    await this.createCustomTokenHistory(userInfo.id, token)

    return token
  }

  private async getUserByEmail(email: string) {
    const slaveQueryRunner = this.masterConnection.createQueryRunner('slave')
    try {
      const repository = slaveQueryRunner.manager.getRepository(Auth)
      return await repository.findOne({
        where: {
          email: email,
          isValid: true,
          status: Not(Equal(StatusType.deleted)),
        },
      })
    } finally {
      await slaveQueryRunner.release()
    }
  }
  private async createCustomTokenHistory(authId: string, token: string) {
    const repository = this.masterConnection.manager.getRepository(CustomToken)
    return await repository.insert({
      authId,
      isValid: true,
      isUsed: false,
      token,
    })
  }

  private async getValidCustomTokenDetailByUid(
    authId: string,
    token: string,
  ): Promise<CustomToken> {
    const slaveQueryRunner = this.masterConnection.createQueryRunner('slave')
    try {
      const repository = slaveQueryRunner.manager.getRepository(CustomToken)
      return await repository.findOne({
        where: {
          authId,
          isValid: true,
          isUsed: false,
          token,
        },
      })
    } finally {
      await slaveQueryRunner.release()
    }
  }
  async verifyToken(changePasswordData: ChangePasswordDto): Promise<{
    isValidToken: boolean
    userInfo?: Auth
  }> {
    const tokenPayload = this.jwtTokenService.verifyCustomToken(
      changePasswordData.token,
    )

    if (!tokenPayload || tokenPayload.aud !== EAudience.FORGOT_PASSWORD) {
      return {
        isValidToken: false,
      }
    }

    const customToken = await this.getValidCustomTokenDetailByUid(
      tokenPayload.uid,
      changePasswordData.token,
    )

    if (!customToken) {
      return {
        isValidToken: false,
      }
    }

    const userInfo = await this.getUserByEmail(changePasswordData.email)

    if (!userInfo || userInfo.id !== tokenPayload.uid) {
      return {
        isValidToken: false,
      }
    }

    await this.masterConnection.manager
      .getRepository(CustomToken)
      .update(customToken.id, {
        isUsed: true,
      })

    return {
      isValidToken: true,
      userInfo,
    }
  }
  async serviceUpdatePassword(uid: string, password: string) {
    const repository = this.masterConnection.manager.getRepository(Auth)
    return await repository.update(uid, {
      password: this.cryptoService.encrypt(password),
    })
  }

  async createCustomToken(uid: string) {
    const token = await this.jwtTokenService.generateCustomToken(
      {
        uid,
        iat: Date.now(),
        aud: EAudience.CUSTOM_TOKEN,
      },
      CUSTOM_TOKEN_LIFE_TIME,
    )

    await this.createCustomTokenHistory(uid, token)

    return token
  }
  async verifyCustomToken(token: string): Promise<{
    authId: string
    email: string
  }> {
    const verifyCustomToken = this.jwtTokenService.verifyCustomToken(token)

    if (
      !verifyCustomToken ||
      verifyCustomToken.aud !== EAudience.CUSTOM_TOKEN
    ) {
      throw new BusinessException(PasswordException.ECP0002, 'Token is invalid')
    }

    const tokenDetail = await this.getValidCustomTokenDetail(token)

    if (!tokenDetail) {
      throw new BusinessException(PasswordException.ECP0002, 'Token is invalid')
    }
    const authDetail = await this.getAuthDetailById(tokenDetail.authId)

    if (!authDetail) {
      throw new BusinessException(PasswordException.ECP0002, 'Token is invalid')
    }

    return {
      authId: tokenDetail.authId,
      email: authDetail.email,
    }
  }

  private async getValidCustomTokenDetail(token: string): Promise<CustomToken> {
    const slaveQueryRunner = this.masterConnection.createQueryRunner('slave')
    try {
      const repository = slaveQueryRunner.manager.getRepository(CustomToken)
      return await repository.findOne({
        where: {
          isValid: true,
          isUsed: false,
          token,
        },
      })
    } finally {
      await slaveQueryRunner.release()
    }
  }

  private async getAuthDetailById(id: string): Promise<Auth> {
    const slaveQueryRunner = this.masterConnection.createQueryRunner('slave')
    try {
      const repository = slaveQueryRunner.manager.getRepository(Auth)
      return await repository.findOne({
        where: {
          id,
        },
      })
    } finally {
      await slaveQueryRunner.release()
    }
  }
}
