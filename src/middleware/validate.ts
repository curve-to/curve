import { Context } from 'koa';
import { decodeJwt } from './auth';
import { createDynamicModels } from '../common';
import constants from '../config/constants';
import config from '../config';

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
        return ctx.throw(400, `Required field ${field} is not provided.`);
      }
    }

    return await next();
  };
};

/**
 * Disable querying sensitive collections
 */
export const disableSensitiveQuery = () => {
  return async (ctx: Context, next: () => Promise<never>): Promise<void> => {
    const { collection } = ctx.params;
    const sensitiveCollections = ['users', 'cloudFunctions', 'files'];

    if (sensitiveCollections.includes(collection)) {
      ctx.throw(403, 'You are not allowed to perform this action.');
    }

    return await next();
  };
};

/**
 * Disable table operations
 */
export const disableTableOperations = () => {
  return async (ctx: Context, next: () => Promise<never>): Promise<void> => {
    const { role } = decodeJwt(ctx);
    const { collection } = ctx.params;

    // Only users with admin privileges can operate
    if (
      role !== constants.ROLES.ADMIN &&
      config.bannedTables.includes(collection)
    ) {
      ctx.throw(403, 'You are not allowed to perform this action.');
    }

    return await next();
  };
};

/**
 * Require admin middle
 * role type: 0 normal user, 1 admin
 */
export const requireAdmin = () => {
  return async (ctx: Context, next: () => Promise<never>): Promise<void> => {
    const { role } = decodeJwt(ctx);

    // If the route requires admin privileges but user is not an admin, throw an error
    if (role !== constants.ROLES.ADMIN) {
      ctx.throw(
        403,
        'You are not allowed to perform this action. Are you an admin?'
      );
    }

    return await next();
  };
};

/**
 * Require current user middleware
 */
export const requireCurrentUser = () => {
  return async (ctx: Context, next: () => Promise<never>): Promise<void> => {
    const { collection, documentId: id } = ctx.params;
    const { role, uid } = decodeJwt(ctx);

    if (role !== constants.ROLES.ADMIN) {
      const Model = createDynamicModels(collection);
      const record = await Model.findOne({ _id: id }).lean();

      if (!record) {
        ctx.throw(404, 'Record is not found.');
      }

      if (record.createdBy !== uid) {
        ctx.throw(403, 'You are not allowed to perform this action.');
      }
    }
    return await next();
  };
};

/**
 * Require login
 */
export const requireLogin = () => {
  return async (ctx: Context, next: () => Promise<never>): Promise<void> => {
    const { role } = decodeJwt(ctx);

    // if there's no token provided, or user has no role, throw an error
    if (role == null) {
      ctx.throw(403, 'You must log in to perform this action.');
    }

    return await next();
  };
};
