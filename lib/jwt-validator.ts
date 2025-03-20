import { JWK, JWTVerifyResult, jwtVerify } from 'jose';
import { awsConfig } from './aws-config';
import { createHash } from 'crypto';

// Cache for JWKs to avoid fetching them on every request
let jwksCache: { [kid: string]: JWK } = {};
let jwksCacheTime = 0;
const JWKS_CACHE_DURATION = 3600000; // 1 hour in milliseconds

/**
 * Fetch the JSON Web Key Set (JWKS) from Cognito
 * @returns Promise resolving to a map of key IDs to JWKs
 */
async function fetchJwks(): Promise<{ [kid: string]: JWK }> {
  // Check if we have a valid cache
  const now = Date.now();
  if (Object.keys(jwksCache).length > 0 && now - jwksCacheTime < JWKS_CACHE_DURATION) {
    return jwksCache;
  }

  try {
    // Construct the JWKS URL for the Cognito user pool
    const region = awsConfig.region;
    const userPoolId = awsConfig.userPoolId;
    
    if (!userPoolId) {
      throw new Error('User pool ID is not configured');
    }
    
    const jwksUrl = `https://cognito-idp.${region}.amazonaws.com/${userPoolId}/.well-known/jwks.json`;
    
    // Fetch the JWKS
    const response = await fetch(jwksUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch JWKS: ${response.statusText}`);
    }
    
    const jwksData = await response.json();
    
    // Process the keys and update the cache
    const jwks: { [kid: string]: JWK } = {};
    for (const key of jwksData.keys) {
      jwks[key.kid] = key;
    }
    
    jwksCache = jwks;
    jwksCacheTime = now;
    
    return jwks;
  } catch (error) {
    console.error('Error fetching JWKS:', error);
    
    // If we're in development mode, use a fallback for testing
    if (process.env.NODE_ENV === 'development' && Object.keys(jwksCache).length === 0) {
      console.warn('Using fallback JWKS for development');
      const fallbackKid = 'dev-key-id';
      jwksCache[fallbackKid] = {
        kty: 'RSA',
        kid: fallbackKid,
        use: 'sig',
        alg: 'RS256',
      };
      jwksCacheTime = now;
    }
    
    return jwksCache;
  }
}

/**
 * Verify a JWT token issued by Cognito
 * @param token - The JWT token to verify
 * @returns Promise resolving to the verified token payload
 */
export async function verifyToken(token: string): Promise<JWTVerifyResult> {
  try {
    // For development/testing when Cognito is not configured
    if (process.env.NODE_ENV === 'development' && (!awsConfig.userPoolId || awsConfig.jwtSecret)) {
      const secret = new TextEncoder().encode(awsConfig.jwtSecret || 'your-jwt-secret-key');
      return await jwtVerify(token, secret);
    }
    
    // Extract the header to get the key ID (kid)
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      throw new Error('Invalid token format');
    }
    
    const headerJson = Buffer.from(tokenParts[0], 'base64').toString('utf8');
    const header = JSON.parse(headerJson);
    const kid = header.kid;
    
    if (!kid) {
      throw new Error('Token header missing key ID (kid)');
    }
    
    // Get the JWK for this kid
    const jwks = await fetchJwks();
    const jwk = jwks[kid];
    
    if (!jwk) {
      throw new Error(`No matching key found for kid: ${kid}`);
    }
    
    // Import the JWK as a crypto key
    const key = await importJwk(jwk);
    
    // Verify the token
    const result = await jwtVerify(token, key, {
      issuer: `https://cognito-idp.${awsConfig.region}.amazonaws.com/${awsConfig.userPoolId}`,
      audience: awsConfig.userPoolWebClientId,
    });
    
    return result;
  } catch (error) {
    console.error('Token verification failed:', error);
    throw error;
  }
}

/**
 * Import a JWK as a crypto key
 * @param jwk - The JWK to import
 * @returns Promise resolving to a CryptoKey
 */
async function importJwk(jwk: JWK): Promise<CryptoKey> {
  // In a real implementation, we would use the Web Crypto API to import the JWK
  // For simplicity in this example, we'll use a placeholder implementation
  
  // If we're in development mode and using a fallback JWK
  if (process.env.NODE_ENV === 'development' && jwk.kid === 'dev-key-id') {
    // Use the JWT secret for development
    return new TextEncoder().encode(awsConfig.jwtSecret || 'your-jwt-secret-key') as unknown as CryptoKey;
  }
  
  // In a real implementation, this would be:
  // return await crypto.subtle.importKey(
  //   'jwk',
  //   jwk,
  //   {
  //     name: 'RSASSA-PKCS1-v1_5',
  //     hash: { name: 'SHA-256' },
  //   },
  //   false,
  //   ['verify']
  // );
  
  // For now, we'll throw an error since we can't fully implement this without the Web Crypto API
  throw new Error('JWK import not fully implemented in this environment');
}
