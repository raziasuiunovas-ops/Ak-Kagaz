import { generateKeyPairSync } from 'node:crypto';
import { getFinikCanonicalData, signFinikRequest, verifyFinikRequest, type FinikRequestData } from './finik-signature';

describe('Finik request signing', () => {
  const request: FinikRequestData = {
    httpMethod: 'POST',
    path: '/v1/payment',
    headers: { Host: 'api.acquiring.averspay.kg', 'x-api-key': 'api-key-test', 'x-api-timestamp': '1234567890' },
    queryStringParameters: null,
    body: { Amount: 400, CardType: 'FINIK_QR', PaymentId: 'payment-id' },
  };

  it('uses Finik canonical header, query, and top-level JSON ordering', () => {
    expect(getFinikCanonicalData(request)).toBe(
      'post\n/v1/payment\nhost:api.acquiring.averspay.kg&x-api-key:api-key-test&x-api-timestamp:1234567890\n{"Amount":400,"CardType":"FINIK_QR","PaymentId":"payment-id"}',
    );
  });

  it('verifies signed requests and rejects a modified body', () => {
    const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
    const privatePem = privateKey.export({ type: 'pkcs8', format: 'pem' }).toString();
    const publicPem = publicKey.export({ type: 'spki', format: 'pem' }).toString();
    const signature = signFinikRequest(request, privatePem);

    expect(verifyFinikRequest(request, publicPem, signature)).toBe(true);
    expect(verifyFinikRequest({ ...request, body: { ...request.body, Amount: 401 } }, publicPem, signature)).toBe(false);
  });
});
