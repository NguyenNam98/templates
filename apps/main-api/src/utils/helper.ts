import * as generator from 'generate-password'

function removeCustomKeys(
  dataDecodeToken: Record<string, any>,
): Record<string, any> {
  const result: Record<string, any> = {}

  // Iterate over the object keys
  for (const key in dataDecodeToken) {
    if (dataDecodeToken.hasOwnProperty(key)) {
      if (!key.startsWith('custom:')) {
        result[key] = dataDecodeToken[key]
      }
    }
  }

  return result
}

export function generateRandomPassword(): string {
  return process.env.ENV === 'develop'
    ? '123456789@Sa'
    : generator.generate({
        length: 12,
        numbers: true,
        symbols: '@$&+,:=?@#|<>.^*()%!-',
        uppercase: true,
        lowercase: true,
        strict: true,
      })
}
export { removeCustomKeys }
