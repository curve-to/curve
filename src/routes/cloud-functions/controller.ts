import { Context } from 'koa';
import * as mongoose from 'mongoose';
import * as moment from 'moment';
import * as _ from 'underscore';
import { NodeVM, VMScript } from 'vm2';
import { decodeJwt } from '../../middleware/auth';
import { coreCollections } from '../../config/database';

const schema = new mongoose.Schema(
  {
    name: String,
    code: String,
    createdAt: String,
    createdBy: String,
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

const CloudFunctionModel = coreCollections.model(
  'cloudFunctions',
  schema,
  'cloudFunctions'
);

/**
 * Invoke cloud function
 * @param ctx Context
 */
export const invoke = async (ctx: Context): Promise<void> => {
  const { name } = ctx.params;
  const vm = new NodeVM();

  const record = await CloudFunctionModel.findOne({ name });

  if (!record) {
    ctx.throw(404, `Function ${name} is not found.`);
  }

  const script = new VMScript(record['code']);
  const exec = vm.run(script);

  const res = await exec(ctx.request.body);
  ctx.body = res;
};

/**
 * Create cloud function
 * @param ctx Context
 */
export const create = async (ctx: Context): Promise<void> => {
  const { name, code } = ctx.request.body;

  const { uid } = decodeJwt(ctx);

  const params = {
    name,
    code,
    createdAt: moment().unix(),
    createdBy: uid,
  };

  const response = await new CloudFunctionModel(params).save();
  ctx.response.status = 201;
  ctx.body = _.omit(response.toJSON(), ['_id', '__v']);
};

/**
 * Remove cloud function
 * @param ctx Context
 */
export const remove = async (ctx: Context): Promise<void> => {
  const { name } = ctx.params;
  await CloudFunctionModel.find({ name }).deleteOne();
  ctx.response.status = 204;
};

/**
 * Find cloud function
 * @param ctx Context
 */
export const find = async (ctx: Context): Promise<void> => {
  const { name } = ctx.params;

  try {
    const record = await CloudFunctionModel.findOne({ name });
    ctx.body = _.omit(record.toJSON(), ['_id']);
  } catch (error) {
    ctx.body = false;
  }
};

/**
 * Update cloud function
 * @param ctx Context
 */
export const update = async (ctx: Context): Promise<void> => {
  const { name } = ctx.params;
  const { code = '' } = ctx.request.body;
  const { uid } = decodeJwt(ctx);

  const update: genericObject[] = [
    {
      $set: Object.assign(
        { code },
        {
          updatedAt: moment().unix(),
          updatedBy: uid,
        }
      ),
    },
  ];

  const response = await CloudFunctionModel.updateOne({ name }, update);
  ctx.body = response;
};
