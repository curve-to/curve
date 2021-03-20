import { Context } from 'koa';
import * as mongoose from 'mongoose';
import { NodeVM, VMScript } from 'vm2';
import { collections } from '../../config/database';

const vm = new NodeVM();

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

const CloudFunctionModel = collections.model(
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

  const record = await CloudFunctionModel.findOne({ name });

  if (!record) {
    ctx.throw(404, `Function ${name} is not found.`);
  }

  const script = new VMScript(record['code']);
  const exec = vm.run(script);

  const res = await exec(ctx.request.body);
  ctx.body = res;
};
