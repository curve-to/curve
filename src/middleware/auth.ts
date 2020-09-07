import * as koajwt from 'koa-jwt';
import * as jwt from 'jsonwebtoken';
import { Context } from 'koa';
import { secret } from '../config';

const whitelist = [/^\/user/, /\/collection/];

export const tokenValidation = async (
  ctx: Context,
  next: () => Promise<never>
): Promise<void> => {
  return next().catch((err) => {
    if (err.status === 401) {
      return ctx.throw(401, 'token is invalid');
    }

    throw err;
  });
};

// Get account info by decoding
export const decodeJwt = (ctx: Context): any => {
  const { authorization } = ctx.request.header;
  if (!authorization || !authorization.includes('bearer ')) return {};

  const token = authorization.split(' ')[1];
  return jwt.decode(token);
};

export const jwtMiddleware = koajwt({ secret }).unless({ path: whitelist });
