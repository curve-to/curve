import {
  create,
  createMany,
  findMany,
  find,
  remove,
  removeMany,
  update,
  updateMany,
  count,
  sum,
} from './controller';
import { disableUserQuery, checkIdentity } from '../../middleware/validate';

const router = Router => {
  const router = new Router({ prefix: '/collection' });

  router
    .get('/:collection/count', disableUserQuery(), count) // get count of a collection
    .post('/:collection/sum', disableUserQuery(), sum) // sum total of a specific field of a collection
    .get('/:collection/:documentId', disableUserQuery(), find) // get details of a document
    .put(
      '/:collection/updateMany',
      disableUserQuery(),
      checkIdentity({ requiresAdmin: true }),
      updateMany
    ) // update multiple documents
    .put(
      '/:collection/:documentId',
      disableUserQuery(),
      checkIdentity({ requiresAdmin: true }),
      update
    ) // update a document
    .delete(
      '/:collection/:documentId',
      disableUserQuery(),
      checkIdentity({ requiresAdmin: true }),
      remove
    ) // remove a document
    .delete(
      '/:collection',
      disableUserQuery(),
      checkIdentity({ requiresAdmin: true }),
      removeMany
    ) // remove multiple documents
    .post('/:collection', disableUserQuery(), checkIdentity(), create) // create a document
    .post(
      '/:collection/createMany',
      disableUserQuery(),
      checkIdentity(),
      createMany
    ) // create multiple documents
    .get('/:collection', disableUserQuery(), findMany); // get documents of a collection

  return router;
};

export default router;
