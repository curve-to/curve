import * as _ from 'underscore';
import { Context } from 'koa';
import { collections } from '../../config/database';

/**
 * Get all collection names
 * @param ctx Context
 */
export const getAllCollections = async (ctx: Context): Promise<void> => {
  const listCollections = (await collections).db.listCollections().toArray();
  const collectionNames = (await listCollections).map(
    collection => collection.name
  );

  ctx.body = collectionNames;
};
