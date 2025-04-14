import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class GetFileDTO {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  key: string
}
