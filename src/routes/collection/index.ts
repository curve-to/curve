import {
  create,
  createMany,
  getCollection,
  getDocument,
  remove,
  update,
  updateMany,
  count,
  sum,
} from './controller';
import { checkIdentity } from '../../middleware/validate';

const router = Router => {
  const router = new Router({ prefix: '/collection' });

  router
    .get('/:collection/count', count) // get count of a collection
    .post('/:collection/sum', sum) // sum total of a specific field of a collection
    .get('/:collection/:documentId', getDocument) // get details of a document
    .put(
      '/:collection/updateMany',
      checkIdentity({ requiresAdmin: true }),
      updateMany
    ) // update multiple documents
    .put(
      '/:collection/:documentId',
      checkIdentity({ requiresAdmin: true }),
      update
    ) // update a document
    .delete(
      '/:collection/:documentId',
      checkIdentity({ requiresAdmin: true }),
      remove
    ) // remove a document
    .post('/:collection', checkIdentity({ requiresAdmin: true }), create) // create a document
    .post(
      '/:collection/createMany',
      checkIdentity({ requiresAdmin: true }),
      createMany
    ) // create multiple documents
    .get('/:collection', getCollection); // get documents of a collection

  return router;
};

export default router;
