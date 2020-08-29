import * as Koa from 'koa';
import * as bodyParser from 'koa-body';
import applyApiMiddleware from './routes';
import { tokenValidation, jwtMiddleware } from './middleware/auth';
import { bodyParserConfig } from './config';
import corsMiddleware from './middleware/cors';

const app = new Koa();
const port = 4000;

app
  .use(bodyParser(bodyParserConfig))
  .use(corsMiddleware)
  .use(tokenValidation)
  .use(jwtMiddleware);

applyApiMiddleware(app);

app.listen(port);
