import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
} from '@nestjs/common';
import { Request, Response } from 'express';
import * as Sentry from '@sentry/node';

@Catch(BadRequestException)
export class BadRequestFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    const exceptionResponse = exception.getResponse().valueOf();
    const exceptionResponseMessage =
      exceptionResponse !== null &&
      typeof exceptionResponse === 'object' &&
      exceptionResponse.hasOwnProperty('message')
        ? exceptionResponse['message']
        : 'Message unspecified';

    const consumableMessage = Array.isArray(exceptionResponseMessage)
      ? exceptionResponseMessage.join(', ')
      : exceptionResponseMessage;

    Sentry.withScope((scope) => {
      scope.setExtras({
        exception: {
          error: exceptionResponse.hasOwnProperty('error')
            ? exceptionResponse['error']
            : 'BadRequest',
          message: consumableMessage,
          statusCode: status,
        },
        request: {
          method: request.method,
          url: request.url,
          body: request.body,
          params: request.params,
          query: request.query,
        },
      });
      Sentry.captureException(exception);
    });

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: consumableMessage,
    });
  }
}
