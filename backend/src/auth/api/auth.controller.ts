import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AppError } from '../../application/middleware/error.middleware';
import {
  verifyGoogleToken,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../domain/auth.service';
import { syncUser, getUserProfile } from '../../users/domain/user.service';

const COOKIE_NAME = 'zikstock_refresh_token';
const REFRESH_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export const loginHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const googleToken = req.body.googleToken || req.body.credential;
    if (!googleToken || typeof googleToken !== 'string') {
      throw new AppError(StatusCodes.BAD_REQUEST, 'Missing or invalid googleToken parameter');
    }

    const payload = await verifyGoogleToken(googleToken);

    const user = await syncUser({
      id: payload.sub,
      email: payload.email,
      name: payload.name || undefined,
      picture: (payload.picture as string) || undefined,
    });

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken({ sub: user.id, email: user.email });

    res.cookie(COOKIE_NAME, refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: REFRESH_MAX_AGE_MS,
    });

    res.status(StatusCodes.OK).json({
      accessToken,
      refreshToken,
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const refreshHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const refreshToken = req.cookies?.[COOKIE_NAME] || req.body?.refreshToken;
    if (!refreshToken || typeof refreshToken !== 'string') {
      throw new AppError(StatusCodes.UNAUTHORIZED, 'Refresh token missing');
    }

    const tokenPayload = verifyRefreshToken(refreshToken);
    const user = await getUserProfile(tokenPayload.sub);

    const accessToken = generateAccessToken({
      sub: user.id,
      email: user.email,
      name: user.name,
      picture: user.picture,
    });

    const newRefreshToken = generateRefreshToken({ sub: user.id, email: user.email });

    res.cookie(COOKIE_NAME, newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: REFRESH_MAX_AGE_MS,
    });

    res.status(StatusCodes.OK).json({
      accessToken,
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const logoutHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    res.clearCookie(COOKIE_NAME, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    res.status(StatusCodes.OK).json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};
