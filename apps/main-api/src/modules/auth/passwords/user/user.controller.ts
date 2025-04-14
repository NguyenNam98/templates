import { Body, Controller, Put } from '@nestjs/common'
import { UserService } from './user.service'
import { ApiTags } from '@nestjs/swagger'
import { CryptoService } from '@/services/crypto.service'
import { TMetaData, TBaseDto } from '@/app.typing'
import { DecodedTokenHeader, MetaData } from '@/decorators/metaData.decorator'
import { ObjectLiteral } from 'typeorm'

@ApiTags('Password User')
@DecodedTokenHeader()
@Controller({
  path: 'auth/user/password',
  version: '1',
})
export class UserController {
  constructor(
    protected collectionManagerService: UserService,
    protected readonly cryptoService: CryptoService,
  ) {}

  @Put('/change-password')
  async updatePassword(
    @Body('data') data: string,
    @MetaData() meta: TMetaData,
  ): Promise<TBaseDto<ObjectLiteral>> {
    console.log(meta, data)

    const decryptedData = this.cryptoService.simpleDecrypt(data)

    await this.collectionManagerService.serviceUpdatePassword(
      meta.authId,
      JSON.parse(decryptedData),
    )

    return {
      status: 'success',
      data: {},
    }
  }
}
