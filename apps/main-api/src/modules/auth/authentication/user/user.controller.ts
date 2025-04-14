import { Controller } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { BaseAuthenticateController } from '@/providers/controllers/authenticate/baseAuthenticate.controller'
import { UserService } from './user.service'
import { CryptoService } from '@/services/crypto.service'

@ApiTags('User')
@Controller({
  path: '/auth/user/authenticate',
  version: '1',
})
export class UserController extends BaseAuthenticateController {
  constructor(
    protected authUserService: UserService,
    protected readonly cryptoService: CryptoService,
  ) {
    super(authUserService, cryptoService)
  }
}
