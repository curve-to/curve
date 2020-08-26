import * as koajwt from 'koa-jwt';
import * as jwt from 'jsonwebtoken';
import { secret } from '../config';

const whitelist = [
  /^\/collection/,
];

export const tokenValidation = (ctx, next) => {
  return next().catch((err) => {
    if (err.status === 401) {
      return ctx.throw(401, 'token is invalid');
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
