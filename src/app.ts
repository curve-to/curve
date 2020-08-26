import * as Koa from 'koa';
import * as bodyParser from 'koa-body';
import applyApiMiddleware from './routes';
import { tokenValidation, jwtMiddleware } from './middleware/auth';
import './config/database';

const bodyParserConfig = {
  multipart: true,
  urlencoded: true,
  parsedMethods: ['POST', 'PUT', 'PATCH', 'GET', 'DELETE'],
  formidable: {
    maxFileSize: 500 * 1024 * 1024, // 限制文件大小为 5M
  },
};

const app = new Koa();
const port = 4000;

app.use(bodyParser(bodyParserConfig)).use(tokenValidation).use(jwtMiddleware);

applyApiMiddleware(app);
app.listen(port);
