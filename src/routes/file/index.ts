import { upload } from './controller';
import { requireLogin } from '../../middleware/validate';

const router = Router => {
  const router = new Router({ prefix: '/file' });

  router.get('/upload', requireLogin(), upload); // Get all collection names
  return router;
};

export default router;
