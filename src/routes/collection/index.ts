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
  findDistinct,
} from './controller';
import {
  disableUserQuery,
  requireAdmin,
  requireCurrentUser,
  requireLogin,
  validate,
} from '../../middleware/validate';

const router = Router => {
  const router = new Router({ prefix: '/collection' });

  router
    .get('/:collection/count', disableUserQuery(), count) // get count of a collection
    .get(
      '/:collection/distinct',
      disableUserQuery(),
      validate(['distinct']),
      findDistinct
    ) // get distinct of a field from a collection
    .post('/:collection/sum', disableUserQuery(), sum) // sum total of a specific field of a collection
    .get('/:collection/:documentId', disableUserQuery(), find) // get details of a document
    .put(
      '/:collection/updateMany',
      disableUserQuery(),
      requireLogin(),
      requireAdmin(), // for updating multiple documents, require admin. this helps hackers who batch update other documents
      updateMany
    ) // update multiple documents
    .put(
      '/:collection/:documentId',
      disableUserQuery(),
      requireLogin(),
      requireCurrentUser(), // for updating single document, require current user
      update
    ) // update a document
    .delete(
      '/:collection/:documentId',
      disableUserQuery(),
      requireLogin(),
      requireCurrentUser(), // for deleting single document, require current user
      remove
    ) // remove a document
    .delete(
      '/:collection',
      disableUserQuery(),
      requireLogin(),
      requireAdmin(), // for deleting multiple documents, require admin. this helps hackers who batch delete other documents
      removeMany
    ) // remove multiple documents
    .post('/:collection', disableUserQuery(), requireLogin(), create) // create a document
    .post(
      '/:collection/createMany',
      disableUserQuery(),
      requireLogin(),
      createMany
    ) // create multiple documents
    .get('/:collection', disableUserQuery(), findMany); // get documents of a collection

  return router;
};

export default router;
