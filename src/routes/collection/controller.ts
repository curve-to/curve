import * as mongoose from 'mongoose';
import * as crypto from 'crypto';
import * as moment from 'moment';
import * as _ from 'underscore';
import { Context } from 'koa';
import { collections } from '../../config/database';
import { decodeJwt } from '../../middleware/auth';

const models = {};

/**
 * Create dynamic models
 * @param collection name of a collection
 * @returns model
 */
const dynamicModels = (collection: string) => {
  if (!models[collection]) {
    const schema = new mongoose.Schema(
      { id: String, createdAt: Number },
      { strict: false, versionKey: false }
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
  const { uid } = decodeJwt(ctx);

  const model = dynamicModels(collection);
  const id = crypto.randomBytes(8).toString('hex'); // generate unique id

  const params = {
    id,
    ...ctx.request.body,
    createdAt: moment().unix(),
    createdBy: uid,
  };

  const document = new model(params);
  const response = await document.save();
  ctx.body = _.omit(response.toJSON(), ['_id', '__v']);
};

/**
 * Get details of a document
 * @param ctx Context
 */
export const getDocument = async (ctx: Context): Promise<void> => {
  const { collection, documentId: id } = ctx.params;
  const { exclude } = ctx.request.query; // string[] fields to exclude, e.g. field1,field2,field3

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
    exclude, // string[] fields to exclude, e.g. field1,field2,field3
    pageSize = 20,
    pageNo = 1,
    sortOrder = -1, // 1: ascending, -1: descending
    query = JSON.stringify({}),
  } = ctx.request.query;

  const model = dynamicModels(collection);
  const records = await model
    .find(JSON.parse(query), excludeFields(['_id', '__v'], exclude))
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
  const { uid } = decodeJwt(ctx);

  const model = dynamicModels(collection);
  const params = {
    ...ctx.request.body,
    updatedAt: moment().unix(),
    updatedBy: uid,
  };

  const response = await model.findOneAndUpdate({ id }, params, {
    useFindAndModify: false,
    new: true,
  });
  ctx.body = _.omit(response.toJSON(), ['_id', '__v']);
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

// export const convertToUnix = async (ctx: Context): Promise<void> => {
//   const { collection } = ctx.params;
//   const model = dynamicModels(collection);
//   const response = await model
//     .find()
//     .lean()
//     .exec((err, docs) => {
//       docs.forEach(async doc => {
//         // if (!doc.updatedAt || !Number.isInteger(+doc.updatedAt)) {
//         //   console.log(doc);
//         // }
//         const res = await model.update(
//           { id: doc.id },
//           {
//             createdAt: moment(doc.createdAt).unix(),
//             updatedAt: moment(doc.updatedAt).unix(),
//           }
//         );
//         console.log('success', res);
//       });
//       console.log('done');
//     });
//   ctx.body = response;
// };
