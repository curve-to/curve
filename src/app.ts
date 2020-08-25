import * as Koa from 'koa';
import applyApiMiddleware from './routes';

const app = new Koa();
const port = 3000;

applyApiMiddleware(app);
app.listen(port);
