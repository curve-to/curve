import * as moment from 'moment';
import { Decimal } from 'decimal.js';
import * as _ from 'underscore';
import { Context } from 'koa';
import { decodeJwt } from '../../middleware/auth';
import {
  getDateRange,
  createDynamicModels,
  excludeFields,
  getPopulate,
} from '../../common';
import { listCollections } from '../../common';

/**
 * Create a document
 * @param ctx Context
 */
export const create = async (ctx: Context): Promise<void> => {
  const { collection } = ctx.params;
  const { uid } = decodeJwt(ctx);
  const collectionsInDatabase = await listCollections();
  const hasCollection = collectionsInDatabase.includes(collection);

  if (!hasCollection) {
    ctx.throw(404, `Collection ${collection} is not found.`);
  }

  const Model = createDynamicModels(collection);

  const params = {
    ...ctx.request.body,
    createdAt: moment().unix(),
    createdBy: uid,
  };

  const response = await new Model(params).save();
  ctx.response.status = 201;
  ctx.body = _.omit(response.toJSON(), ['_id', '__v']);
};

/**
 * Create multiple documents
 * @param ctx Context
 */
export const createMany = async (ctx: Context): Promise<void> => {
  const { collection } = ctx.params;
  const { body } = ctx.request;
  const { uid } = decodeJwt(ctx);
  const collectionsInDatabase = await listCollections();
  const hasCollection = collectionsInDatabase.includes(collection);

  if (!hasCollection) {
    ctx.throw(404, `Collection ${collection} is not found.`);
  }

  const Model = createDynamicModels(collection);

  const documents = body.map((fields: genericObject) => {
    const params = {
      ...fields,
      createdAt: moment().unix(),
      createdBy: uid,
    };

    return params;
  });

  const response = await Model.insertMany(documents);
  ctx.response.status = 201;
  ctx.body = response.map((item: genericObject) =>
    _.omit(item.toJSON(), ['_id', '__v'])
  );
};

/**
 * Get details of a document
 * @param ctx Context
 */
export const find = async (ctx: Context): Promise<void> => {
  const { collection, documentId: id } = ctx.params;
  const {
    exclude,
    populate: _populate = JSON.stringify([]),
  } = ctx.request.query; // string[] fields to exclude, e.g. field1,field2,field3

  const populate = getPopulate(_populate as string);

  const Model = createDynamicModels(collection);
  try {
    const record = await Model.findOne(
      { _id: id },
      excludeFields(['__v'], exclude as string)
    ).populate(populate);
    ctx.body = _.omit(record.toJSON(), ['_id']);
  } catch (error) {
    ctx.body = {};
  }
};

/**
 * Get documents of a collection
 * @param ctx Context
 */
export const findMany = async (ctx: Context): Promise<void> => {
  const { collection } = ctx.params;
  const {
    exclude, // string[] fields to exclude, e.g. field1,field2,field3
    pageSize: _pageSize = 20,
    pageNo = 1,
    sortOrder = -1, // 1: ascending, -1: descending
    where: _where = JSON.stringify({}),
    populate: _populate = JSON.stringify([]),
  } = ctx.request.query;

  // avoid user setting very large page size to slow down our server
  const pageSize = +_pageSize > 3000 ? 3000 : +_pageSize;

  let where = JSON.parse(_where as string);
  if (where.createdAt) {
    where = { ...where, ...getDateRange(where.createdAt) };
  }

  const populate = getPopulate(_populate as string);

  const Model = createDynamicModels(collection);
  const records = await Model.find(
    where,
    excludeFields(['__v'], exclude as string)
  )
    .populate(populate)
    .sort({ $natural: sortOrder })
    .skip(((pageNo as number) - 1) * pageSize)
    .limit(pageSize);

  ctx.body = records.map((item: genericObject) => {
    return _.omit(item.toJSON(), ['_id']);
  });
};

/**
 * Get distinct of a field from a collection
 * @param ctx Context
 */
export const findDistinct = async (ctx: Context): Promise<void> => {
  const { collection } = ctx.params;
  const { distinct, where: _where = JSON.stringify({}) } = ctx.request.query;

  let where = JSON.parse(_where as string);
  if (where.createdAt) {
    where = { ...where, ...getDateRange(where.createdAt) };
  }

  const Model = createDynamicModels(collection);
  const records = await Model.find(where).distinct(distinct);

  ctx.body = records;
};

/**
 * Remove a document
 * @param ctx Context
 */
export const remove = async (ctx: Context): Promise<void> => {
  const { collection, documentId: id } = ctx.params;
  const Model = createDynamicModels(collection);
  await Model.find({ _id: id }).deleteOne();
  ctx.response.status = 204;
};

/**
 * Remove documents
 * @param ctx Context
 */
export const removeMany = async (ctx: Context): Promise<void> => {
  const { collection } = ctx.params;
  const { where = {} } = ctx.request.body; // If where is an empty object, remove all

  const Model = createDynamicModels(collection);
  await Model.deleteMany(where);
  ctx.response.status = 204;
};

/**
 * Update a document
 * @param ctx Context
 */
export const update = async (ctx: Context): Promise<void> => {
  const { collection, documentId: id } = ctx.params;
  const { data = {} } = ctx.request.body;
  const { uid } = decodeJwt(ctx);

  const Model = createDynamicModels(collection);
  const update: genericObject[] = [
    {
      $set: Object.assign(data.$set, {
        updatedAt: moment().unix(),
        updatedBy: uid,
      }),
    },
  ];

  if (data.$unset.length) update.push({ $unset: data.$unset });

  const response = await Model.updateOne({ _id: id }, update);
  ctx.body = response;
};

/**
 * Update multiple documents
 * @param ctx Context
 */
export const updateMany = async (ctx: Context): Promise<void> => {
  const { collection } = ctx.params;
  const { where = {}, data = {} } = ctx.request.body;
  const { uid } = decodeJwt(ctx);

  const Model = createDynamicModels(collection);
  const update: genericObject = [
    {
      $set: Object.assign(data.$set, {
        updatedAt: moment().unix(),
        updatedBy: uid,
      }),
    },
  ];

  if (data.$unset.length) update.push({ $unset: data.$unset });

  const response = await Model.updateMany(where, update);
  ctx.body = response;
};

/**
 * Get total count of a collection
 * @param ctx.params.collection collection name
 */
export const count = async (ctx: Context): Promise<void> => {
  const { collection } = ctx.params;
  const { where: _where = JSON.stringify({}) } = ctx.request.query;

  let where = JSON.parse(_where as string);
  if (where.createdAt) {
    where = { ...where, ...getDateRange(where.createdAt) };
  }

  const Model = createDynamicModels(collection);
  const response = await Model.countDocuments(where);
  ctx.body = response;
};

/**
 * Get sum total of a specific field from date range
 * @param ctx.params.collection
 * @param ctx.body.query
 * @param ctx.body.startDate
 * @param ctx.body.endDate
 * @param ctx.body.fieldToSum
 */
export const sum = async (ctx: Context): Promise<void> => {
  const { collection } = ctx.params;
  const Model = createDynamicModels(collection);
  const { where = {}, field } = ctx.request.body;

  const config = [
    {
      $match: where,
    },
    {
      $group: {
        _id: null,
        amount: {
          $sum: `$${field}`,
        },
      },
    },
  ];

  const result = await Model.aggregate(config).then((res: genericObject) => {
    if (!res.length) return 0;

    let { amount = 0 } = res[0];
    if (amount) {
      amount = new Decimal(amount).toFixed(2);
    }

    return +amount;
  });

  ctx.body = result;
};

/**
 * Get random documents of a collection
 * @param ctx Context
 */
export const random = async (ctx: Context): Promise<void> => {
  const { collection } = ctx.params;
  const {
    exclude, // string[] fields to exclude, e.g. field1,field2,field3
    where: _where = JSON.stringify({}),
    size = 20,
  } = ctx.request.query;

  let where = JSON.parse(_where as string);
  if (where.createdAt) {
    where = { ...where, ...getDateRange(where.createdAt) };
  }

  const Model = createDynamicModels(collection);
  const records = await Model.aggregate([
    { $match: where },
    { $sample: { size: +size } },
  ]);

  ctx.body = records.map((item: genericObject) => {
    item.id = item._id;
    return _.omit(
      item,
      ['_id', '__v'].concat((exclude as string)?.split(',') || [])
    );
  });
};
