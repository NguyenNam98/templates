import { Injectable, Logger } from '@nestjs/common'
import {
  S3Client,
  DeleteObjectCommand,
  HeadObjectCommand,
  GetObjectCommand,
  DeleteObjectCommandOutput,
} from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'

import * as moment from 'moment'
import * as stream from 'stream'
import { Readable } from 'stream'
import { v4 as uuidv4 } from 'uuid'
import * as fs from 'fs'
interface IUploadResult {
  url: string
  key: string
  additionalData?: any
}
export type TFile = {
  filePath: string
  originalName: string
  mimeType: string
}

export type TFileBuffer = {
  fileStream: stream.Readable
  originalName: string
  mimeType: string
}

export type TFileResponse = {
  file: stream.Readable
  mineType: string
}
@Injectable()
export class AwsS3Service {
  private readonly s3Client: S3Client
  private readonly bucketName: string
  private readonly logger = new Logger(AwsS3Service.name)

  constructor() {
    const awsConfig = {
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
      region: process.env.AWS_REGION,
    }
    this.s3Client = new S3Client(awsConfig)
    this.bucketName = process.env.S3_BUCKET
  }

  private generateFileName(fileName: string): string {
    return `${uuidv4()}-${moment().format(
      'YYYYMMDDHHmmssSS',
    )}-${fileName.replace(/[^a-zA-Z0-9/!_.*'()]/g, '-')}`
  }

  private async isCorrectKey(key: string): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      })
      await this.s3Client.send(command)
      return true
    } catch (error: any) {
      if (error.name === 'NotFound') {
        this.logger.log(`File not found in S3: ${key}`)
        return false
      }
      this.logger.error(`Error checking key in S3: ${key}`, error)
      return false
    }
  }

  async uploadFile(file: TFile, prefix = ''): Promise<IUploadResult> {
    try {
      const fileName = this.generateFileName(file.originalName)
      const key = `${prefix}/${fileName}`

      const fileStream = fs.createReadStream(file.filePath)
      const upload = new Upload({
        client: this.s3Client,
        params: {
          Bucket: this.bucketName,
          Key: key, // Unique key for each file
          Body: fileStream, // Use the file stream as the body
          ContentType: file.mimeType,
        },
      })

      this.logger.log(`Uploading file to S3: ${key}`)
      await upload.done()

      return {
        url: `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
        key: key,
      }
    } catch (error) {
      this.logger.error(`Error uploading file to S3: ${error}`)
      throw error
    }
  }

  async uploadFileBuffer(
    file: TFileBuffer,
    prefix = '',
  ): Promise<IUploadResult> {
    try {
      const fileName = this.generateFileName(file.originalName)
      const key = `${prefix}/${fileName}`

      const fileStream = file.fileStream
      const upload = new Upload({
        client: this.s3Client,
        params: {
          Bucket: this.bucketName,
          Key: key, // Unique key for each file
          Body: fileStream, // Use the file stream as the body
          ContentType: file.mimeType,
        },
      })

      this.logger.log(`Uploading file to S3: ${key}`)
      await upload.done()

      return {
        url: `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
        key: key,
      }
    } catch (error) {
      this.logger.error(`Error uploading file to S3: ${error}`)
      throw error
    }
  }

  async deleteFile(key: string): Promise<DeleteObjectCommandOutput> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    })

    this.logger.log(`Deleting file from S3: ${key}`)
    return await this.s3Client.send(command)
  }
  async getFileStream(key: string): Promise<TFileResponse> {
    const params = {
      Bucket: this.bucketName,
      Key: key,
    }

    const isCorrectKey = await this.isCorrectKey(key)
    if (!isCorrectKey) {
      const emptyStream = new Readable({
        read() {
          this.push(null)
        },
      })
      this.logger.log(`Not correct key: ${key}`)
      return {
        file: emptyStream,
        mineType: '',
      }
    }

    this.logger.log(`Getting file stream from S3: ${key}`)
    const command = new GetObjectCommand(params)
    const response = await this.s3Client.send(command)
    const mineType = response.ContentType
    // Assuming the response.Body is a readable stream, return it directly.
    return {
      file: response.Body as stream.Readable,
      mineType: mineType,
    }
  }
}
