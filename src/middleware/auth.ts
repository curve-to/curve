import * as koajwt from 'koa-jwt';
import * as jwt from 'jsonwebtoken';
import { Context } from 'koa';
import { secret } from '../config';

const whitelist = [/^\/user/];

export const tokenValidation = async (
  ctx: Context,
  next: () => Promise<never>
): Promise<void> => {
  return next().catch((err) => {
    if (err.status === 401) {
      return ctx.throw(403, 'token is invalid');
    }

    throw err;
  });
};

// Get account info by decoding
export const decodeJwt = (
  ctx: Context
): string | { [key: string]: unknown } => {
  if (!ctx.request.header.authorization) return null;

  const token = ctx.request.header.authorization;
  return jwt.decode(token);
};

export const jwtMiddleware = koajwt({ secret }).unless({ path: whitelist });
