type ProviderError = { statusCode?: number; responseBody?: string; message?: string; lastError?: unknown; cause?: unknown };

/** Turns a provider failure (possibly wrapped in retry errors) into a message a user can act on. */
export function describe(e: unknown): string {
  // The AI SDK wraps the provider's error after retries; walk down to it.
  let err = e as ProviderError | undefined;
  for (let i = 0; i < 5 && err && err.statusCode === undefined && (err.lastError || err.cause); i++) {
    err = (err.lastError ?? err.cause) as ProviderError;
  }
  const status = err?.statusCode;
  const detail = `${err?.responseBody ?? ""} ${err?.message ?? ""}`;
  if (status === 401 || status === 403) return "The model provider rejected the server's API key.";
  if (/credit|billing|quota|RESOURCE_EXHAUSTED|insufficient/i.test(detail)) {
    return "The model provider says this account is out of credit or quota. Top up its billing, or pick another model.";
  }
  if (status === 429) return "The model provider is rate-limiting requests. Wait a minute, then retry.";
  return "The model provider failed to reply. Retry, or pick another model.";
}
