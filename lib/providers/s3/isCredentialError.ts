import {
  S3ServiceException,
} from "@aws-sdk/client-s3";

const CREDENTIAL_ERROR_NAMES = [
  "SignatureDoesNotMatch",
  "InvalidAccessKeyId",
  "ExpiredToken",
  "InvalidToken",
  "AuthorizationHeaderMalformed",
  "RequestTimeTooSkewed",
];

export function isCredentialError(err: unknown): boolean {
  // 1. Client-side: credentials could not be resolved at all.
  if (err instanceof Error && (err.name === "CredentialsProviderError" || err.message.includes("ENOTFOUND"))) return true;

  const e = err as S3ServiceException;
  if (!e?.$metadata) return false; // not an SDK service error

  // 2. Service-side: code-by-name (works even for unmodeled errors).
  if (e.name && CREDENTIAL_ERROR_NAMES.includes(e.name)) return true;

  // 3. Fallback: 403 with no recognised code (e.g. HEAD requests).
  return e.$metadata.httpStatusCode === 403 && e.name !== "AccessDenied";
}