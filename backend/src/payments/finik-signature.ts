import { createSign, createVerify } from 'node:crypto';

export interface FinikRequestData {
  httpMethod: string;
  path: string;
  headers: Record<string, string | undefined>;
  queryStringParameters: Record<string, string | undefined> | null;
  body: Record<string, unknown> | null;
}

export function getFinikCanonicalData(request: FinikRequestData): string {
  const host = request.headers.Host;
  if (!host) throw new Error("Header 'Host' is required");

  const signedHeaders = Object.keys(request.headers)
    .filter((key) => key.toLowerCase().startsWith('x-api-'))
    .sort()
    .map((key) => {
      const value = request.headers[key];
      if (value === undefined) throw new Error(`Header '${key}' contains invalid value`);
      return `${key.toLowerCase()}:${value}`;
    });
  const headers = [`host:${host}`, ...signedHeaders].join('&');
  const query = Object.entries(request.queryStringParameters ?? {})
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${encodeURI(decodeURI(key))}=${encodeURI(decodeURI(value ?? ''))}`)
    .join('&');
  const body = request.body
    ? JSON.stringify(Object.entries(request.body).sort(([left], [right]) => left.localeCompare(right)).reduce<Record<string, unknown>>((sorted, [key, value]) => {
      sorted[key] = value;
      return sorted;
    }, {}))
    : '';
  const parts = [request.httpMethod.toLowerCase(), decodeURI(request.path), headers];
  if (query) parts.push(query);
  parts.push(body);
  return parts.join('\n');
}

export function signFinikRequest(request: FinikRequestData, privateKey: string): string {
  const signer = createSign('SHA256');
  signer.update(getFinikCanonicalData(request));
  return signer.sign(privateKey, 'base64');
}

export function verifyFinikRequest(request: FinikRequestData, publicKey: string, signature: string): boolean {
  try {
    const verifier = createVerify('SHA256');
    verifier.update(getFinikCanonicalData(request));
    return verifier.verify(publicKey, signature, 'base64');
  } catch {
    return false;
  }
}
