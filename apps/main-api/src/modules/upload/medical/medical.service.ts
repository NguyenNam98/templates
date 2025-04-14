import { Injectable } from '@nestjs/common'
import { BaseUploadService } from '../../../providers/upload/services/baseUpload.service'
@Injectable()
export class MedicalService extends BaseUploadService {
  constructor() {
    super()
    this._mineType = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
    this._maxFileSize = 50 // mb
  }
}
