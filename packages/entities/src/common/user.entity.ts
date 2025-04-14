import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

@Entity('user', { schema: 'common' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({
    type: 'boolean',
    name: 'is_valid',
    default: () => true,
  })
  isValid!: boolean

  @Column({
    type: 'uuid',
    name: 'auth_id',
    nullable: false,
  })
  authId!: string

  @Column('varchar', {
    name: 'profile_image_url',
    length: 512,
    nullable: true,
  })
  profileImageUrl!: string | null

  @Column('varchar', {
    name: 'first_name',
    length: 128,
  })
  firstName!: string

  @Column('varchar', {
    name: 'last_name',
    length: 128,
  })
  lastName!: string

  @Column('varchar', {
    name: 'location',
    length: 128,
    nullable: true,
  })
  location!: string | null

  @Column('varchar', {
    name: 'phone_number',
    length: 15,
    nullable: true,
  })
  phoneNumber!: string | null

  @Column({
    type: 'uuid',
    name: 'organisation_id',
    nullable: true,
  })
  organisationId!: string | null

  @Column({
    type: 'uuid',
    name: 'branch_id',
    nullable: true,
  })
  branchId!: string | null

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date
}
