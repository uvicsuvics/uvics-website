export const ERROR_STATUS = {
  VALIDATION_ERROR: 422,
  UNAUTHENTICATED: 401,
  INVALID_CREDENTIALS: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  RATE_LIMITED: 429,
  SERVICE_UNAVAILABLE: 503,
  INTERNAL_ERROR: 500,
} as const;
export type ErrorCode = keyof typeof ERROR_STATUS;
const messages: Record<ErrorCode, string> = {
  VALIDATION_ERROR: "Periksa kembali data yang diisi.",
  UNAUTHENTICATED: "Silakan masuk kembali.",
  INVALID_CREDENTIALS: "Email atau password tidak valid.",
  FORBIDDEN: "Akses tidak diizinkan.",
  NOT_FOUND: "Data tidak ditemukan.",
  CONFLICT: "Data telah berubah. Muat ulang dan coba kembali.",
  RATE_LIMITED: "Terlalu banyak percobaan. Coba kembali setelah beberapa saat.",
  SERVICE_UNAVAILABLE:
    "Layanan sementara tidak tersedia. Silakan coba kembali.",
  INTERNAL_ERROR: "Terjadi kesalahan. Silakan coba kembali.",
};
export class AppError extends Error {
  constructor(
    readonly code: ErrorCode,
    readonly details: {
      fieldErrors?: Record<string, string[]>;
      retryAfter?: number;
    } = {},
  ) {
    super(messages[code]);
  }
}
export type OperationResult<T> =
  | { ok: true; data: T }
  | {
      ok: false;
      error: {
        code: ErrorCode;
        message: string;
        field_errors?: Record<string, string[]>;
      };
    };
export function toFailure(
  error: unknown,
): Extract<OperationResult<never>, { ok: false }> {
  const safe =
    error instanceof AppError ? error : new AppError("INTERNAL_ERROR");
  return {
    ok: false,
    error: {
      code: safe.code,
      message: safe.message,
      ...(safe.details.fieldErrors
        ? { field_errors: safe.details.fieldErrors }
        : {}),
    },
  };
}
export const PRIVATE_HEADERS = {
  "Cache-Control": "private, no-cache, no-store, must-revalidate, max-age=0",
  Expires: "0",
  Pragma: "no-cache",
};
export function httpFailure(error: unknown) {
  const result = toFailure(error);
  return Response.json(result, {
    status: ERROR_STATUS[result.error.code],
    headers: {
      ...PRIVATE_HEADERS,
      ...(error instanceof AppError && error.code === "RATE_LIMITED"
        ? { "Retry-After": String(error.details.retryAfter ?? 60) }
        : {}),
    },
  });
}
export function databaseError(error: { code?: string } | null): never {
  if (error?.code === "42501") throw new AppError("FORBIDDEN");
  if (error?.code === "23505" || error?.code === "P0001")
    throw new AppError("CONFLICT");
  if (error?.code === "P0002") throw new AppError("NOT_FOUND");
  throw new AppError("SERVICE_UNAVAILABLE");
}
