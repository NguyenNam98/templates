import { Injectable } from '@nestjs/common'
import { BasePasswordService } from '@/providers/services/password/basePassword.service'
import { CryptoService } from '@/services/crypto.service'
import { JWTTokenService } from '@/services/JWTToken.service'
import {Role} from "@devbridge/entities";

@Injectable()
export class UserService extends BasePasswordService {
  constructor(
    protected readonly cryptoService: CryptoService,
    protected readonly jwtTokenService: JWTTokenService,
  ) {
    super(cryptoService, jwtTokenService)
    this.role = Role.User
  }
}
