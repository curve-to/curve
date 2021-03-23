import { Context } from 'koa';
import * as moment from 'moment';
import * as mongoose from 'mongoose';
import * as fs from 'fs';
import * as _ from 'underscore';
import { nanoid } from 'nanoid';
import upyunClient from './upyun-client';
import { decodeJwt } from '../../middleware/auth';
import { coreCollections } from '../../config/database';
import { excludeFields, getDateRange } from '../../common';

const schema = new mongoose.Schema(
  {
    width: Number,
    height: Number,
    fileType: String,
    fileExtension: String,
    size: Number,
    path: String,
    createdAt: String,
    createdBy: String,
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

export const FileModel = coreCollections.model('files', schema);

/**
 * Get file params and upload to UpYun
 * @param ctx Context
 */
export const upload = async (ctx: Context): Promise<void> => {
  const { file } = ctx.request.files;
  const { useRandomFileName } = ctx.request.body;
  const { uid } = decodeJwt(ctx);

  const stream = fs.createReadStream(file['path']);
  const extension = file['name'].split('.').pop();
  const fileType = file['type'];
  const id = nanoid(10);
  const fileName =
    useRandomFileName === 'true'
      ? `${id}.${extension}`
      : encodeURIComponent(file['name']);

  try {
    const path = `/${fileName}`;
    const upyunResponse = await upyunClient.putFile(path, stream);
    const result =
      upyunResponse instanceof Object
        ? { width: upyunResponse.width, height: upyunResponse.height, path }
        : { path };

    const params = {
      ...result,
      fileType,
      fileExtension: extension,
      size: file['size'],
      createdAt: moment().unix(),
      createdBy: uid,
    };

    const response = await new FileModel(params).save();

    ctx.response.status = 201;
    ctx.body = _.omit(response.toJSON(), ['_id', '__v']);
  } catch (error) {
    ctx.throw(409, error.toString());
  }
};

/**
 * Get file details by Id
 * @param ctx Context
 */
export const find = async (ctx: Context): Promise<void> => {
  const { fileId: id } = ctx.params;
  const { exclude } = ctx.request.query; // string[] fields to exclude, e.g. field1,field2,field3

  try {
    const record = await FileModel.findOne(
      { _id: id },
      excludeFields(['__v'], exclude as string)
    );
    ctx.body = _.omit(record.toJSON(), ['__v']);
  } catch (error) {
    ctx.body = {};
  }
};

/**
 * Get a list of all files
 * @param ctx Context
 */
export const findMany = async (ctx: Context): Promise<void> => {
  const {
    exclude, // string[] fields to exclude, e.g. field1,field2,field3
    pageSize: _pageSize = 20,
    pageNo = 1,
    sortOrder = -1, // 1: ascending, -1: descending
    where: _where = JSON.stringify({}),
  } = ctx.request.query;

  // avoid user setting very large page size to slow down our server
  const pageSize = +_pageSize > 3000 ? 3000 : +_pageSize;

  let where = JSON.parse(_where as string);
  if (where.createdAt) {
    where = { ...where, ...getDateRange(where.createdAt) };
  }

  const records = await FileModel.find(
    where,
    excludeFields(['__v'], exclude as string)
  )
    .sort({ $natural: sortOrder })
    .skip(((pageNo as number) - 1) * pageSize)
    .limit(pageSize);

  ctx.body = records.map((item: genericObject) => {
    return _.omit(item.toJSON(), ['_id']);
  });
};

/**
 * Remove file
 * @param ctx Context
 */
export const remove = async (ctx: Context): Promise<void> => {
  const { fileId: id } = ctx.params;

  let record: genericObject;

  try {
    record = await FileModel.findOne({ _id: id });
  } catch (error) {
    ctx.throw(404, `File (${id}) is not found.`);
  }

  const upyunFilePath = record['path'];
  const upyunResponse = await upyunClient.deleteFile(upyunFilePath);

  if (!upyunResponse) {
    ctx.throw(409, 'File is not deleted successfully.');
  }

  await FileModel.find({ _id: id }).deleteOne();

  ctx.response.status = 204;
};

/**
 * Get total count of files
 * @param ctx Context
 */
export const count = async (ctx: Context): Promise<void> => {
  const { where: _where = JSON.stringify({}) } = ctx.request.query;

  let where = JSON.parse(_where as string);
  if (where.createdAt) {
    where = { ...where, ...getDateRange(where.createdAt) };
  }

  const response = await FileModel.countDocuments(where);
  ctx.body = response;
};
