import * as koajwt from 'koa-jwt';
import * as jwt from 'jsonwebtoken';
import { Context } from 'koa';
import config from '../config';

const whitelist = [/^\/user/, /\/collection/, /\/superpower/];

export const tokenValidation = async (
  ctx: Context,
  next: () => Promise<never>
): Promise<void> => {
  return next().catch(err => {
    if (err.status === 401) {
      return ctx.throw(401, 'token is invalid.');
    }

    throw err;
  });
};

// Get account info by decoding
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const decodeJwt = (ctx: Context): any => {
  const { authorization } = ctx.request.header;
  if (!authorization || !authorization.includes('bearer ')) return {};

  const token = authorization.split(' ')[1];

  try {
    return jwt.verify(token, config.database.SECRET);
  } catch (error) {
    return ctx.throw(403, 'Token has expired. Please login again.');
  }
};

export const jwtMiddleware = koajwt({ secret: config.database.SECRET }).unless({
  path: whitelist,
});
