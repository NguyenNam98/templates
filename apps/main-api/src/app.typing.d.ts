import { Role } from 'entities/privacy/Auth.entity'

interface TMetaData {
  ipAddress: string
  userAgent: string
  authId?: string
  userName?: string
  referer: string
  orgId: string
  email: string
  userId: string
  role: Role
  branchId?: string
}

interface TBaseDto<T> {
  data: T
  error?: string
  message?: string
  status: 'success' | 'fail'
}

export type TTokenResponse = {
  accessToken: string
  idToken: string
  refreshToken: string
}

export type TDecodedTokenDTO = {
  email: string
  uid: string
  collectionOrganizationId: string
}
export type TRegisterResponseDTO = TBaseDto<{ uid: string }>
export type TLoginResponseDTO = TBaseDto<TTokenDTO>
export type TRefreshTokenResponseDTO = TBaseDto<TTokenDTO>
export type TValidateTokenResponseDTO = TBaseDto<TDecodedTokenDTO>

type TTokenPair = {
  ats: string
  rts: string
  // its: string
}

export { TMetaData, TBaseDto, TAuPayload, TTokenPair }
