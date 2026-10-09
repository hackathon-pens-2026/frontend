import type { ApiProblem } from "./types";

const FALLBACK_CODES: Record<number, string> = {
  400: "validation_failed",
  401: "unauthorized",
  403: "forbidden",
  404: "not_found",
  409: "conflict",
  413: "invalid_request",
  429: "rate_limit_exceeded",
  503: "persistence_unavailable",
  500: "internal_error",
};

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly problem: ApiProblem | null;

  constructor(status: number, code: string, message: string, problem: ApiProblem | null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.problem = problem;
  }

  get fieldErrors(): Record<string, string[]> {
    return this.problem?.errors ?? {};
  }
}

export async function toApiError(response: Response): Promise<ApiError> {
  let problem: ApiProblem | null = null;
  try {
    problem = (await response.json()) as ApiProblem;
  } catch {
    problem = null;
  }
  const code = problem?.code ?? FALLBACK_CODES[response.status] ?? "request_failed";
  const message =
    problem?.title ?? "Permintaan tidak dapat diproses. Coba kembali.";
  return new ApiError(response.status, code, message, problem);
}

export function toNetworkError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  if (error instanceof DOMException && error.name === "TimeoutError") {
    return new ApiError(504, "timeout", "Server tidak merespons. Coba kembali.", null);
  }
  return new ApiError(0, "network_error", "Tidak dapat menghubungi server. Periksa koneksi Anda.", null);
}
