import * as Koa from 'koa';
import * as bodyParser from 'koa-body';
import * as koaRes from 'koa-res';
import applyApiMiddleware from './routes';
import { tokenValidation, jwtMiddleware } from './middleware/auth';
import config from './config';
import corsMiddleware from './middleware/cors';

const app = new Koa();

app
  .use(bodyParser(config.bodyParserConfig))
  .use(corsMiddleware)
  .use(koaRes())
  .use(tokenValidation)
  .use(jwtMiddleware);

applyApiMiddleware(app);

app.listen(config.port);
