import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { GraphQLError } from 'graphql/error';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
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
  }
}
