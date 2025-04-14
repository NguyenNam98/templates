export interface AuthenticateServiceInterface {
  register(...args: any[]);
  login(...args: any[]);
  logout(...args: any[]);
  refreshToken(...args: any[]);
}
