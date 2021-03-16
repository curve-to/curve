import { Context } from 'koa';
import * as moment from 'moment';
import * as mongoose from 'mongoose';
import * as fs from 'fs';
import * as _ from 'underscore';
import { nanoid } from 'nanoid';
import upyunClient from './upyun-client';
import { decodeJwt } from '../../middleware/auth';
import { collections } from '../../config/database';

const schema = new mongoose.Schema(
  {
    width: Number,
    height: Number,
    fileType: String,
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

export const FileModel = collections.model('files', schema);

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
  const fileName = useRandomFileName
    ? `${id}.${extension}`
    : encodeURIComponent(file['name']);

  try {
    const path = `/${fileName}`;
    const res = await upyunClient.putFile(path, stream);
    const result =
      res instanceof Object
        ? { width: res.width, height: res.height, path }
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

  try {
    const record = await FileModel.findOne({ _id: id });
    ctx.body = _.omit(record.toJSON(), ['__v']);
  } catch (error) {
    ctx.body = {};
  }
};
