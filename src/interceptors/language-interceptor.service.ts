import type {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
} from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import type { Observable } from 'rxjs';

import { LanguageCodeEnum } from '../constants';
import { ContextProvider } from '../providers';

@Injectable()
export class LanguageInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<undefined> {
    const request = context.switchToHttp().getRequest();
    const language: string | undefined =
      request.headers['x-language']?.toUpperCase();

    if (language && LanguageCodeEnum[language]) {
      ContextProvider.setLanguage(language);
    }

    return next.handle();
  }
}
