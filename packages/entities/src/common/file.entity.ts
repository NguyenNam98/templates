import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

export enum FileStatus {
  READY = 1,
  PROCESSING = 2,
  ERROR = 3,
  PROCESSED = 4,
}

@Entity('file', { schema: 'common' })
export class File {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({
    type: 'boolean',
    name: 'is_valid',
    default: () => true,
  })
  isValid!: boolean

  @Column('varchar', {
    name: 'file_name',
    length: 512,
    nullable: false,
  })
  fileName!: string

  @Column('varchar', {
    name: 'file_url',
    length: 512,
    nullable: false,
  })
  fileUrl!: string

  @Column('varchar', {
    name: 'size',
    length: 256,
    nullable: false,
  })
  size!: string

  @Column('enum', {
    name: 'status',
    enum: FileStatus,
    default: FileStatus.READY,
  })
  status!: FileStatus

  @Column({
    type: 'timestamptz',
    name: 'processed_at',
    nullable: true,
  })
  processedAt?: Date

  @Column({
    type: 'text',
    name: 'error_message',
    nullable: true,
  })
  errorMessage?: string

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date
}
