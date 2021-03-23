import { invoke, create, remove, find, update } from './controller';
import { requireLogin } from '../../middleware/validate';

const router = Router => {
  const router = new Router({ prefix: '/cloud/function' });

  router
    .get('/:name', requireLogin(), find) // Find
    .post('/create', requireLogin(), create) // Create
    .post('/:name', requireLogin(), invoke) // Invoke
    .put('/:name', requireLogin(), update) // Update
    .delete('/:name', requireLogin(), remove); // Remove
  return router;
};

export default router;
