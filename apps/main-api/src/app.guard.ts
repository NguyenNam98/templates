import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { TMetaData } from './app.typing'
import { DataSource } from 'typeorm'
import { InjectDataSource } from '@nestjs/typeorm'
import { DatabaseModule } from '@/database.module'
import { DATABASE_NAMES } from '@/app.constant'
import {User,  Auth, Role} from "@devbridge/entities";
const IGNORE_AUTH_CHECK_PATH = ['/api/5econd/v1/auth']
@Injectable()
export class AppGuard implements CanActivate {
  constructor(
    @InjectDataSource(DatabaseModule.getConnectionName(DATABASE_NAMES.MASTER))
    private masterConnection: DataSource,
  ) {}
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest()
    return this.validateUser(request) as unknown as boolean
  }

  async validateUser(request): Promise<boolean> {
    const ipAddress =
      request.headers['remote-addr'] ||
      (request.headers['x-forwarded-for'] || '').split(',')[0] ||
      ''
    const userAgent = request.headers['user-agent'] || ''
    const referer = request.headers['referer'] || ''
    const path = request.path
    if (
      IGNORE_AUTH_CHECK_PATH.some((ignorePath) => path.startsWith(ignorePath))
    ) {
      return true
    }

    const auPayloadHeader = request.headers['decoded-token']

    let dataToken

    try {
      dataToken = JSON.parse(auPayloadHeader) as any
    } catch (e) {
      throw new UnauthorizedException('Invalid token format')
    }
    if (!dataToken || !dataToken.uid || !dataToken.orgId) {
      throw new UnauthorizedException('Unauthorized')
    }

    const user = await this.doesUserExist(dataToken.uid)

    request.metaData = {
      ipAddress,
      userAgent,
      referer,
      orgId: dataToken.orgId,
      authId: dataToken.uid,
      email: dataToken.email,
      userId: user.userId,
      role: user.role,
      branchId: user?.branchId,
    } as TMetaData

    return true
  }

  async doesUserExist(authId: string): Promise<
    | {
        authId: string
        email: string
        userId: string
        role: Role
        organisationId: string
        branchId?: string
      }
    | undefined
  > {
    const slaveQueryRunner = this.masterConnection.createQueryRunner('slave')

    console.log('authId', authId)
    try {
      const user = await slaveQueryRunner.manager
        .getRepository(Auth)
        .createQueryBuilder('auth')
        .leftJoin(User, 'user', 'auth.id = user.auth_id')
        .where('auth.id = :authId', { authId })
        .andWhere('auth.is_valid = TRUE')
        .andWhere('user.is_valid = TRUE')
        .select([
          'auth.id AS "authId"',
          'auth.email AS "email"',
          'user.id AS "userId"',
          'auth.role AS "role"',
          'auth.organisation_id AS "organisationId"',
          'auth.branch_id AS "branchId"',
        ])
        .getRawOne()

      if (!user) throw new UnauthorizedException('Unauthorized')
      return user
    } finally {
      await slaveQueryRunner.release()
    }
  }
}
