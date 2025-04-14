import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

export enum LoginType {
  Email = 1,
  Facebook = 2,
  Google = 3,
}

export enum Role {
  SuperAdmin = 1,
  Admin = 2,
  User = 3,
  SuperUser = 4,
}
export enum StatusType {
  inactive = 0,
  active = 1,
  blocked = 2,
  deleted = 3,
}
@Entity('auth', { schema: 'privacy' })
export class Auth {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({
    type: 'boolean',
    name: 'is_valid',
    width: 1,
    default: () => true,
  })
  isValid: boolean

  @Column({
    type: 'enum',
    enum: StatusType,
    name: 'status',
    width: 1,
    default: () => StatusType.inactive,
  })
  status: StatusType

  @Column({
    type: 'enum',
    enum: LoginType,
    name: 'login_type',
    width: 1,
    default: () => LoginType.Email,
  })
  loginType: LoginType

  @Column('varchar', {
    name: 'email',
    nullable: true,
    length: 256,
  })
  email: string | null

  @Column('varchar', {
    name: 'password',
    nullable: true,
    length: 256,
  })
  password: string | null

  @Column('varchar', {
    name: 'user_name',
    nullable: true,
    length: 256,
  })
  userName: string | null

  @Column('uuid', {
    name: 'organisation_id',
    nullable: true,
  })
  organisationId: string | null

  @Column('uuid', {
    name: 'branch_id',
    nullable: true,
  })
  branchId: string | null

  @Column({
    type: 'enum',
    enum: Role,
    name: 'role',
    nullable: false,
  })
  role: Role

  @Column('timestamptz', {
    name: 'last_login_at',
    nullable: true,
  })
  lastLoginAt: Date | null

  @Column('timestamptz', {
    name: 'temporary_expire_at',
    nullable: true,
  })
  temporaryExpireAt: Date | null

  @Column('varchar', {
    name: 'ip_address',
    nullable: true,
    length: 64,
  })
  ipAddress: string | null

  @Column('text', {
    name: 'user_agent',
    nullable: true,
  })
  userAgent: string | null

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date
}
