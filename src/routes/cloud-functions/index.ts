import { invoke } from './controller';
import { requireLogin } from '../../middleware/validate';

const router = Router => {
  const router = new Router({ prefix: '/cloud/function' });

  router.post('/:name', requireLogin(), invoke); // Get all collection names
  return router;
};

export default router;
