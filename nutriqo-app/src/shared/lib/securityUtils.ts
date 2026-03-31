/**
 * Security Utilities for Authentication
 * Provides cryptographically secure password and token generation
 */

import crypto from 'crypto';

/**
 * Generate a cryptographically secure password for OAuth users
 * Uses random bytes instead of deterministic hash
 * @param email User email (used for logging only, not password generation)
 * @returns Secure 32-character password
 */
export function generateSecureOAuthPassword(email: string): string {
  return crypto.randomBytes(24).toString('base64').slice(0, 32);
}

/**
 * Verify JWT signature and payload integrity
 * @param token JWT token string
 * @param secret NEXTAUTH_SECRET
 * @returns Decoded token if valid, null if invalid
 */
export function verifyJWTSignature(token: string, secret: string): any {
  try {
    if (!token || !secret) {
      return null;
    }

    // Split JWT into parts
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const [header, payload, signature] = parts;

    // Recreate signature for verification
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${header}.${payload}`)
      .digest('base64url');

    // Verify signature matches
    if (signature !== expectedSignature) {
      return null;
    }

    // Decode payload safely
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'));
    
    // Verify token not expired
    if (decoded.exp && decoded.exp < Date.now() / 1000) {
      return null;
    }

    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Verify Stripe webhook signature
 * @param payload Webhook payload as string
 * @param signature Signature from Stripe header
 * @param secret Stripe webhook secret
 * @returns true if valid, false otherwise
 */
export function verifyStripeWebhook(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    if (!payload || !signature || !secret) {
      return false;
    }

    // Extract timestamp and signatures from header
    const elements = signature.split(',');
    let timestamp = '';
    let signedContent = '';

    for (const element of elements) {
      const [key, value] = element.split('=');
      if (key === 't') {
        timestamp = value;
      }
      if (key === 'v1') {
        signedContent = value;
      }
    }

    if (!timestamp || !signedContent) {
      return false;
    }

    // Create signed content
    const signedString = `${timestamp}.${payload}`;

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(signedString)
      .digest('hex');

    // Use timing-safe comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(signedContent),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    return false;
  }
}

/**
 * Hash sensitive data for logging (one-way, non-reversible)
 * Safe to log, cannot reveal original data
 * @param data Data to hash
 * @returns SHA256 hash (hex)
 */
export function hashForLogging(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex').slice(0, 16);
}
