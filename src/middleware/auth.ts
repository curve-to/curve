import * as koajwt from 'koa-jwt';
import * as jwt from 'jsonwebtoken';
import { secret } from '../config';

const whitelist = [
  /^\/user/,
];

export const tokenValidation = (ctx, next) => {
  return next().catch((err) => {
    if (err.status === 403) {
      return ctx.throw(403, 'token is invalid');
    }

    throw err;
  });
};

// Get account info by decoding
export const decodeJwt = (ctx) => {
  if (!ctx.request.header.authorization) return null;

  const token = ctx.request.header.authorization;
  const decoded = jwt.decode(token);

  return decoded;
};

export const jwtMiddleware = koajwt({ secret }).unless({ path: whitelist });
