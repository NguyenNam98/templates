import {
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Query,
  Req,
  Res,
  UploadedFile,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common'
import { BASE_URL, DATABASE_NAMES } from '@/app.constant'
import { Request, Response } from 'express'
import { BaseUploadService } from '../services/baseUpload.service'
import { UploadControllerInterface } from './baseUploadController.interface'
import { GetFileDTO } from '@/app.dto'
import { TBaseDto, TMetaData } from '@/app.typing'
import { InjectDataSource } from '@nestjs/typeorm'
import { DatabaseModule } from '@/database.module'
import { DataSource } from 'typeorm'
import { MetaData } from '@/decorators/metaData.decorator'
import { FileUploadInterceptor } from '@/interceptor/fileUpload.interceptor'
import {FileStatus, File} from "@devbridge/entities";

@Controller('file')
export abstract class BaseUploadController
  implements UploadControllerInterface
{
  protected constructor(
    protected baseUploadService: BaseUploadService,
    @InjectDataSource(DatabaseModule.getConnectionName(DATABASE_NAMES.MASTER))
    protected masterConnection: DataSource,
  ) {}

  @Post()
  @FileUploadInterceptor()
  async store(
    @Req() req: Request,
    @MetaData() meta: TMetaData,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<
    TBaseDto<{
      id: string
      fileName: string
      size: number
      fileUrl: string
      createdAt: Date
    }>
  > {
    const relativeRoute = req.path.replace(BASE_URL, '')
    const destinationFolderPath = relativeRoute + '/' + meta.orgId

    console.log('file', file)

    await this.baseUploadService.validateFile(file)

    const fileDetail = {
      filePath: file.path,
      originalName: file.originalname,
      mimeType: file.mimetype,
    }

    const uploadedFileUrl = await this.baseUploadService.uploadFile(
      fileDetail,
      relativeRoute,
      destinationFolderPath,
    )

    const insertResult = await this.masterConnection.manager.insert(File, {
      fileUrl: uploadedFileUrl,
      fileName: file.originalname,
      size: file.size.toString(),
      isValid: true,
      status: FileStatus.READY,
    })

    return {
      status: 'success',
      data: {
        id: insertResult.identifiers[0].id,
        fileName: file.originalname,
        size: file.size,
        fileUrl: uploadedFileUrl,
        createdAt: new Date(),
      },
    }
  }

  @Get()
  @UsePipes(ValidationPipe)
  async show(
    @Query() queryData: GetFileDTO,
    @Res() res: Response,
  ): Promise<void> {
    const { key } = queryData
    const { file: imageStream, mineType } =
      await this.baseUploadService.getFile(key)

    console.log('key', key)
    res.setHeader(
      'Content-Disposition',
      `inline; filename=${key.split('/').pop()}`,
    )
    res.setHeader('Content-Type', mineType)
    res.status(200)
    imageStream.pipe(res)
  }

  @Delete()
  async destroy(@Query() queryData: { key: string }): Promise<void> {
    const deletedData = await this.baseUploadService.destroyFile(queryData.key)

    console.log(deletedData)
  }

  @Put()
  async update(): Promise<string> {
    return ''
  }
}
