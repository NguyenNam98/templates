/**
 * This interface is summaries base method for {type_upload}-upload Controller
 */
export interface AuthenticatedControllerInterface {
  register(...args: any[])
  login(...args: any[])
  logout(...args: any[])
  refreshToken(...args: any[])
  // revokeTokenByRefreshToken(...args: any[])
  // revokeAllByAuthId(...args: any[])
}
