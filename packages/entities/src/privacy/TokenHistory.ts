import {Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn} from 'typeorm'

@Entity('token_history', { schema: 'privacy' })
export class TokenHistory {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({
    type: 'boolean',
    name: 'is_valid',
    default: () => false,
  })
  isValid: boolean

  @Column({type: "uuid", name: 'device_id', nullable: true })
  deviceId: string | null

  @Column('uuid', {
    name: 'auth_id',
  })
  authId: string

  @Column('varchar', { name: 'refresh_token', length: 1000 })
  refreshToken: string


  @CreateDateColumn({ type: "timestamp without time zone", name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp without time zone", name: "updated_at" })
  updatedAt!: Date;
}
