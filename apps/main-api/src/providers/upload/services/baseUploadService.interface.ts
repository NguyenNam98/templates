import { TFile } from '../../../services/awsS3.service'

export interface BaseUploadServiceInterface {
  uploadFile(
    filePath: TFile,
    currentRoute: string,
    prefix?: string,
  ): Promise<string>
  // post method
  destroyFile(...args: any[])
  // put method
  updateFile(...args: any[])
  // delete method
  getFile(...args: any[])

  validateFile(file: Express.Multer.File)
}
