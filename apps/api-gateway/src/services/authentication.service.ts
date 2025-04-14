import { Injectable } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { firstValueFrom } from 'rxjs'
import { AxiosRequestHeaders } from 'axios'
import { accessTokenPayload } from './JWTToken.service'
import { PREFIX_API_AUTH_V1 } from '@/app.constant'
import { TBaseDto } from '@/app.typing'

@Injectable()
export class AuthenticationService {
  constructor(private readonly httpService: HttpService) {}

  async refreshToken(headers: AxiosRequestHeaders): Promise<
    TBaseDto<{
      ats: string
      attributes: accessTokenPayload
    }>
  > {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${process.env.API_DOMAIN}/${PREFIX_API_AUTH_V1}/authenticate/refresh`,
          {
            headers: {
              cookie: headers.cookie,
            },
          },
        ),
      )

      return response.data
    } catch (error) {
      console.error('validateToken error:', error)
      return {
        error: 'Invalid token',
        data: {
          ats: '',
          attributes: {} as accessTokenPayload,
        },
      }
    }
  }
}
