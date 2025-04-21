import { Transform } from 'class-transformer';
import { parsePhoneNumber } from 'libphonenumber-js';
import type { Many } from 'lodash';
import { castArray, trim } from 'lodash';

/**
 * @description trim spaces from start and end, replace multiple spaces with one.
 * @example
 * @ApiProperty()
 * @IsString()
 * @Trim()
 * name: string;
 * @returns PropertyDecorator
 * @constructor
 */
export function Trim(trimNewLines: boolean): PropertyDecorator {
  return Transform((params): Many<string> => {
    const value = params.value as Many<string>;

    if (!value) {
      return value;
    }

    if (Array.isArray(value)) {
      return value.map((v: string) => {
        const trimmedValue = trim(v);

        if (trimNewLines) {
          return trimmedValue.replace(/\s\s+/g, ' ');
        }

        return trimmedValue;
      });
    }

    const trimmedValue = trim(value as string);

    if (trimNewLines) {
      return trimmedValue.replace(/\s\s+/g, ' ');
    }

    return trimmedValue;
  });
}

export function ToBoolean(): PropertyDecorator {
  return Transform(
    (params): boolean => {
      switch (params.value) {
        case 'true': {
          return true;
        }

        case 'false': {
          return false;
        }

        default: {
          return params.value;
        }
      }
    },
    { toClassOnly: true },
  );
}

/**
 * @description convert string or number to integer
 * @example
 * @IsNumber()
 * @ToInt()
 * name: number;
 * @returns PropertyDecorator
 * @constructor
 */
export function ToInt(): PropertyDecorator {
  return Transform(
    (params): number => {
      const value = params.value as string;

      return Number.parseInt(value, 10);
    },
    { toClassOnly: true },
  );
}

/**
 * @description transforms to array, specially for query params
 * @example
 * @IsNumber()
 * @ToArray()
 * name: number;
 * @constructor
 */
export function ToArray(): PropertyDecorator {
  return Transform(
    (params): unknown[] => {
      const value = params.value;

      if (!value) {
        return value;
      }

      return castArray(value);
    },
    { toClassOnly: true },
  );
}

export function ToLowerCase(): PropertyDecorator {
  return Transform(
    (params): Many<string> | undefined | null => {
      const value = params.value;

      if (!value) {
        return value;
      }

      if (Array.isArray(value)) {
        return value.map((v) => v.toLowerCase());
      }

      return value.toLowerCase();
    },
    {
      toClassOnly: true,
    },
  );
}

export function ToUpperCase(): PropertyDecorator {
  return Transform(
    (params): Many<string> | undefined | null => {
      const value = params.value;

      if (!value) {
        return value;
      }

      if (Array.isArray(value)) {
        return value.map((v) => v.toUpperCase());
      }

      return value.toUpperCase();
    },
    {
      toClassOnly: true,
    },
  );
}

export function PhoneNumberSerializer(): PropertyDecorator {
  return Transform((params) => {
    try {
      return parsePhoneNumber(params.value as string).number;
    } catch {
      return params.value;
    }
  });
}
