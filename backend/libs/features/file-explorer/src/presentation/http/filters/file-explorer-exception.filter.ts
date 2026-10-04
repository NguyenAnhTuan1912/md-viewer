import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import type { Response } from 'express';
import {
  InvalidFileExplorerInputError,
  FileExplorerNotFoundError,
  SourceAccessDeniedError,
} from '../../../domain/errors/file-explorer.errors';

@Catch(
  InvalidFileExplorerInputError,
  FileExplorerNotFoundError,
  SourceAccessDeniedError,
)
export class FileExplorerExceptionFilter implements ExceptionFilter {
  catch(error: Error, host: ArgumentsHost): void {
    const [status, label] =
      error instanceof InvalidFileExplorerInputError
        ? ([400, 'Bad Request'] as const)
        : error instanceof SourceAccessDeniedError
          ? ([403, 'Forbidden'] as const)
          : ([404, 'Not Found'] as const);
    // Preserve Nest's existing response shape for frontend API error handling.
    host
      .switchToHttp()
      .getResponse<Response>()
      .status(status)
      .json(HttpException.createBody(error.message, label, status));
  }
}
