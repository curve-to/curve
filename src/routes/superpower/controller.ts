import { Context } from 'koa';
import { listCollections } from '../../common';

/**
 * Get all collection names
 * @param ctx Context
 */
export const getAllCollections = async (ctx: Context): Promise<void> => {
  const collectionNames = await listCollections();
  ctx.body = collectionNames;
};
