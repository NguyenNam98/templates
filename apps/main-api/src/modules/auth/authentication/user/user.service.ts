import { Injectable } from '@nestjs/common'
import { BaseAuthenticateService } from '@/providers/services/authenticate/baseAuthenticate.service'
import { CryptoService } from '@/services/crypto.service'
import { JWTTokenService } from '@/services/JWTToken.service'
import { InjectDataSource } from '@nestjs/typeorm'
import { DATABASE_NAMES } from '@/app.constant'
import { DatabaseModule } from '@/database.module'
import { DataSource } from 'typeorm'
import {Auth, Role} from "@devbridge/entities";

@Injectable()
export class UserService extends BaseAuthenticateService {
  constructor(
    @InjectDataSource(DatabaseModule.getConnectionName(DATABASE_NAMES.MASTER))
    private connection: DataSource,
    protected readonly cryptoService: CryptoService,
    protected readonly jwtTokenService: JWTTokenService,
  ) {
    super(cryptoService, jwtTokenService)
    this.role = Role.User
  }

  setRole(newRole: Role) {
    this.role = newRole
  }

  async getAuthUserInformation(uid: string): Promise<Auth | null> {
    const slaveQueryRunner = this.connection.createQueryRunner('slave')
    try {
      const repository = slaveQueryRunner.manager.getRepository(Auth)
      const authData = await repository.findOneBy({
        id: uid,
      })

      if (!authData) {
        return null
      }

      return authData
    } finally {
      await slaveQueryRunner.release()
    }
  }
}
