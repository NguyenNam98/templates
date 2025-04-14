export const ENV_LOCAL = 'develop'

export const DATABASE_NAMES = {
  MASTER: {
    DB: 'master',
    NAME: 'DB_master',
  },
}
export const REDIS_CLUSTER = {
  PRIMARY: 'REDIS_PRIMARY',
  READER: 'REDIS_READER',
}
export const RATE_LIMIT_DEFAULT = {
  LIMIT: process.env.ENV == 'production' ? 100 : 500,
  TTL: 15 * 60, // 15 minutes
}

export const REFRESH_TOKEN_SIG_COOKIE = 'tsr'
export const ACCESS_TOKEN_SIG_COOKIE = 'tsa'
export const ID_TOKEN_SIG_COOKIE = 'tsi'

export const USER_INFO = 'user_info'
export const ACCESS_TOKEN_LIFE_TIME = 60 * 60 * 1000 * 15 // 15 min
export const CUSTOM_FORGOT_PASSWORD_TOKEN_LIFE_TIME = '15m' // 15 min
export const CUSTOM_TOKEN_LIFE_TIME = '15m' // 15 min
export const REFRESH_TOKEN_LIFE_TIME = 1000 * 60 * 60 * 60 * 24 * 14 // 14 days

export const ACCESS_TOKEN_JWT_LIFE_TIME = '15m' // 15 min
export const REFRESH_TOKEN_JWT_LIFE_TIME = '14d' // 14 days

export const TEMP_FOLDER = './tmp'
export const BASE_URL = '/api/5econd/'
