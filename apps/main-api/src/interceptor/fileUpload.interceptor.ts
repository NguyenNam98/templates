import { UseInterceptors, applyDecorators } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { FileCleanupInterceptor } from './fileCleanup.interceptor'
import { TEMP_FOLDER } from '@/app.constant'

export function FileUploadInterceptor() {
  return applyDecorators(
    UseInterceptors(
      FileInterceptor('file', {
        storage: diskStorage({
          destination: TEMP_FOLDER,
          filename: (req, file, cb) => {
            console.log('file in decor', file)
            cb(null, file.originalname)
          },
        }),
      }),
      FileCleanupInterceptor,
    ),
  )
}
