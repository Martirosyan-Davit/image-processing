import { getValue, setValue } from 'express-ctx';

import type { LanguageCodeEnum } from '../constants';

export class ContextProvider {
  private static readonly nameSpace = 'request';

  private static readonly languageKey = 'language_key';

  private static readonly timezoneKey = 'timezone_key';

  private static get<T>(key: string): T | undefined {
    return getValue<T>(ContextProvider.getKeyWithNamespace(key));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static set(key: string, value: any): void {
    setValue(ContextProvider.getKeyWithNamespace(key), value);
  }

  private static getKeyWithNamespace(key: string): string {
    return `${ContextProvider.nameSpace}.${key}`;
  }

  static setLanguage(language: string): void {
    ContextProvider.set(ContextProvider.languageKey, language);
  }

  static setTimezone(timezone: string): void {
    ContextProvider.set(ContextProvider.timezoneKey, timezone);
  }

  static getLanguage(): LanguageCodeEnum | undefined {
    return ContextProvider.get<LanguageCodeEnum>(ContextProvider.languageKey);
  }

  static getTimezone(): string | undefined {
    return ContextProvider.get(ContextProvider.timezoneKey);
  }
}
