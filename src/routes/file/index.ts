import { upload, find, remove } from './controller';
import { requireLogin, validate } from '../../middleware/validate';

const router = Router => {
  const router = new Router({ prefix: '/file' });

  router
    .post('/upload', requireLogin(), upload) // Get all collection names
    .get('/:fileId', requireLogin(), find)
    .delete('/remove', requireLogin(), validate(['id']), remove);

  return router;
};

export default router;
