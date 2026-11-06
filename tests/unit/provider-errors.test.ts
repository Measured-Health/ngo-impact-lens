import { describe as suite, expect, it } from "vitest";
import { describe } from "@/lib/provider-errors";

suite("provider error messages", () => {
  it("reports exhausted credit even when wrapped in a retry error", () => {
    const inner = { statusCode: 429, responseBody: '{"error":{"status":"RESOURCE_EXHAUSTED","message":"Your prepayment credits are depleted."}}' };
    expect(describe({ message: "Failed after 3 attempts", lastError: inner })).toMatch(/out of credit/);
  });
  it("reports a rejected key", () => {
    expect(describe({ statusCode: 401 })).toMatch(/rejected the server's API key/);
  });
  it("reports plain rate limiting", () => {
    expect(describe({ statusCode: 429, message: "Too many requests" })).toMatch(/rate-limiting/);
  });
  it("falls back to a generic message", () => {
    expect(describe(new Error("boom"))).toMatch(/failed to reply/);
  });
});
