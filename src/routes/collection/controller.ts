import * as mongoose from 'mongoose';
import * as crypto from 'crypto';
import * as moment from 'moment';
import { Context } from 'koa';
import { collections } from '../../config/database';

const models = {};

/**
 * Create dynamic models
 * @param collection name of a collection
 * @returns model
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
 * Hide fields from results
 * @param fieldsBySystem an array of fields to be excluded by system
 * @param fieldsByUser string of fields to be excluded by user. Set via query params
 * @returns an object of excluded fields
 */
const excludeFields = (fieldsBySystem: string[], fieldsByUser: string) => {
  const fields = fieldsByUser
    ? fieldsBySystem.concat(fieldsByUser.split(','))
    : fieldsBySystem;

  const excluded = fields.reduce((result, field) => {
    result[field] = false;
    return result;
  }, {});

  return excluded;
};

/**
 * Create a document
 * @param ctx Context
 */
export const create = async (ctx: Context): Promise<void> => {
  const { collection } = ctx.params;
  const model = dynamicModels(collection);
  const id = crypto.randomBytes(8).toString('hex'); // generate unique id
  const params = {
    id,
    ...ctx.request.body,
    createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
  };

  const document = new model(params);
  const response = await document.save();
  ctx.body = response;
};

/**
 * Get details of a document
 * @param ctx Context
 */
export const getDocument = async (ctx: Context): Promise<void> => {
  const { collection, documentId: id } = ctx.params;
  const { exclude } = ctx.request.query;

  const model = dynamicModels(collection);
  const record = await model
    .findOne({ id }, excludeFields(['_id', '__v'], exclude))
    .lean();
  ctx.body = record || {};
};

/**
 * Get documents of a collection
 * @param ctx Context
 */
export const getCollection = async (ctx: Context): Promise<void> => {
  const { collection } = ctx.params;
  const {
    exclude,
    pageSize = 20,
    pageNo = 1,
    sortOrder = -1, // 1: ascending, -1: descending
  } = ctx.request.query;

  const model = dynamicModels(collection);
  const records = await model
    .find({}, excludeFields(['_id', '__v'], exclude))
    .sort({ $natural: sortOrder })
    .skip((pageNo - 1) * +pageSize)
    .limit(+pageSize)
    .lean();
  ctx.body = records || [];
};

/**
 * Remove a document
 * @param ctx Context
 */
export const remove = async (ctx: Context): Promise<void> => {
  const { collection, documentId: id } = ctx.params;
  const model = dynamicModels(collection);
  await model.find({ id }).deleteOne();
  ctx.body = 'ok';
};

/**
 * Update a document
 * @param ctx Context
 */
export const update = async (ctx: Context): Promise<void> => {
  const { collection, documentId: id } = ctx.params;
  const model = dynamicModels(collection);
  const params = {
    ...ctx.request.body,
    updatedAt: moment().format('YYYY-MM-DD HH:mm:ss'),
  };

  const response = await model.findOneAndUpdate({ id }, params, {
    useFindAndModify: false,
    new: true,
  });
  ctx.body = response;
};

/**
 * Get total count of a collection
 * @param ctx Context
 */
export const count = async (ctx: Context): Promise<void> => {
  const { collection } = ctx.params;
  const model = dynamicModels(collection);
  const response = await model.countDocuments();
  ctx.body = response;
};
