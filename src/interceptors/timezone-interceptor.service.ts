import type {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
} from '@nestjs/common';
import { Injectable, UseInterceptors } from '@nestjs/common';
import type { Observable } from 'rxjs';

import { ContextProvider } from '../providers';

@Injectable()
export class TimezoneInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<undefined> {
    const request = context.switchToHttp().getRequest();
    const timezone: string | undefined = request.headers?.['x-timezone'];
    const regex = new RegExp('^GMT[+-]\\d{2}:\\d{2}$');

    if (timezone && regex.test(timezone)) {
      ContextProvider.setTimezone(timezone);
    }

    return next.handle();
  }
}

export function UseTimezoneInterceptor() {
  return UseInterceptors(TimezoneInterceptor);
}
