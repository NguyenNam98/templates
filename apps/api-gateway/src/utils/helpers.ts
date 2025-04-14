import {
  API_PREFIX,
  API_AUTH_PREFIX,
  URL_PUBLIC,
  URL_STATIC_FILE,
  URL_USER,
  URL_ADMIN,
  URL_SUPER_ADMIN,
} from '../app.constant'

export const isAuthUrl = (url: string) => {
  return url.startsWith(API_AUTH_PREFIX)
}

export const isApiUrl = (url: string) => {
  // return url.startsWith(API_PREFIX)
  return API_PREFIX.some((api) => url.startsWith(api))
}

export const isStaticUrl = (url: string) => {
  return URL_STATIC_FILE.some((api) => url.startsWith(api))
}

export const isPublicUrl = (url: string) => {
  return URL_PUBLIC.some((api) => url.startsWith(api))
}

export const isUserUrl = (url: string) => {
  return URL_USER.some((api) => url.startsWith(api))
}

export const isAdminUrl = (url: string) => {
  return URL_ADMIN.some((api) => url.startsWith(api))
}

export const isSuperAdminUrl = (url: string) => {
  return URL_SUPER_ADMIN.some((api) => url.startsWith(api))
}
