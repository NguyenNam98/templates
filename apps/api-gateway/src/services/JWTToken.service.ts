import { Injectable } from '@nestjs/common'
import * as jwt from 'jsonwebtoken'
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
export interface accessTokenPayload {
  uid: string
  email: string
  iat: number
  orgId: string
  role: Role
  userStatus: StatusType
}

@Injectable()
export class JWTTokenService {
  verifyAccessToken(token: string): accessTokenPayload | null {
    try {
      if (!token) {
        return null
      }
      return jwt.verify(token, process.env.JWT_SECRET) as accessTokenPayload
    } catch (error) {
      console.error('Token verification failed:', error)
      return null
    }
  }
}
