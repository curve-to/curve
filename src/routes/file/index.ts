import { upload, find, findMany, remove, count } from './controller';
import { requireLogin } from '../../middleware/validate';

const router = Router => {
  const router = new Router({ prefix: '/file' });

  router
    .post('/upload', requireLogin(), upload)
    .get('/count', requireLogin(), count)
    .get('/findMany', requireLogin(), findMany)
    .get('/:fileId', requireLogin(), find)
    .delete('/:fileId', requireLogin(), remove);

  return router;
};

export default router;
