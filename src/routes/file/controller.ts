import { Context } from 'koa';
import { collections } from '../../config/database';
import upyunClient from './upyun-client';

/**
 * Get all collection names
 * @param ctx Context
 */
export const upload = async (ctx: Context): Promise<void> => {
  const listCollections = (await collections).db.listCollections().toArray();
  const collectionNames = (await listCollections).map(
    collection => collection.name
  );

  ctx.response.status = 201;
  ctx.body = collectionNames;
};
