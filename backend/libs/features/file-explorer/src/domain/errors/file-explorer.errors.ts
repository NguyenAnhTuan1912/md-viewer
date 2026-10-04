/** Feature errors are independent of HTTP; presentation chooses status codes. */
export class InvalidFileExplorerInputError extends Error {
  readonly name = 'InvalidFileExplorerInputError';
}

export class FileExplorerNotFoundError extends Error {
  readonly name = 'FileExplorerNotFoundError';
}

export class SourceAccessDeniedError extends Error {
  readonly name = 'SourceAccessDeniedError';
}
