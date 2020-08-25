
import { Context } from 'koa';

/**
 * Create a database
 * @param ctx Context
 */
export const _create = async (ctx: Context) => {
  ctx.body = 'create';
};


/**
 * Get a list of databases
 * @param ctx Context
 */
export const _get = async (ctx: Context) => {
  ctx.body = 'get';
};

/**
 * Delete a database
 * @param ctx Context
 */
export const _delete = async (ctx: Context) => {
  ctx.body = 'delete';
};

