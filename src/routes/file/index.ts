import { upload, find } from './controller';
import { requireLogin } from '../../middleware/validate';

const router = Router => {
  const router = new Router({ prefix: '/files' });

  router
    .post('/upload', requireLogin(), upload) // Get all collection names
    .get('/:fileId', requireLogin(), find);
  return router;
};

export default router;
