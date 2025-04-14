import { BadRequestException, Injectable } from '@nestjs/common'

import {
  AwsS3Service,
  TFile,
  TFileBuffer,
  TFileResponse,
} from '@/services/awsS3.service'
import * as qs from 'qs'
import { BaseUploadServiceInterface } from './baseUploadService.interface'
import { DeleteObjectCommandOutput } from '@aws-sdk/client-s3'
import * as fs from 'fs'

const DEFAULT_FILE_TYPE = ['image/jpeg', 'image/jpg', 'image/png']
const minFileSize = 10

@Injectable()
export abstract class BaseUploadService implements BaseUploadServiceInterface {
  protected _uploadUrlPrefix: string
  protected _mineType: string[]
  protected _maxFileSize = 5 // mb
  protected s3UploadService: AwsS3Service = new AwsS3Service()
  get urlPrefix(): string {
    return this._uploadUrlPrefix || '/5econd/upload'
  }

  get mineType(): string[] {
    return this._mineType || DEFAULT_FILE_TYPE
  }

  get maxFileSize(): number {
    return this._maxFileSize || 5
  }
  private generateUploadFileUrl = (key: string, route: string): string => {
    const queryString = qs.stringify({
      key,
    })
    return `${this.urlPrefix}/${route}?${queryString}`
  }

  /**
   * This method is used to upload a file to the S3 bucket.
   * @param file - The file to be uploaded.
   * @param currentRoute - The current route where the file is being uploaded.
   * @param prefix - The prefix to be added to the file name.
   * @returns The URL of the uploaded file.
   */
  async uploadFile(
    file: TFile,
    currentRoute: string,
    prefix?: string,
  ): Promise<string> {
    // Upload the file to the S3 bucket and get the upload information.
    const uploadInfo = await this.s3UploadService.uploadFile(file, prefix)
    const { key } = uploadInfo

    // Generate the URL of the uploaded file.
    return this.generateUploadFileUrl(key, currentRoute)
  }

  async uploadFileBuffer(
    file: TFileBuffer,
    currentRoute: string,
    prefix?: string,
  ): Promise<string> {
    // Upload the file to the S3 bucket and get the upload information.
    const uploadInfo = await this.s3UploadService.uploadFileBuffer(file, prefix)
    const { key } = uploadInfo

    // Generate the URL of the uploaded file.
    return this.generateUploadFileUrl(key, currentRoute)
  }

  async getFile(key: string): Promise<TFileResponse> {
    return this.s3UploadService.getFileStream(key)
  }

  async destroyFile(key: string): Promise<DeleteObjectCommandOutput> {
    return await this.s3UploadService.deleteFile(key)
  }
  async updateFile(key: string): Promise<string> {
    console.log('key', key)
    return ''
  }
  async validateFile(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Bad Request', 'File is required')
    }

    console.log('file.mimetype', file.mimetype)
    if (!this.mineType.includes(file.mimetype)) {
      throw new BadRequestException(
        'Bad Request',
        `Unsupported file type. Please upload a JPEG, PNG, or PDF file.`,
      )
    }

    if (file.size > 1024 * 1024 * this.maxFileSize) {
      throw new BadRequestException(
        'Bad Request',
        `File size exceeds the maximum limit of 50MB.`,
      )
    }

    if (file.size < minFileSize) {
      throw new BadRequestException(
        'Bad Request',
        'File is too small. It might be empty or corrupted.',
      )
    }
    const buffer = fs.readFileSync(file.path)

    const type =  {
      mime: file.mimetype
    }
    if (!type || type.mime !== file.mimetype) {
      throw new BadRequestException(
        'Bad Request',
        'File is corrupted or not supported. Please upload a valid file.',
      )
    }
  }
}
