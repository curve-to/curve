import {
  create,
  getCollection,
  getDocument,
  remove,
  update,
  count,
} from './controller';
import { checkIdentity } from '../../middleware/validate';

const router = (Router) => {
  const router = new Router({ prefix: '/collection' });

  router
    .get('/:collection/count', count) // count of a collection
    .get('/:collection/:documentId', getDocument) // get details of a document
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
    .get('/:collection', getCollection); // get documents of a collection

  return router;
};

export default router;
