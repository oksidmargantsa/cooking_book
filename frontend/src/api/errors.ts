export class ApiError extends Error {
  constructor(public status: number, public code: string | null, message?: string) { super(message ?? code ?? `HTTP ${status}`); }
}
