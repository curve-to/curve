import * as mongoose from 'mongoose';
import * as crypto from 'crypto';
import * as moment from 'moment';
import { Context } from 'koa';
import { collections } from '../../config/database';

const models = {};

/**
 * Create dynamic models
 * @param collection name of a collection
 */
const dynamicModels = (collection: string) => {
  if (!models[collection]) {
    const schema = new mongoose.Schema(
      { id: String, createdAt: String },
      { strict: false }
    );
    models[collection] = collections.model(collection, schema, collection);
  }
  return models[collection];
};

/**
 * Create a document
 * @param ctx Context
 */
export const create = async (ctx: Context) => {
  const { collection } = ctx.params;
  const model = dynamicModels(collection);
  const id = crypto.randomBytes(8).toString('hex'); // generate unique id
  const params = {
    id,
    ...ctx.request.body,
    createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
  };

  const document = new model(params);
  await document.save();

  ctx.body = 'ok';
};

/**
 * Get details of a document
 * @param ctx Context
 */
export const showDocument = async (ctx: Context) => {
  const { collection, documentId: id } = ctx.params;
  const model = dynamicModels(collection);
  const record = await model.findOne({ id }, { _id: false, __v: false }).lean();
  ctx.body = record || {};
};

/**
 * Get documents of a collection
 * @param ctx Context
 */
export const showDocuments = async (ctx: Context) => {
  const { collection } = ctx.params;
  const model = dynamicModels(collection);
  const records = await model.find({}, { _id: false, __v: false }).lean();
  ctx.body = records || [];
};

/**
 * Remove a document
 * @param ctx Context
 */
export const remove = async (ctx: Context) => {
  const { collection, documentId: id } = ctx.params;
  const model = dynamicModels(collection);
  await model.find({ id }).deleteOne();
  ctx.body = 'ok';
};

/**
 * Edit a document
 * @param ctx Context
 */
export const edit = async (ctx: Context) => {
  const { collection, documentId: id } = ctx.params;
  const model = dynamicModels(collection);
  const params = {
    ...ctx.request.body,
    updatedAt: moment().format('YYYY-MM-DD HH:mm:ss'),
  };

  await model.findOneAndUpdate({ id }, params, { useFindAndModify: false });
  ctx.body = 'edit';
};
