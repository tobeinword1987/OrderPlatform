import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Request, Response } from 'express';
import { GraphQLError } from 'graphql/error';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    if (exception instanceof HttpException) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();
      const request = ctx.getRequest<Request>();
      const status = exception.getStatus();
      if (
        (host as unknown as { contextType: string }).contextType !== 'graphql'
      ) {
        response.status(status).json({
          statusCode: status,
          response: exception.getResponse(),
          timestamp: new Date().toISOString(),
          path: request.url,
        });
      } else {
        throw new GraphQLError(exception.message, {
          extensions: {
            code: exception.getStatus(),
          },
        });
      }
    } else if (exception instanceof RpcException) {
      const err = exception.getError() as { details: object; code: object };
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();
      const request = ctx.getRequest<Request>();
      response.status(Number(err['code'])).json({
        message: err['details'],
        code: err['code'],
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }
  }
}
