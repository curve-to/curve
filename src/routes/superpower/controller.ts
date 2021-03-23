import { Context } from 'koa';
import { coreCollections } from '../../config/database';

/**
 * Get all collection names
 * @param ctx Context
 */
export const getAllCollections = async (ctx: Context): Promise<void> => {
  const listCollections = (await coreCollections).db.listCollections().toArray();
  const collectionNames = (await listCollections).map(
    collection => collection.name
  );

  ctx.body = collectionNames;
};
