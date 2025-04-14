export const ENV_LOCAL = 'develop'

export const API_PREFIX = ['/api', '/sa/upload']
export const API_MAIN_PREFIX = `/api/5econd/v1`
export const API_AUTH_PREFIX = '/api/5econd/v1/auth'

export const TOKEN_COOKIES = {
  idToken: 'tsi',
  refreshToken: 'tsr',
  accessToken: 'tsa',
  decodedToken: 'decodedToken',
  session2FA: 'sfa_tk',
}

export const URL_STATIC_FILE = ['/_next', '/public', '/assets', '*/favicon']

export const URL_PUBLIC = ['/login', '/register']

export const URL_USER = ['/chat']

export const URL_ADMIN = ['/management', '/users']

export const URL_SUPER_ADMIN = ['/super']

export const PREFIX_API_AUTH_V1 = 'api/5econd/v1/auth/user'

export const ACCESS_TOKEN_LIFE_TIME = 60 * 1000 * 5 // 5 min
