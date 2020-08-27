import { Context } from 'koa';
import { decodeJwt } from './auth';

/**
 * Validate fields of a specific route
 * @param fields fields required by the route
 */
export const validate = (fields: string[]) => {
  return async (ctx: Context, next: () => Promise<never>): Promise<void> => {
    if (!fields.length) return await next();

    const { method, query, body } = ctx.request;
    const source = method.toUpperCase() === 'GET' ? query : body;
    const params = Object.keys(source); // params provided by requests

    for (const field of fields) {
      if (!!field && !params.includes(field)) {
        return ctx.throw(400, `required field ${field} is not provided`);
      }
    }

    return await next();
  };
};

/**
 * Check user identity
 * @param requiresAdmin check if the route requires admin
 * user type: 0 normal user, 1 admin
 */
export const checkIdentity = ({
  requiresAdmin = false,
}: {
  requiresAdmin: boolean;
}) => {
  return async (ctx: Context, next: () => Promise<never>): Promise<void> => {
    const { role } = decodeJwt(ctx);

    // if there's no token provided, or user has no role, throw an error
    if (role == null) {
      ctx.throw(403, 'user is not allowed to perform this action');
    }

    // if the route requires admin privileges but user is not an admin, throw an error
    if (requiresAdmin && role !== 1) {
      ctx.throw(
        403,
        'user is not allowed to perform this action. Are you an admin?'
      );
    }

    return await next();
  };
};
