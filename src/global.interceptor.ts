import {
  CallHandler,
  ContextType,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { randomUUID } from 'crypto';
import { Request } from 'express';
import { Observable, tap } from 'rxjs';

@Injectable()
export class GlobalInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    console.log('Before...');
    const request =
      context.getType<ContextType | 'graphql'>() === 'graphql'
        ? GqlExecutionContext.create(context).getContext<{
            req: Request & { headers: { 'correlation-id': string } };
          }>().req
        : context
            .switchToHttp()
            .getRequest<Request & { headers: { 'correlation-id': string } }>();

    request.headers['correlation-id'] =
      request.headers['correlation-id'] || randomUUID();

    const now = Date.now();
    return next
      .handle()
      .pipe(tap(() => console.log(`After... ${Date.now() - now}ms`)));
  }
}
