import * as cors from '@koa/cors';
import { Context } from 'koa';
import config from '../config';

const corsOptions = {
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
  origin: (ctx: Context) => {
    const url = ctx.header.origin;

    for (const i in config.bypassCorsList) {
      if (url.includes(config.bypassCorsList[i])) {
        return url;
      }
    }

    return '';
  },
};

export default cors(corsOptions);
