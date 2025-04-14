import { Role } from '@devbridge/entities'
import { Injectable } from '@nestjs/common'
import * as jwt from 'jsonwebtoken'

export interface accessTokenPayload {
  uid: string
  email: string
  iat: number
  orgId: string
  role: Role
}

export interface refreshTokenPayload {
  uid: string
  iat: number
}
export enum EAudience {
  FORGOT_PASSWORD = 'fp',
  CUSTOM_TOKEN = 'ct',
}
export interface customTokenPayload {
  uid: string
  iat: number
  aud: EAudience
}
@Injectable()
export class JWTTokenService {
  private readonly jwtSecret

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET
  }

  generateToken(
    payload: accessTokenPayload | refreshTokenPayload,
    expireIn: jwt.SignOptions['expiresIn'],
  ): string {
    const options: jwt.SignOptions = {
      expiresIn: expireIn,
      issuer: 'sample-assist',
    }

    // Generate the token
    return jwt.sign(payload, this.jwtSecret, options)
  }

  generateCustomToken(
    payload: customTokenPayload,
    expireIn: jwt.SignOptions['expiresIn'],
  ): string {
    const options: jwt.SignOptions = {
      expiresIn: expireIn,
      issuer: 'sample-assist',
    }

    // Generate the token
    return jwt.sign(payload, this.jwtSecret, options)
  }
  verifyAccessToken(token: string): accessTokenPayload | null {
    try {
      return jwt.verify(token, this.jwtSecret) as accessTokenPayload
    } catch (error) {
      console.error('Token verification failed:', error)
      return null
    }
  }

  verifyRefreshToken(token: string): refreshTokenPayload | null {
    try {
      return jwt.verify(token, this.jwtSecret) as refreshTokenPayload
    } catch (error) {
      console.error('Token verification failed:', error)
      return null
    }
  }
  verifyCustomToken(token: string): customTokenPayload | null {
    try {
      return jwt.verify(token, this.jwtSecret) as customTokenPayload
    } catch (error) {
      console.error('Token verification failed:', error)
      return null
    }
  }
}
