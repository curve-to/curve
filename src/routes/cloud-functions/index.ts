import { invoke } from './controller';
import { requireAdmin } from '../../middleware/validate';

const router = Router => {
  const router = new Router({ prefix: '/cloud/function' });

  router.post('/:name', invoke); // Get all collection names
  return router;
};

export default router;
