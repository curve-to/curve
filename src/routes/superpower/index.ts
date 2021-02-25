import { getAllCollections } from './controller';
import { requireAdmin } from '../../middleware/validate';

const router = Router => {
  const router = new Router({ prefix: '/superpower' });

  router.get('/getAllCollections', requireAdmin(), getAllCollections); // Get all collection names
  return router;
};

export default router;
