import { Controller } from '@nestjs/common'
import { MedicalService } from './medical.service'
import { ApiTags } from '@nestjs/swagger'
import { BaseUploadController } from '../../../providers/upload/controllers/baseUpload.controller'
import { InjectDataSource } from '@nestjs/typeorm'
import { DatabaseModule } from '../../../database.module'
import { DATABASE_NAMES } from '../../../app.constant'
import { DataSource } from 'typeorm'

@ApiTags('Upload medical file')
@Controller({
  path: 'upload/dataset',
  version: '1',
})
export class MedicalController extends BaseUploadController {
  constructor(
    protected fileService: MedicalService,
    @InjectDataSource(DatabaseModule.getConnectionName(DATABASE_NAMES.MASTER))
    protected masterConnection: DataSource,
  ) {
    super(fileService, masterConnection)
  }
}
