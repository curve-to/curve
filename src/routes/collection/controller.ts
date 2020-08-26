import * as mongoose from 'mongoose';
import { Context } from 'koa';
import { collections } from '../../config/database';

const models = {};

const dynamicModels = (collection: string) => {
  if (!models[collection]) {
    const schema = new mongoose.Schema();
    models[collection] = collections.model(collection, schema, collection);
  }
  return models[collection];
};

/**
 * Create a document
 * @param ctx Context
 */
export const create = async (ctx: Context) => {
  ctx.body = 'create';
};

/**
 * Get details of a document
 * @param ctx Context
 */
export const showDocument = async (ctx: Context) => {
  const { collection, documentId } = ctx.params;
  const model = dynamicModels(collection);
  const record = await model.findOne({id: documentId}, { _id: false, __v: false }).lean();
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
  ctx.body = 'remove';
};

/**
 * Edit a document
 * @param ctx Context
 */
export const edit = async (ctx: Context) => {
  ctx.body = 'edit';
};

/**
 * Show keys of a collection
 * @param ctx Context
 */
export const showKeys = async (ctx: Context) => {
  const { collection } = ctx.params;
  const model = dynamicModels(collection);
  const record = await model.findOne({}, { _id: false, __v: false }).lean();
  const keys = record ? Object.keys(record) : [];
  ctx.body = keys;
};
