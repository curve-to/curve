import * as fs from 'fs';
import * as path from 'path';
import * as Router from 'koa-router';
import * as Koa from 'koa';
const baseName = path.basename(__filename);

const applyApiMiddleware = (app: Koa): void => {
  const router = new Router();

  // Require all the folders and create a sub-router for each feature api
  fs.readdirSync(__dirname)
    .filter(file => file.indexOf('.') !== 0 && file !== baseName)
    .forEach(file => {
      import(`./${file}`).then(module => {
        const api = module.default(Router);
        router.use(api.routes());
      });
    });

  app.use(router.routes()).use(router.allowedMethods());
};

export default applyApiMiddleware;
