import {Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn} from 'typeorm'

@Entity('custom_token', { schema: 'privacy' })
export class CustomToken {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({
    name: 'is_valid',
    type: 'boolean',
    default: () => false,
  })
  isValid: boolean

  @Column({
    name: 'is_used',
    type: 'boolean',
    default: () => false,
  })
  isUsed: boolean

  @Column('text', { name: 'token' })
  token: string

  @Column({type: "uuid", name: 'auth_id' })
  authId: string


  @CreateDateColumn({ type: "timestamp without time zone", name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp without time zone", name: "updated_at" })
  updatedAt!: Date;
}


