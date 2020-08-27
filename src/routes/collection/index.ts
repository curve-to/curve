import {
  create,
  showDocuments,
  showDocument,
  remove,
  edit,
} from './controller';
import { checkIdentity } from '../../middleware/validate';

const router = (Router) => {
  const router = new Router({ prefix: '/collection' });

  router
    .get('/:collection/:documentId', showDocument) // get details of a document
    .put(
      '/:collection/:documentId',
      checkIdentity({ requiresAdmin: true }),
      edit
    ) // edit a document
    .delete(
      '/:collection/:documentId',
      checkIdentity({ requiresAdmin: true }),
      remove
    ) // remove a document
    .post('/:collection', checkIdentity({ requiresAdmin: true }), create) // create a document
    .get('/:collection', showDocuments); // get documents of a collection

  return router;
};

export default router;
