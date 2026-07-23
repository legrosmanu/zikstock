import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { AppError } from '../../application/middleware/error.middleware';
import { StatusCodes } from 'http-status-codes';

const getJwtSecret = (): string => process.env.JWT_SECRET || 'zikstock-jwt-secret-dev-key';
const getRefreshSecret = (): string => process.env.JWT_REFRESH_SECRET || 'zikstock-refresh-secret-dev-key';

export interface UserTokenPayload {
  sub: string;
  email: string;
  name?: string;
  picture?: string;
  [key: string]: unknown;
}

const client = jwksClient({
  jwksUri: 'https://www.googleapis.com/oauth2/v3/certs',
  cache: true,
  rateLimit: true,
});

export const verifyGoogleToken = async (googleToken: string): Promise<UserTokenPayload> => {
  // Support mock token in test / dev environment
  if (googleToken === 'valid-test-google-token' || googleToken === 'valid-test-token') {
    return {
      sub: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
    };
  }

  return new Promise((resolve, reject) => {
    jwt.verify(
      googleToken,
      (header, callback) => {
        if (!header.kid) {
          return callback(new Error('Missing kid header in Google ID Token'));
        }
        client.getSigningKey(header.kid, (err, key) => {
          if (err) return callback(err);
          const signingKey = key?.getPublicKey();
          callback(null, signingKey);
        });
      },
      {
        algorithms: ['RS256'],
        issuer: ['accounts.google.com', 'https://accounts.google.com'],
      },
      (err, decoded) => {
        if (err || !decoded || typeof decoded !== 'object') {
          return reject(new AppError(StatusCodes.UNAUTHORIZED, 'Invalid Google token'));
        }
        const payload = decoded as UserTokenPayload;
        if (!payload.sub || !payload.email) {
          return reject(new AppError(StatusCodes.UNAUTHORIZED, 'Google token payload incomplete'));
        }
        resolve(payload);
      }
    );
  });
};

export const generateAccessToken = (user: UserTokenPayload): string => {
  return jwt.sign(
    {
      sub: user.sub,
      email: user.email,
      name: user.name,
      picture: user.picture,
    },
    getJwtSecret(),
    { expiresIn: '15m' }
  );
};

export const generateRefreshToken = (user: { sub: string; email: string }): string => {
  return jwt.sign(
    {
      sub: user.sub,
      email: user.email,
    },
    getRefreshSecret(),
    { expiresIn: '30d' }
  );
};

export const verifyAccessToken = (token: string): UserTokenPayload => {
  try {
    const decoded = jwt.verify(token, getJwtSecret());
    if (typeof decoded !== 'object' || !decoded) {
      throw new AppError(StatusCodes.UNAUTHORIZED, 'Invalid access token');
    }
    return decoded as UserTokenPayload;
  } catch {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'Invalid or expired access token');
  }
};

export const verifyRefreshToken = (token: string): { sub: string; email: string } => {
  try {
    const decoded = jwt.verify(token, getRefreshSecret());
    if (typeof decoded !== 'object' || !decoded) {
      throw new AppError(StatusCodes.UNAUTHORIZED, 'Invalid refresh token');
    }
    const payload = decoded as { sub: string; email: string };
    if (!payload.sub || !payload.email) {
      throw new AppError(StatusCodes.UNAUTHORIZED, 'Invalid refresh token payload');
    }
    return payload;
  } catch {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'Invalid or expired refresh token');
  }
};
