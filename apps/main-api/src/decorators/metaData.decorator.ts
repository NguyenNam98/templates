import {
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
} from '@nestjs/common'
import { BaseException } from '../app.exception'
import { ApiHeader } from '@nestjs/swagger'

export const MetaData = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest()
    const metaData = request.metaData
    return data ? metaData?.[data] : metaData
  },
)

/**
 * Use when post request to others service which need cookie to check authentication
 */
export const SaCookies = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    return ctx.switchToHttp().getRequest().cookies
  },
)

export const GuardException = (exception: BaseException) =>
  SetMetadata('guard-exception', exception)

export function DecodedTokenHeader() {
  return ApiHeader({
    name: 'decoded-token',
    schema: {
      default:
        '{"uid":"17fb59fb-fabc-4c26-970b-11a17d103395","email":"admin-org1@gmail.com","orgId":"d3f4902c-e2fb-4227-a5a8-362d4e39997c"}',
    },
    description:
      'A JWT token that contains user metadata such as uid, email, tenant, and organization ID',
  })
}
