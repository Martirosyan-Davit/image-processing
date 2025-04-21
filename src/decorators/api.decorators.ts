import type { Type } from '@nestjs/common';
import { applyDecorators, Controller, HttpStatus } from '@nestjs/common';
import {
  ApiForbiddenResponse,
  ApiHeader,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import _ from 'lodash';

interface IApiResponseOptions {
  // eslint-disable-next-line @typescript-eslint/ban-types
  type?: Type<unknown> | Function | [Function] | string;
  status: HttpStatus;
  tags?: string[];
  summary?: string;
  description?: string;
}

interface IApiExceptionResponseOptions {
  skipForbidden?: true;
  skipUnauthorized?: true;
  skipUnprocessable?: true;
}

export function ApiController(prefix: string): ClassDecorator {
  return applyDecorators(
    Controller(prefix),
    ApiTags(prefix),
    ApiHeader({
      name: 'x-timezone',
      description:
        'The "x-timezone" is used to know timezone of requested user and get correct data for that timezone',
      required: false,
    }),
    ApiHeader({
      name: 'x-language',
      description:
        'The "x-language" is used to know which language is prefer requested user and get correct data for that language',
      required: false,
    }),
  );
}

export function ApiExceptionResponse(options?: IApiExceptionResponseOptions) {
  const decorators: MethodDecorator[] = [];

  if (!options?.skipForbidden) {
    decorators.push(
      ApiForbiddenResponse({
        description: `
A "Forbidden" response is an HTTP status code that indicates that the client making the request is not authorized to access the requested resource.
When a server returns a "Forbidden" response (HTTP status code 403), it means that the server understood the request, but is refusing to fulfill it.`,
      }),
    );
  }

  if (!options?.skipUnauthorized) {
    decorators.push(
      ApiUnauthorizedResponse({
        description: `
An "Unauthorized" response is an HTTP status code that indicates that the client making the 
request is not authenticated to access the requested resource.
When a server returns an "Unauthorized" response (HTTP status code 401), it means that the server has not recognized
the authentication credentials provided by the client, or the client has not provided any authentication credentials at all.
      `,
      }),
    );
  }

  if (!options?.skipUnprocessable) {
    decorators.push(
      ApiUnprocessableEntityResponse({
        description: `
  The 422 status code is a client error response status code in the HTTP protocol, 
  which indicates that the server was unable to process the request because the request was 
  well-formed, but the server was unable to perform the requested action.`,
      }),
    );
  }

  return applyDecorators(...decorators);
}

export function ApiResponseOptions(
  options: IApiResponseOptions & IApiExceptionResponseOptions,
) {
  const decorators: MethodDecorator[] = [
    ApiResponse({
      type: options.type,
      description: _.startCase(_.toLower(HttpStatus[options.status])),
      status: options.status,
    }),
    ApiOperation({
      tags: options.tags,
      summary: options.summary,
      description: options.description,
    }),
    ApiExceptionResponse({
      skipForbidden: options.skipForbidden,
      skipUnauthorized: options.skipUnauthorized,
      skipUnprocessable: options.skipUnprocessable,
    }),
  ];

  return applyDecorators(...decorators);
}

export function ApiOkResponseOptions(
  options: Omit<IApiResponseOptions, 'status'>,
) {
  return applyDecorators(
    ApiResponseOptions({ ...options, status: HttpStatus.OK }),
  );
}
