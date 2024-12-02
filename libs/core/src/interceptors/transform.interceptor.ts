import { Injectable, NestInterceptor, ExecutionContext, CallHandler, HttpStatus } from '@nestjs/common';
import { Result } from '@weishour/core/interfaces';
import { Observable, map } from 'rxjs';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Result> {
  constructor() {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<Result> {
    return next.handle().pipe(
      map((data: Result) => {
        let result: Result;

        if (typeof data === 'string') {
          result = {
            status: true,
            code: HttpStatus.OK,
            data,
          };
        } else {
          result = { ...data };
        }

        return result;
      }),
    );
  }
}
