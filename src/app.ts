import * as Koa from 'koa';
import applyApiMiddleware from './routes';
import { tokenValidation, jwtMiddleware } from './middleware/auth';

const app = new Koa();
const port = 4000;

app.use(tokenValidation).use(jwtMiddleware);

applyApiMiddleware(app);
app.listen(port);
