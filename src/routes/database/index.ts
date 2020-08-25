import { _create, _get, _delete } from './controller';

const router = (Router) => {
  const router = new Router({ prefix: '/1/database' });

  router
    .get('/', _get)
    .post('/', _create)
    .delete('/', _delete);

  return router;
};

export default router;
