import { Injectable } from '@nestjs/common'
import { AuthenticateServiceInterface } from './authenticateService.interface'
import { TTokenPair } from '../../../app.typing'
import {
  ACCESS_TOKEN_JWT_LIFE_TIME,
  ACCESS_TOKEN_LIFE_TIME,
  ACCESS_TOKEN_SIG_COOKIE,
  DATABASE_NAMES,
  REFRESH_TOKEN_JWT_LIFE_TIME,
  REFRESH_TOKEN_LIFE_TIME,
  REFRESH_TOKEN_SIG_COOKIE,
} from '@/app.constant'
import {
  accessTokenPayload,
  JWTTokenService,
} from '@/services/JWTToken.service'
import { InjectDataSource } from '@nestjs/typeorm'
import { DatabaseModule } from '@/database.module'
import { DataSource, Equal, MoreThan, Not } from 'typeorm'
import { BusinessException } from '@/app.exception'
import { CryptoService } from '@/services/crypto.service'

import * as moment from 'moment'
import {TokenHistory, User, Auth, Role, StatusType} from "@devbridge/entities";
import {AuthLoginUserDto, AuthRegisterUserDto} from "@/dtos";

export interface TDefaultPayload {
  uid: string
  email: string
}
export interface TRefreshTokenResponseDTO {
  ats: string
  data: accessTokenPayload
}
@Injectable()
export abstract class BaseAuthenticateService
  implements AuthenticateServiceInterface
{
  @InjectDataSource(DatabaseModule.getConnectionName(DATABASE_NAMES.MASTER))
  private masterConnection: DataSource
  protected role: Role = Role.User
  protected constructor(
    protected readonly cryptoService: CryptoService,
    protected readonly jwtTokenService: JWTTokenService,
  ) {}

  get getRole(): Role {
    return this.role
  }

  async register(authRegisterUserDto: AuthRegisterUserDto) {
    await this.validateEmailRegister(authRegisterUserDto.email)
    return await this.createNewEmailUser(authRegisterUserDto)
  }

  private async validateEmailRegister(email: string) {
    const slaveQueryRunner = this.masterConnection.createQueryRunner('slave')
    try {
      const repository = slaveQueryRunner.manager.getRepository(Auth)
      const authData = await repository.findOne({
        where: {
          email: email,
          isValid: true,
          status: Not(Equal(StatusType.deleted)),
        },
      })

      if (authData) {
        throw new BusinessException('Email already exists')
      }
    } finally {
      await slaveQueryRunner.release()
    }
  }

  private async createNewEmailUser(
    authRegisterUserDto: AuthRegisterUserDto,
  ): Promise<string> {
    const dataBaseNewUser: Partial<Auth> = {
      isValid: true,
      status: authRegisterUserDto.status,
      email: authRegisterUserDto.email,
      password: this.cryptoService.encrypt(authRegisterUserDto.password),
      role: this.role,
      userName: authRegisterUserDto.userName,
      organisationId: authRegisterUserDto.organisationId,
      branchId: authRegisterUserDto?.branchId,
      temporaryExpireAt: authRegisterUserDto.temporaryExpireAt,
    }

    const authUser = await this.masterConnection
      .getRepository(Auth)
      .insert(dataBaseNewUser)
    const uid = authUser.identifiers[0].id

    if (!uid) {
      throw new BusinessException('Create user failed')
    }
    await this.masterConnection.getRepository(User).insert({
      authId: uid,
      isValid: true,
      firstName: authRegisterUserDto.firstName || '',
      lastName: authRegisterUserDto.lastName || '',
      organisationId: authRegisterUserDto.organisationId,
      branchId: authRegisterUserDto?.branchId,
    })
    return uid
  }

  private generateTokenPairs(tokenPayloadDefault: TDefaultPayload): {
    ats: string
    rts: string
  } {
    const atsPayload = {
      ...tokenPayloadDefault,
      iat: Date.now(),
    }
    const accessToken = this.jwtTokenService.generateToken(
      atsPayload,
      ACCESS_TOKEN_JWT_LIFE_TIME,
    )
    const refreshToken = this.jwtTokenService.generateToken(
      {
        iat: Date.now(),
        uid: tokenPayloadDefault.uid,
      },
      REFRESH_TOKEN_JWT_LIFE_TIME,
    )
    return {
      ats: accessToken,
      rts: refreshToken,
    }
  }

  private async validateLogin(email: string, password: string): Promise<Auth> {
    const slaveQueryRunner = this.masterConnection.createQueryRunner('slave')
    try {
      const repository = slaveQueryRunner.manager.getRepository(Auth)
      const authData = await repository.findOne({
        where: {
          email: email,
          isValid: true,
        },
      })

      if (
        !authData ||
        password !== this.cryptoService.decrypt(authData.password)
      ) {
        throw new BusinessException('Email or password is incorrect')
      }

      if (
        authData.status === StatusType.inactive &&
        (!authData.temporaryExpireAt ||
          authData.temporaryExpireAt < moment().utc().toDate())
      ) {
        throw new BusinessException(
          'EAC004',
          'Your temporary password has expired. Please contact admin to request a new temporary password.',
        )
      }
      return authData
    } finally {
      await slaveQueryRunner.release()
    }
  }

  async login(authLoginUserDto: AuthLoginUserDto): Promise<{
    tokenPair: TTokenPair
    defaultPayload: TDefaultPayload & { orgId: string; role: Role }
  }> {
    const { email, password } = authLoginUserDto
    const authData = await this.validateLogin(email, password)

    const defaultPayload = {
      uid: authData.id,
      email: authData.email,
      orgId: authData.organisationId,
      role: authData.role,
      userStatus: authData.status,
    }
    const tokenPair = this.generateTokenPairs(defaultPayload)

    await Promise.all([
      this.updateLoginHistory(authData.id),
      this.createTokenHistory(authData.id, tokenPair.rts),
    ])

    return { tokenPair, defaultPayload }
  }

  private async updateLoginHistory(uid: string): Promise<string> {
    await this.masterConnection.getRepository(Auth).update(
      {
        id: uid,
      },
      {
        lastLoginAt: new Date(),
      },
    )
    return uid
  }

  // private async updateAccessHistory(uid: string): Promise<string> {
  //   await this.masterConnection.getRepository(Auth).update({
  //     id: uid
  //   }, {
  //     lastAccessAt: new Date(),
  //   })
  //   return uid
  // }

  private async createTokenHistory(
    uid: string,
    refreshToken: string,
  ): Promise<string> {
    await this.masterConnection.getRepository(TokenHistory).insert({
      authId: uid,
      refreshToken,
      isValid: true,
    })
    return uid
  }
  async activeAccount(
    refreshToken: string,
    password: string,
  ): Promise<TRefreshTokenResponseDTO | null> {
    const verifyToken = this.jwtTokenService.verifyRefreshToken(refreshToken)
    if (!verifyToken) {
      return null
    }

    const userAuthInfor = await this.validateActiveAccount(verifyToken.uid)

    await this.masterConnection.getRepository(Auth).update(
      {
        id: userAuthInfor.id,
      },
      {
        status: StatusType.active,
        password: this.cryptoService.encrypt(password),
      },
    )
  }

  async refreshToken(
    refreshToken: string,
  ): Promise<TRefreshTokenResponseDTO | null> {
    const verifyToken = this.jwtTokenService.verifyRefreshToken(refreshToken)
    if (!verifyToken) {
      return null
    }

    const userAuthInfor = await this.getUserAuthInformation(verifyToken.uid)

    if (!userAuthInfor) {
      return null
    }
    const defaultPayload = {
      uid: userAuthInfor.id,
      email: userAuthInfor.email,
      iat: Date.now(),
      orgId: userAuthInfor.organisationId,
      role: userAuthInfor.role,
      userStatus: userAuthInfor.status,
    }
    const accessToken = this.jwtTokenService.generateToken(
      defaultPayload,
      ACCESS_TOKEN_JWT_LIFE_TIME,
    )

    // await this.updateAccessHistory(userAuthInfor.id)

    return {
      ats: accessToken,
      data: defaultPayload,
    }
  }
  private async getUserAuthInformation(uid: string): Promise<Auth | null> {
    const slaveQueryRunner = this.masterConnection.createQueryRunner('slave')
    try {
      const repository = slaveQueryRunner.manager.getRepository(Auth)
      const authData = await repository.findOneBy({
        id: uid,
        isValid: true,
      })

      if (!authData) {
        return null
      }

      return authData
    } finally {
      await slaveQueryRunner.release()
    }
  }

  private async validateActiveAccount(uid: string): Promise<Auth> {
    const slaveQueryRunner = this.masterConnection.createQueryRunner('slave')
    try {
      const repository = slaveQueryRunner.manager.getRepository(Auth)
      const authData = await repository.findOneBy({
        id: uid,
        isValid: true,
        status: StatusType.inactive,
        temporaryExpireAt: MoreThan(new Date()),
      })

      if (!authData) {
        throw new BusinessException(
          'EAC003',
          'Account is not active or expired',
        )
      }

      return authData
    } finally {
      await slaveQueryRunner.release()
    }
  }

  async logout(accessToken: string) {
    console.log('accessToken', accessToken)
    // return await this._cognitoService.logout(accessToken)
  }

  /** *
   * Set response cookie
   * @param res
   * @param token
   */
  setCookies(res, token: TTokenPair) {
    res.cookie(ACCESS_TOKEN_SIG_COOKIE, token.ats, {
      httpOnly: true,
      secure: process.env.ENV !== 'develop',
      domain: process.env.CHAT_ASSIST_DOMAIN || 'localhost',
      maxAge: ACCESS_TOKEN_LIFE_TIME,
    })
    res.cookie(REFRESH_TOKEN_SIG_COOKIE, token.rts, {
      httpOnly: true,
      secure: process.env.ENV !== 'develop',
      domain: process.env.CHAT_ASSIST_DOMAIN || 'localhost',
      maxAge: REFRESH_TOKEN_LIFE_TIME,
    })
  }

  setCookieUser(res, user: TDefaultPayload) {
    res.cookie('user', JSON.stringify(user), {
      httpOnly: false,
      secure: process.env.ENV !== 'develop',
      domain: process.env.CHAT_ASSIST_DOMAIN || 'localhost',
      maxAge: REFRESH_TOKEN_LIFE_TIME,
    })
  }

  getAuthDefaultRoute(role: Role): string {
    switch (role) {
      case Role.SuperUser:
        return '/chat'
      case Role.User:
        return '/chat'
      case Role.Admin:
        return '/management'
      case Role.SuperAdmin:
        return '/super'
      default:
        return '/'
    }
  }
}
