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
  random,
} from './controller';
import {
  disableSensitiveQuery,
  disableTableOperations,
  requireAdmin,
  requireCurrentUser,
  requireLogin,
  validate,
} from '../../middleware/validate';

const router = Router => {
  const router = new Router({ prefix: '/collection' });

  router
    .get(
      '/:collection/random',
      disableSensitiveQuery(),
      // requireLogin(),
      random
    ) // get random documents of a collection
    .get(
      '/:collection/count',
      disableSensitiveQuery(),
      // requireLogin(),
      count
    ) // get count of a collection
    .get(
      '/:collection/findDistinct',
      disableSensitiveQuery(),
      // requireLogin(),
      validate(['distinct']),
      findDistinct
    ) // get distinct of a field from a collection
    .post('/:collection/sum', disableSensitiveQuery(), requireLogin(), sum) // sum total of a specific field of a collection
    .get(
      '/:collection/:documentId',
      disableSensitiveQuery(),
      // requireLogin(),
      find
    ) // get details of a document
    .put(
      '/:collection/updateMany',
      disableSensitiveQuery(),
      disableTableOperations(),
      requireLogin(),
      requireAdmin(), // for updating multiple documents, require admin. this helps hackers who batch update other documents
      updateMany
    ) // update multiple documents
    .put(
      '/:collection/:documentId',
      disableSensitiveQuery(),
      disableTableOperations(),
      requireLogin(),
      requireCurrentUser(), // For updating single document, require current user
      update
    ) // update a document
    .delete(
      '/:collection/:documentId',
      disableSensitiveQuery(),
      disableTableOperations(),
      requireLogin(),
      requireCurrentUser(), // For deleting single document, require current user
      remove
    ) // remove a document
    .delete(
      '/:collection',
      disableSensitiveQuery(),
      disableTableOperations(),
      requireLogin(),
      requireAdmin(), // For deleting multiple documents, require admin. This helps prevent hackers who batch delete other documents
      removeMany
    ) // Remove multiple documents
    .post(
      '/:collection',
      disableSensitiveQuery(),
      disableTableOperations(),
      requireLogin(),
      create
    ) // create a document
    .post(
      '/:collection/createMany',
      disableSensitiveQuery(),
      disableTableOperations(),
      requireLogin(),
      createMany
    ) // create multiple documents
    .get(
      '/:collection',
      disableSensitiveQuery(),
      // requireLogin(),
      findMany
    ); // get documents of a collection

  return router;
};

export default router;
